from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.models import Customer
from .serializers import CustomerSerializer


class ConsultantViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='assignedcustomers')
    def get_customers(self, request):
        """Get all customers under the logged-in consultant"""
        if not hasattr(request.user, 'consultant'):
            return Response({"error": "You are not authorized to access this data."}, status=status.HTTP_403_FORBIDDEN)

        consultant = request.user.consultant  # Get consultant object
        customers = Customer.objects.filter(
            consultant=consultant, user__status__in=['active', 'inactive'], is_approved=2
        )

        serializer = CustomerSerializer(customers, many=True)
        return Response({
            "total_customers": customers.count(),
            "customers": serializer.data
        }, status=status.HTTP_200_OK)
