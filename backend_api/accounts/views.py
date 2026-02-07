# imports
from rest_framework.permissions import AllowAny
from .models import OTP, Customuser, Admin, Consultant, Customer
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.utils.timezone import now
from django.core.mail import send_mail
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_protect
from django.utils.crypto import get_random_string
from django.conf import settings
from django.contrib.sessions.models import Session
from django.utils.decorators import method_decorator
from django.utils import timezone
from .serializers import RegisterSerializer, OTPLoginSerializer, ProfileSerializer
from django.contrib.auth import BACKEND_SESSION_KEY
from django.contrib.auth.backends import ModelBackend
from axes.handlers.proxy import AxesProxyHandler

User = get_user_model()


class GetCSRFTokenView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # This automatically sets the 'csrftoken' cookie
        csrf_token = get_token(request)
        return JsonResponse({'message': 'CSRF token set successfully'})


@method_decorator(csrf_protect, name='dispatch')
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "User created successfully",
                "status": True,
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_protect, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from axes.handlers.proxy import AxesProxyHandler

        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(request, email=email, password=password)

        if user:
            otp_code = get_random_string(length=6, allowed_chars='0123456789')
            OTP.objects.update_or_create(
                user=user, defaults={'otp_code': otp_code, 'created_at': now()}
            )

            try:
                send_mail(
                    "OTP Login for Your App",
                    f"Your OTP Code: {otp_code}",
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                )
                return Response({"message": "OTP sent successfully"}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"message": f"Failed to send OTP: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Trigger Axes failure for logging/brute force protection
        AxesProxyHandler.user_login_failed(sender=None, credentials={
                                           "email": email}, request=request)

        return Response({"message": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)


@method_decorator(csrf_protect, name='dispatch')
class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get('email')
        otp_code = str(request.data.get('otp_code'))

        try:
            user = User.objects.filter(email=email).first()
            if user:
                otp_record = OTP.objects.filter(
                    user=user, otp_code=otp_code).first()

                if otp_record:
                    if not otp_record.is_expired():
                        user.last_login = now()
                        user.save(update_fields=['last_login'])
                        otp_record.delete()

                        # Explicitly assign backend
                        user.backend = 'django.contrib.auth.backends.ModelBackend'
                        login(request, user)

                        # Axes successful login tracking
                        AxesProxyHandler.user_logged_in(
                            sender=None, request=request, user=user)

                        return JsonResponse({"message": "OTP verified successfully"})

                    otp_record.delete()
                    return Response({"message": "OTP has expired. Please try again."}, status=status.HTTP_400_BAD_REQUEST)

                return Response({"message": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

            return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"message": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_protect, name='dispatch')
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)

        # Clean up cookies in response
        response = JsonResponse({"message": "Logged out successfully"})
        response.delete_cookie('sessionid')
        response.delete_cookie('csrftoken')

        return response


@method_decorator(csrf_protect, name='dispatch')
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = ProfileSerializer(user)
        return Response(serializer.data)


class SessionInfoView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        sessions = Session.objects.filter(expire_date__gte=timezone.now())
        session_info_list = []

        for session in sessions:
            try:
                session_data = session.get_decoded()
                user_id = session_data.get('_auth_user_id')

                if user_id:
                    try:
                        user = User.objects.get(id=user_id)
                        session_info_list.append({
                            "session_key": session.session_key,
                            "user_id": user_id,
                            "username": user.email,
                            "expire_date": session.expire_date,
                            "session_data": session_data
                        })
                    except User.DoesNotExist:
                        continue
            except Exception as e:
                continue

        return Response({"sessions": session_info_list})
