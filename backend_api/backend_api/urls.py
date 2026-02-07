from django.contrib import admin
from django.urls import path, include
from accounts.views import RegisterView, LoginView, ProfileView, VerifyOTPView, LogoutView, GetCSRFTokenView, SessionInfoView
from django.http import JsonResponse
from django.views.generic import TemplateView
from consultant_customer.views import ConsultantViewSet


def custom_404(request, exception=None):
    return JsonResponse({"error": "API path not found. Please check the URL and try again."}, status=404)


def custom_500(request):
    return JsonResponse({"error": "Internal server error. Please try again later."}, status=500)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/get_csrf/', GetCSRFTokenView.as_view(), name='get_csrf'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('api/profile/', ProfileView.as_view(), name='profile'),
    path('api/sessions/', SessionInfoView.as_view(), name='sessions'),
    path('', include('stocks.urls')),
    path('api/', include('portfolio_management.urls')),
    path('api/', include('consultant_customer.urls')),
]
handler404 = 'backend_api.urls.custom_404'
handler500 = 'backend_api.urls.custom_500'
