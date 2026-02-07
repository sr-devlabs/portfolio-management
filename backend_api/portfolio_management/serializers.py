from rest_framework import serializers
from .models import Portfolio
from stocks.models import Stock


class PortfolioSerializer(serializers.ModelSerializer):
    stock_id = serializers.IntegerField(required=True)
    quantity = serializers.IntegerField(required=True, min_value=1)
    purchase_price = serializers.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        model = Portfolio
        fields = ['stock_id', 'quantity', 'purchase_price']

    def create(self, validated_data):
        user = self.context['request'].user
        stock_id = validated_data['stock_id']
        quantity = validated_data['quantity']
        purchase_price = validated_data['purchase_price']
        total_price = quantity * purchase_price

        stock = Stock.objects.filter(stock_id=stock_id).first()
        if not stock:
            raise serializers.ValidationError({"error": "Stock not found"})

        portfolio, created = Portfolio.objects.get_or_create(
            user=user, stock=stock,
            defaults={'quantity': quantity, 'total_amount': total_price}
        )

        if not created:
            portfolio.quantity += quantity
            portfolio.total_amount += total_price
            portfolio.save()

        return portfolio


class UserPortfolioSerializer(serializers.ModelSerializer):
    stock_name = serializers.CharField(
        source="stock.stock_name", read_only=True)
    stock_ticker = serializers.CharField(
        source="stock.stock_ticker", read_only=True)
    stock_id = serializers.IntegerField(
        source="stock.stock_id", read_only=True)

    class Meta:
        model = Portfolio
        fields = ['stock_id', 'stock_name',
                  'stock_ticker', 'quantity', 'total_amount']
