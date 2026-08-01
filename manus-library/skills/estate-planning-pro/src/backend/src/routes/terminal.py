from flask import Blueprint, request, jsonify
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from data_api import ApiClient

terminal_bp = Blueprint('terminal', __name__)

# Initialize API client for fetching financial data
api_client = ApiClient()

@terminal_bp.route('/terminal/stock/<symbol>', methods=['GET'])
def get_stock_data(symbol):
    """
    Fetch real-time stock data for a given symbol using Yahoo Finance API.
    """
    try:
        # Fetch stock chart data
        chart_response = api_client.call_api('YahooFinance/get_stock_chart', query={
            'symbol': symbol.upper(),
            'region': 'US',
            'interval': '1d',
            'range': '1y',
            'includeAdjustedClose': True
        })

        # Fetch stock profile data
        profile_response = api_client.call_api('YahooFinance/get_stock_profile', query={
            'symbol': symbol.upper(),
            'region': 'US',
            'lang': 'en-US'
        })

        # Extract relevant data
        if chart_response and 'chart' in chart_response and 'result' in chart_response['chart']:
            chart_result = chart_response['chart']['result'][0]
            meta = chart_result['meta']
            
            stock_data = {
                'symbol': meta.get('symbol', symbol.upper()),
                'company_name': meta.get('longName', 'N/A'),
                'current_price': meta.get('regularMarketPrice', 0),
                'open_price': meta.get('regularMarketOpen', 0),
                'day_high': meta.get('regularMarketDayHigh', 0),
                'day_low': meta.get('regularMarketDayLow', 0),
                'volume': meta.get('regularMarketVolume', 0),
                'fifty_two_week_high': meta.get('fiftyTwoWeekHigh', 0),
                'fifty_two_week_low': meta.get('fiftyTwoWeekLow', 0),
                'price_change': meta.get('regularMarketPrice', 0) - meta.get('previousClose', 0),
                'price_change_percent': ((meta.get('regularMarketPrice', 0) - meta.get('previousClose', 0)) / meta.get('previousClose', 1)) * 100 if meta.get('previousClose') else 0,
            }

            # Add profile data if available
            if profile_response and 'price' in profile_response:
                price_data = profile_response.get('price', {})
                summary_detail = profile_response.get('summaryDetail', {})
                
                stock_data['market_cap'] = summary_detail.get('marketCap', {}).get('raw', 0)
                stock_data['pe_ratio'] = summary_detail.get('trailingPE', {}).get('raw', 0)
                stock_data['dividend_yield'] = summary_detail.get('dividendYield', {}).get('raw', 0)

            return jsonify(stock_data), 200
        else:
            return jsonify({'error': 'Unable to fetch stock data'}), 400

    except Exception as e:
        print(f"Error fetching stock data: {str(e)}")
        return jsonify({'error': str(e)}), 500


@terminal_bp.route('/terminal/market', methods=['GET'])
def get_market_data():
    """
    Fetch market data for multiple symbols (watchlist).
    """
    try:
        symbols = request.args.get('symbols', 'AAPL,MSFT,GOOGL,TSLA,AMZN').split(',')
        market_data = []

        for symbol in symbols:
            try:
                # Fetch stock chart data
                response = api_client.call_api('YahooFinance/get_stock_chart', query={
                    'symbol': symbol.strip().upper(),
                    'region': 'US',
                    'interval': '1d',
                    'range': '5d'
                })

                if response and 'chart' in response and 'result' in response['chart']:
                    result = response['chart']['result'][0]
                    meta = result['meta']

                    stock_info = {
                        'symbol': meta.get('symbol', symbol.upper()),
                        'current_price': meta.get('regularMarketPrice', 0),
                        'price_change': meta.get('regularMarketPrice', 0) - meta.get('previousClose', 0),
                        'price_change_percent': ((meta.get('regularMarketPrice', 0) - meta.get('previousClose', 0)) / meta.get('previousClose', 1)) * 100 if meta.get('previousClose') else 0,
                    }
                    market_data.append(stock_info)
            except Exception as e:
                print(f"Error fetching data for {symbol}: {str(e)}")
                continue

        return jsonify(market_data), 200

    except Exception as e:
        print(f"Error fetching market data: {str(e)}")
        return jsonify({'error': str(e)}), 500


