from rest_framework import serializers
from accounts.models import Customer
from portfolio_management.models import Portfolio
from django.db.models import Sum


class CustomerSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='user.id')
    name = serializers.CharField(source='user.full_name')
    email = serializers.EmailField(source='user.email')
    last_login = serializers.DateTimeField(source='user.last_login')
    profile_photo = serializers.ImageField(source='user.profile_photo', allow_null=True)
    status = serializers.CharField(source='user.status')
    date_joined = serializers.DateTimeField(source='user.created_at')
    total_invested = serializers.SerializerMethodField()
    holdings_count = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = ['id', 'name', 'email', 'last_login', 'profile_photo', 'status', 'date_joined', 'total_invested', 'holdings_count']

    def get_total_invested(self, obj):
        total = Portfolio.objects.filter(user=obj.user).aggregate(Sum('total_amount'))['total_amount__sum']
        print(f"DEBUG: User {obj.user.email} (ID: {obj.user.id}) - Total Invested: {total}")
        return total if total else 0.00

    def get_holdings_count(self, obj):
        count = Portfolio.objects.filter(user=obj.user).count()
        print(f"DEBUG: User {obj.user.email} (ID: {obj.user.id}) - Holdings Count: {count}")
        return count
