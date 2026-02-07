from rest_framework import serializers
from .models import Stock


class StockNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = ['stock_id', 'stock_name', 'stock_ticker']
