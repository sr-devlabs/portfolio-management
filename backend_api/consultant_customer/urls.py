from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConsultantViewSet

# Use a router to automatically generate URLs
router = DefaultRouter()
router.register(r'cons_cust', ConsultantViewSet, basename='cons_cust')

urlpatterns = [
    # This will include /api/consultants/assignedcustomers/
    path('', include(router.urls)),
]
