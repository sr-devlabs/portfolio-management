from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_admin


class IsConsultant(BasePermission):
    def has_permission(self, request, view):
        # Only approved Consultants
        return request.user.is_consultant and request.user.consultant.is_approved == 2


class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_customer
