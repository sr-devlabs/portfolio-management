import random
import yfinance as yf
import time
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Stock
from .serializers import StockNameSerializer
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from django.http import JsonResponse
from rest_framework.permissions import AllowAny
from django.core.cache import cache


class AllStockNamesView(APIView):
    def get(self, request):
        stocks = Stock.objects.values(
            'stock_id', 'stock_name', 'stock_ticker').order_by('stock_name')
        return Response(stocks, status=status.HTTP_200_OK)


# def fetch_stock_data(request, ticker):
#     # Get interval and range from request, set defaults if not provided
#     interval = request.GET.get("interval", "1m")  # Default: 1 day
#     range_ = request.GET.get("range", "1d")  # Default: 1 month

#     # Construct the API URL with interval and range
#     url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval={interval}&range={range_}"

#     headers = {
#         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
#     }

#     # time.sleep(2)  # Add a delay of 2 seconds

#     response = requests.get(url, headers=headers)

#     if response.status_code == 200:
#         return JsonResponse(response.json(), safe=False)
#     elif response.status_code == 429:
#         return JsonResponse({"error": "Too many requests. Try again later."}, status=429)
#     else:
#         return JsonResponse({"error": "Failed to fetch data"}, status=response.status_code)


def fetch_stock_data(request, ticker):
    # 1. Configure Request Headers (Mimic Browser)
    headers = {
        "User-Agent": random.choice([
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
            "Mozilla/5.0 (X11; Linux x86_64)"
        ]),
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://finance.yahoo.com/",
        "Origin": "https://finance.yahoo.com",
    }

    # 2. Construct URL with Optional Query Params (Flexibility)
    interval = request.GET.get("interval", "1m")  # Default: 1 minute
    range_ = request.GET.get("range", "1d")      # Default: 1 day
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval={interval}&range={range_}"

    try:
        # 3. Add Rate-Limiting Delay (Prevent 429 Errors)
        time.sleep(1)  # 1-second delay between requests

        # 4. Send Request with Error Handling
        response = requests.get(url, headers=headers,
                                timeout=10)  # 10s timeout
        response.raise_for_status()  # Raise HTTP errors (4xx/5xx)

        # 5. Validate JSON Response
        if not response.text.strip():
            return JsonResponse({"error": "Empty response from Yahoo"}, status=502)

        json_data = response.json()
        if "chart" not in json_data:
            return JsonResponse({"error": "Invalid Yahoo response format"}, status=502)

        return JsonResponse(json_data)

    except requests.exceptions.RequestException as e:
        return JsonResponse({
            "error": f"Yahoo API request failed: {str(e)}",
            "status_code": getattr(e.response, "status_code", None)
        }, status=502)


currency_cache = {
    "timestamp": 0,
    "rates": {}
}

# Function to fetch exchange rates (EUR to other currencies)


def get_exchange_rates(cache_duration=86400):  # Cache for 1 day
    now = time.time()
    if currency_cache["rates"] and (now - currency_cache["timestamp"] < cache_duration):
        return currency_cache["rates"]

    response = requests.get("https://api.frankfurter.dev/v1/latest")
    data = response.json()
    currency_cache["rates"] = data["rates"]
    currency_cache["timestamp"] = now
    return currency_cache["rates"]

# Function to convert USD to INR using cached exchange rate


def convert_usd_to_inr(amount_usd):
    rates = get_exchange_rates()
    eur_to_usd = rates["USD"]
    eur_to_inr = rates["INR"]
    return (amount_usd / eur_to_usd) * eur_to_inr


def convert_to_indian_units(amount_inr):
    # Debug: Output INR value before converting
    print(f"INR Value Before Conversion: ₹{amount_inr}")

    # Check if the value is above 1 crore (₹10,000,000)
    if amount_inr >= 1e7:  # ₹1 crore = 10,000,000
        return f"₹{round(amount_inr / 1e7, 2)} Cr"  # Convert to Crores
    elif amount_inr >= 1e5:  # ₹1 lakh = 100,000
        return f"₹{round(amount_inr / 1e5, 2)} Lakh"  # Convert to Lakhs
    else:
        # If it's a smaller amount, just return the INR value
        return f"₹{round(amount_inr, 2)}"


def get_yahoo_session():
    """Create a session with robust headers and retry logic for Yahoo Finance."""
    session = requests.Session()
    
    # Randomize User-Agent to mimic real browsers
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    ]
    
    session.headers.update({
        "User-Agent": random.choice(user_agents),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://finance.yahoo.com/",
        "Origin": "https://finance.yahoo.com",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
    })

    # Retry strategy to handle 429s and server errors
    retry = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["HEAD", "GET", "OPTIONS"]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    
    return session


def get_company_data(request, ticker_symbol):
    
    try:
        # Initialize robust session
        session = get_yahoo_session()
        
        # Add random delay (0.5-2 seconds) to behave more human-like
        time.sleep(random.uniform(0.5, 2))

        # Pass custom session to yfinance
        ticker = yf.Ticker(ticker_symbol)
        
        # Fetch data - accessing .info triggers the request
        info = ticker.info

        # If info is empty or missing critical data, raise exception to trigger fallback/error
        if not info or 'regularMarketPrice' not in info:
             # Try fetching directly if yfinance generic fetch fails
            url = f"https://query2.finance.yahoo.com/v8/finance/chart/{ticker_symbol}"
            response = session.get(url, params={'range': '1d', 'interval': '5m'}, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if 'chart' in data and 'result' in data['chart'] and data['chart']['result']:
                     meta = data['chart']['result'][0]['meta']
                     info['regularMarketPrice'] = meta.get('regularMarketPrice')
                     info['currency'] = meta.get('currency')
                     # ... minimal populate to avoid total crash
            else:
                 raise ValueError("Empty response from yfinance and fallback")

        # Rest of your processing logic...

        # Rest of your processing logic...
        market_cap_usd = info.get('marketCap', 0)
        enterprise_value_usd = info.get('enterpriseValue', 0)
        # ... (keep all your existing conversion and formatting logic)

        return JsonResponse({
            "ticker": ticker_symbol.upper(),
            "fundamentals": fundamentals,
            "about": about
        })

    except Exception as e:
        # Fallback to cached data if available
        cache_key = f"company_{ticker_symbol}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return JsonResponse(cached_data)

        return JsonResponse({
            "error": str(e),
            "message": "Failed to fetch company data"
        }, status=400)


class NseStockDataView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        symbol = request.GET.get('symbol', 'RELIANCE')  # Default to RELIANCE

        # Configure session with proper headers and cookies
        session = requests.Session()
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Referer": "https://www.nseindia.com/get-quotes/equity?symbol=" + symbol,
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "X-Requested-With": "XMLHttpRequest",
        }

        try:
            # Step 1: First request to set cookies (visit homepage)
            session.get("https://www.nseindia.com", headers=headers)
            time.sleep(2)  # Critical: NSE needs delay between requests

            # Step 2: Fetch data
            url = f"https://www.nseindia.com/api/quote-equity?symbol={symbol}"
            response = session.get(url, headers=headers)

            if response.status_code == 200:
                return Response(response.json(), status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": f"NSE API Error: {response.status_code} - {response.text}"},
                    status=status.HTTP_502_BAD_GATEWAY
                )

        except Exception as e:
            return Response(
                {"error": f"Failed to fetch NSE data: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
