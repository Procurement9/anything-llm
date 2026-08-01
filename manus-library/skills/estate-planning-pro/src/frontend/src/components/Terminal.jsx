import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, RefreshCw, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { terminalAPI } from '../lib/api';

const Terminal = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [stockData, setStockData] = useState(null);
  const [marketData, setMarketData] = useState([]);
  const [news, setNews] = useState([]);
  const [secFilings, setSecFilings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [watchlist, setWatchlist] = useState(['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN']);

  // Fetch stock data
  const fetchStockData = async (symbol) => {
    setLoading(true);
    try {
      const response = await terminalAPI.getStockData(symbol);
      setStockData(response.data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch market data for watchlist
  const fetchMarketData = async () => {
    try {
      const response = await terminalAPI.getMarketData(watchlist.join(','));
      setMarketData(response.data);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  // Fetch financial news
  const fetchNews = async (query) => {
    try {
      const response = await terminalAPI.getNews(query || selectedSymbol);
      setNews(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  // Fetch SEC filings and comment letters
  const fetchSecFilings = async (symbol) => {
    try {
      const response = await terminalAPI.getSecFilings(symbol);
      setSecFilings(response.data);
    } catch (error) {
      console.error('Error fetching SEC filings:', error);
    }
  };

  useEffect(() => {
    fetchStockData(selectedSymbol);
    fetchMarketData();
    fetchNews(selectedSymbol);
    fetchSecFilings(selectedSymbol);

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchStockData(selectedSymbol);
      fetchMarketData();
    }, 60000); // Update every 60 seconds

    return () => clearInterval(interval);
  }, [selectedSymbol, watchlist]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSelectedSymbol(searchInput.toUpperCase());
      setSearchInput('');
    }
  };

  const handleAddToWatchlist = () => {
    if (selectedSymbol && !watchlist.includes(selectedSymbol)) {
      setWatchlist([...watchlist, selectedSymbol]);
    }
  };

  const handleRemoveFromWatchlist = (symbol) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  const getPriceChangeColor = (change) => {
    return change >= 0 ? '#00FF00' : '#FF0000';
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      {/* Header */}
      <div className="mb-6 border-b border-gray-700 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-green-500">⟐ TERMINAL</div>
            <span className="text-xs text-gray-500">v1.0 ESTATE MARKET DATA</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchStockData(selectedSymbol);
                fetchMarketData();
              }}
              className="bg-gray-900 border-green-500 text-green-400 hover:bg-green-500 hover:text-black"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-900 border-green-500 text-green-400 hover:bg-green-500 hover:text-black"
            >
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter symbol (e.g., AAPL, MSFT)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="bg-gray-900 border-green-500 text-green-400 placeholder-gray-600"
          />
          <Button
            type="submit"
            className="bg-green-600 text-black hover:bg-green-500"
          >
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Stock Details */}
        <div className="lg:col-span-2">
          {stockData && (
            <Card className="bg-gray-950 border-green-500 mb-4">
              <CardHeader className="border-b border-green-500">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-green-400 text-2xl">
                      {stockData.symbol}
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      {stockData.company_name}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-400">
                      ${stockData.current_price?.toFixed(2)}
                    </div>
                    <div
                      style={{
                        color: getPriceChangeColor(stockData.price_change)
                      }}
                      className="text-lg font-semibold"
                    >
                      {stockData.price_change >= 0 ? '+' : ''}
                      {stockData.price_change?.toFixed(2)} ({stockData.price_change_percent?.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="border border-gray-700 p-3">
                    <div className="text-gray-500 text-xs">OPEN</div>
                    <div className="text-green-400 font-bold">
                      ${stockData.open_price?.toFixed(2)}
                    </div>
                  </div>
                  <div className="border border-gray-700 p-3">
                    <div className="text-gray-500 text-xs">HIGH</div>
                    <div className="text-green-400 font-bold">
                      ${stockData.day_high?.toFixed(2)}
                    </div>
                  </div>
                  <div className="border border-gray-700 p-3">
                    <div className="text-gray-500 text-xs">LOW</div>
                    <div className="text-green-400 font-bold">
                      ${stockData.day_low?.toFixed(2)}
                    </div>
                  </div>
                  <div className="border border-gray-700 p-3">
                    <div className="text-gray-500 text-xs">VOLUME</div>
                    <div className="text-green-400 font-bold">
                      {(stockData.volume / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div className="border border-gray-700 p-3">
                    <div className="text-gray-500 text-xs">MARKET CAP</div>
                    <div className="text-green-400 font-bold">
                      ${(stockData.market_cap / 1000000000).toFixed(1)}B
                    </div>
                  </div>
                  <div className="border border-gray-700 p-3">
                    <div className="text-gray-500 text-xs">P/E RATIO</div>
                    <div className="text-green-400 font-bold">
                      {stockData.pe_ratio?.toFixed(2)}
                    </div>
                  </div>
                  <div className="border border-gray-700 p-3">
                    <div className="text-gray-500 text-xs">52W HIGH</div>
                    <div className="text-green-400 font-bold">
                      ${stockData.fifty_two_week_high?.toFixed(2)}
                    </div>
                  </div>
                  <div className="border border-gray-700 p-3">
                    <div className="text-gray-500 text-xs">52W LOW</div>
                    <div className="text-green-400 font-bold">
                      ${stockData.fifty_two_week_low?.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs for different views */}
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="bg-gray-900 border-b border-green-500">
              <TabsTrigger value="chart" className="data-[state=active]:text-green-400">
                CHART
              </TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:text-green-400">
                ANALYSIS
              </TabsTrigger>
              <TabsTrigger value="news" className="data-[state=active]:text-green-400">
                NEWS
              </TabsTrigger>
              <TabsTrigger value="sec" className="data-[state=active]:text-green-400">
                SEC FILINGS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="mt-4">
              <Card className="bg-gray-950 border-green-500">
                <CardContent className="pt-6">
                  <div className="h-64 bg-gray-900 border border-green-500 flex items-center justify-center text-gray-500">
                    [CHART VISUALIZATION - Real-time price data would display here]
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="mt-4">
              <Card className="bg-gray-950 border-green-500">
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                      <span className="text-gray-500">Technical Outlook (Short-term)</span>
                      <span className="text-amber-400">NEUTRAL</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                      <span className="text-gray-500">Technical Outlook (Intermediate)</span>
                      <span className="text-green-400">BULLISH</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                      <span className="text-gray-500">Valuation</span>
                      <span className="text-amber-400">MODERATE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Recommendation</span>
                      <span className="text-green-400">HOLD</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="news" className="mt-4">
              <Card className="bg-gray-950 border-green-500">
                <CardContent className="pt-6">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {news.length > 0 ? (
                      news.map((item, idx) => (
                        <div
                          key={idx}
                          className="border-l-2 border-green-500 pl-3 pb-3 text-xs"
                        >
                          <div className="text-green-400 font-semibold truncate">
                            {item.title}
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            {item.source} • {item.timestamp}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 text-center py-4">
                        No news available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sec" className="mt-4">
              <Card className="bg-gray-950 border-green-500">
                <CardHeader className="border-b border-green-500">
                  <CardTitle className="text-green-400 text-lg">SEC FILINGS & COMMENT LETTERS</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {secFilings ? (
                    <div className="space-y-4">
                      {/* Comment Letters Section */}
                      {secFilings.comment_letters && secFilings.comment_letters.length > 0 && (
                        <div>
                          <div className="text-amber-400 font-bold text-sm mb-2">
                            ⚠ COMMENT LETTERS ({secFilings.comment_letters.length})
                          </div>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {secFilings.comment_letters.map((filing, idx) => (
                              <div key={idx} className="border-l-2 border-amber-500 pl-3 pb-2 text-xs">
                                <div className="text-amber-400 font-semibold">
                                  {filing.title}
                                </div>
                                <div className="text-gray-500 text-xs mt-1">
                                  {filing.date} • {filing.type}
                                </div>
                                {filing.edgarUrl && (
                                  <a href={filing.edgarUrl} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline text-xs mt-1 inline-block">
                                    View Filing →
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Regular Filings Section */}
                      {secFilings.regular_filings && secFilings.regular_filings.length > 0 && (
                        <div>
                          <div className="text-green-400 font-bold text-sm mb-2 mt-4">
                            📋 RECENT FILINGS ({secFilings.regular_filings.length})
                          </div>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {secFilings.regular_filings.map((filing, idx) => (
                              <div key={idx} className="border-l-2 border-green-500 pl-3 pb-2 text-xs">
                                <div className="text-green-400 font-semibold">
                                  [{filing.type}] {filing.title}
                                </div>
                                <div className="text-gray-500 text-xs mt-1">
                                  {filing.date}
                                </div>
                                {filing.edgarUrl && (
                                  <a href={filing.edgarUrl} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline text-xs mt-1 inline-block">
                                    View Filing →
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!secFilings.comment_letters?.length && !secFilings.regular_filings?.length && (
                        <div className="text-gray-500 text-center py-4">
                          No SEC filings found
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      Loading SEC filings...
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Watchlist */}
        <div>
          <Card className="bg-gray-950 border-green-500">
            <CardHeader className="border-b border-green-500">
              <CardTitle className="text-green-400">WATCHLIST</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {marketData.length > 0 ? (
                  marketData.map((stock) => (
                    <div
                      key={stock.symbol}
                      onClick={() => setSelectedSymbol(stock.symbol)}
                      className={`p-2 border border-gray-700 cursor-pointer hover:border-green-500 transition-colors ${
                        selectedSymbol === stock.symbol ? 'border-green-500 bg-gray-900' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-green-400 text-sm">
                          {stock.symbol}
                        </div>
                        <div
                          style={{
                            color: getPriceChangeColor(stock.price_change)
                          }}
                          className="text-xs font-semibold"
                        >
                          {stock.price_change >= 0 ? '▲' : '▼'}
                          {Math.abs(stock.price_change_percent).toFixed(2)}%
                        </div>
                      </div>
                      <div className="text-green-400 text-xs mt-1">
                        ${stock.current_price?.toFixed(2)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromWatchlist(stock.symbol);
                        }}
                        className="text-xs text-red-400 hover:text-red-300 mt-1 h-6"
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    Loading watchlist...
                  </div>
                )}
              </div>

              <Button
                onClick={handleAddToWatchlist}
                className="w-full mt-4 bg-green-600 text-black hover:bg-green-500"
              >
                Add {selectedSymbol} to Watchlist
              </Button>
            </CardContent>
          </Card>

          {/* Market Indices */}
          <Card className="bg-gray-950 border-green-500 mt-4">
            <CardHeader className="border-b border-green-500">
              <CardTitle className="text-green-400 text-sm">MARKET INDICES</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">S&P 500</span>
                  <span className="text-green-400">5,234.80 ▲ 0.45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">NASDAQ</span>
                  <span className="text-green-400">16,892.30 ▲ 0.62%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">DOW JONES</span>
                  <span className="text-red-400">38,234.50 ▼ -0.12%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