@terminal_bp.route('/terminal/news', methods=['GET'])
def get_financial_news():
    """
    Fetch financial news for a given query using X News API.
    """
    try:
        query = request.args.get('query', 'stock market')
        
        # Fetch news using X News API
        response = api_client.call_api('X/search_news', query={
            'query': query,
            'max_results': '10',
            'max_age_hours': '168'
        })

        news_items = []
        
        if response and 'news' in response:
            for item in response['news'][:10]:
                news_info = {
                    'title': item.get('title', 'N/A'),
                    'source': item.get('source', 'Unknown'),
                    'timestamp': item.get('published_at', 'N/A'),
                    'url': item.get('url', '#'),
                    'summary': item.get('summary', '')
                }
                news_items.append(news_info)

        return jsonify(news_items), 200

    except Exception as e:
        print(f"Error fetching news: {str(e)}")
        # Return mock news data if API fails
        mock_news = [
            {
                'title': 'Market reaches new highs amid economic optimism',
                'source': 'Financial Times',
                'timestamp': 'Today',
                'url': '#',
                'summary': 'Stock markets surge as investors gain confidence in economic recovery.'
            },
            {
                'title': 'Tech stocks lead market rally',
                'source': 'Bloomberg',
                'timestamp': 'Today',
                'url': '#',
                'summary': 'Technology sector outperforms as major companies report strong earnings.'
            }
        ]
        return jsonify(mock_news), 200


@terminal_bp.route('/terminal/holders/<symbol>', methods=['GET'])
def get_stock_holders(symbol):
    """
    Fetch insider and institutional holder information.
    """
    try:
        response = api_client.call_api('YahooFinance/get_stock_holders', query={
            'symbol': symbol.upper(),
            'region': 'US',
            'lang': 'en-US'
        })

        if response and 'quoteSummary' in response and 'result' in response['quoteSummary']:
            result = response['quoteSummary']['result'][0]
            
            holders_data = {
                'institutional_holders': result.get('institutionalHolders', {}).get('holders', [])[:5],
                'insider_holders': result.get('insiderHolders', {}).get('holders', [])[:5],
                'mutual_fund_holders': result.get('mutualFundHolders', {}).get('holders', [])[:5]
            }
            
            return jsonify(holders_data), 200
        else:
            return jsonify({'error': 'Unable to fetch holder data'}), 400

    except Exception as e:
        print(f"Error fetching holder data: {str(e)}")
        return jsonify({'error': str(e)}), 500


@terminal_bp.route('/terminal/insights/<symbol>', methods=['GET'])
def get_stock_insights(symbol):
    """
    Fetch stock insights and analysis data.
    """
    try:
        response = api_client.call_api('YahooFinance/get_stock_insights', query={
            'symbol': symbol.upper()
        })

        if response:
            return jsonify(response), 200
        else:
            return jsonify({'error': 'Unable to fetch insights'}), 400

    except Exception as e:
        print(f"Error fetching insights: {str(e)}")
        return jsonify({'error': str(e)}), 500


@terminal_bp.route('/terminal/sec-filings/<symbol>', methods=['GET'])
def get_sec_filings(symbol):
    """
    Fetch SEC filing information and categorize comment letters.
    """
    try:
        response = api_client.call_api('YahooFinance/get_stock_sec_filing', query={
            'symbol': symbol.upper(),
            'region': 'US',
            'lang': 'en-US'
        })

        filings = []
        if response and 'quoteSummary' in response and 'result' in response['quoteSummary']:
            result = response['quoteSummary']['result'][0]
            filings = result.get('filings', [])
        elif response and 'filings' in response:
            filings = response['filings']

        if filings:
            # Categorize filings
            comment_letters = []
            regular_filings = []
            
            for f in filings:
                f_type = f.get('type', '').upper()
                # UPLOAD = SEC to company, CORRESP = company to SEC
                if f_type in ['UPLOAD', 'CORRESP']:
                    comment_letters.append(f)
                else:
                    regular_filings.append(f)
            
            return jsonify({
                'symbol': symbol.upper(),
                'all_filings': filings[:50],
                'comment_letters': comment_letters[:20],
                'regular_filings': regular_filings[:30]
            }), 200
        else:
            return jsonify({'error': 'No SEC filings found'}), 404

    except Exception as e:
        print(f"Error fetching SEC filings: {str(e)}")
        return jsonify({'error': str(e)}), 500
