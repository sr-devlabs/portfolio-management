from .views import NseStockDataView
from .views import fetch_stock_data
from django.urls import path
from .views import AllStockNamesView
from .views import get_company_data

urlpatterns = [
    path('api/all_stock_names/', AllStockNamesView.as_view(), name='all_stock_names'),
    path("api/proxy/yahoo/<str:ticker>/",
         fetch_stock_data, name="proxy_stock_data"),
    path("api/company/<str:ticker_symbol>/", get_company_data),
    path('api/nse-stock-data/', NseStockDataView.as_view(), name='nse-stock-data'),
]
