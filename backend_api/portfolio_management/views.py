from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Portfolio
from accounts.models import Customer
from stocks.models import Stock
from .serializers import PortfolioSerializer, UserPortfolioSerializer

User = get_user_model()


# class PortfolioViewSet(viewsets.ModelViewSet):
#     queryset = Portfolio.objects.all()
#     serializer_class = PortfolioSerializer
#     permission_classes = [IsAuthenticated]

#     @action(detail=False, methods=['post'])
#     def add_stock_to_portfolio(self, request):
#         serializer = PortfolioSerializer(
#             data=request.data, context={'request': request})
#         if serializer.is_valid():
#             stock = serializer.save()
#             return Response({
#                 "stock_name": stock.stock.stock_name,
#                 "stock_ticker": stock.stock.stock_ticker,
#                 "total_quantity": stock.quantity,
#                 "total_amount": stock.total_amount
#             }, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     @action(detail=False, methods=['delete'], url_path='remove_stock/(?P<stock_id>[^/.]+)')
#     def remove_stock_from_portfolio(self, request, stock_id=None):
#         """Remove stock from customer's portfolio"""
#         if not request.user.is_customer:
#             return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

#         stock = Stock.objects.filter(stock_id=stock_id).first()
#         if not stock:
#             return Response({"error": "Stock not found."}, status=status.HTTP_404_NOT_FOUND)

#         portfolio_item = Portfolio.objects.filter(
#             user=request.user, stock=stock).first()
#         if not portfolio_item:
#             return Response({"error": "Stock not in portfolio."}, status=status.HTTP_400_BAD_REQUEST)

#         portfolio_item.delete()
#         return Response({"message": f"Stock '{stock.stock_name}' removed from your portfolio."}, status=status.HTTP_200_OK)

#     @action(detail=False, methods=['get'])
#     def get_user_portfolio(self, request):
#         portfolio = Portfolio.objects.filter(user=request.user)
#         serializer = UserPortfolioSerializer(portfolio, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     @action(detail=False, methods=['get'], url_path='customer_portfolio/(?P<user_id>[^/.]+)')
#     def customer_portfolio(self, request, user_id=None):
#         # Ensure the requesting user is a Consultant
#         if request.user.is_consultant:
#             # Find the customer using user_id (which is a foreign key to User model)
#             customer = Customer.objects.filter(
#                 user_id=user_id, consultant__user=request.user).first()

#             if not customer:
#                 return Response({"error": "Customer not found or not under your supervision."}, status=status.HTTP_404_NOT_FOUND)

#             # Fetch the portfolio linked to this customer
#             portfolio = Portfolio.objects.filter(user=customer.user)

#             if not portfolio.exists():
#                 return Response({"error": "Portfolio not found."}, status=status.HTTP_404_NOT_FOUND)

#             # Serialize the portfolio data
#             serializer = UserPortfolioSerializer(portfolio, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)

#         # If the user is not a consultant
#         return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
class PortfolioViewSet(viewsets.ModelViewSet):
    queryset = Portfolio.objects.all()
    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def get_user_portfolio(self, request):
        portfolio = Portfolio.objects.filter(user=request.user)
        serializer = UserPortfolioSerializer(portfolio, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def add_to_portfolio(self, request):
        """Buy stock and add to portfolio"""
        serializer = PortfolioSerializer(
            data=request.data, context={'request': request})
        if serializer.is_valid():
            stock = serializer.save()
            return Response({
                "stock_id": stock.stock.stock_id,
                "stock_name": stock.stock.stock_name,
                "stock_ticker": stock.stock.stock_ticker,
                "quantity": stock.quantity,
                "total_amount": stock.total_amount
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='sell_stock')
    def remove_from_portfolio(self, request):
        """Sell stock from portfolio"""
        stock_id = request.data.get('stock_id')
        quantity = request.data.get('quantity')

        if not stock_id or not quantity:
            return Response({"error": "Stock ID and quantity are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            stock = Stock.objects.get(stock_id=stock_id)
            portfolio_item = Portfolio.objects.get(
                user=request.user, stock=stock)

            if portfolio_item.quantity < quantity:
                return Response({"error": "Not enough shares to sell."},
                                status=status.HTTP_400_BAD_REQUEST)

            # Update or delete portfolio item
            if portfolio_item.quantity == quantity:
                portfolio_item.delete()
            else:
                portfolio_item.quantity -= quantity
                portfolio_item.total_amount -= quantity * \
                    (portfolio_item.total_amount / portfolio_item.quantity)
                portfolio_item.save()

            return Response({
                "message": f"Successfully sold {quantity} shares of {stock.stock_name}",
                "stock_id": stock.stock_id,
                "remaining_quantity": portfolio_item.quantity if portfolio_item.quantity > quantity else 0
            }, status=status.HTTP_200_OK)

        except Stock.DoesNotExist:
            return Response({"error": "Stock not found."},
                            status=status.HTTP_404_NOT_FOUND)
        except Portfolio.DoesNotExist:
            return Response({"error": "Stock not in your portfolio."},
                            status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='customer_portfolio/(?P<user_id>[^/.]+)')
    def customer_portfolio(self, request, user_id=None):
        if request.user.is_consultant:
            customer = Customer.objects.filter(
                user_id=user_id, consultant__user=request.user).first()

            if not customer:
                return Response({"error": "Customer not found or not under your supervision."}, status=status.HTTP_404_NOT_FOUND)

            # Fetch the portfolio linked to this customer
            portfolio = Portfolio.objects.filter(user=customer.user)

            if not portfolio.exists():
                return Response({"error": "Portfolio not found."}, status=status.HTTP_404_NOT_FOUND)

            # Serialize the portfolio data
            serializer = UserPortfolioSerializer(portfolio, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # If the user is not a consultant
        return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
