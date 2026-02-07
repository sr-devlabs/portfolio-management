// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import axiosInstance from "../api/axiosInstance";
// import StockChart from "../components/StockChart";
// import StockSummary from "../components/Customer/tabs/StockSummary";
// import StockFinancials from "../components/Customer/tabs/StockFinancials";
// import StockSuggestions from "../components/Customer/tabs/StockSuggestions";
// import StockNews from "../components/Customer/tabs/StockNews";
// import CompanyInfoCard from "../components/Customer/tabs/CompanyInfoCard";
// import StockFundamentals from "../components/Customer/tabs/StockFundamentals";
// import { Bookmark, CandlestickChart, LineChart } from "lucide-react";
// import BuyModal from "../components/BuyModal";

// const StockDetails = () => {
//     const { stockTicker: ticker } = useParams();
//     const [chartType, setChartType] = useState("candlestick");
//     const [selectedRange, setSelectedRange] = useState("1d");
//     const [selectedInterval, setSelectedInterval] = useState("5m");
//     const [showBuyModal, setShowBuyModal] = useState(false);
//     const [stockInfo, setStockInfo] = useState(null);
//     const [exchange, setExchange] = useState("NSE"); // NSE or BSE
//     const [liveData, setLiveData] = useState(null);
//     const [meta, setMeta] = useState(null);

//     const intervals = {
//         "1d": ["1m", "2m", "5m", "15m", "30m", "60m", "90m"],
//         "5d": ["5m", "15m", "30m", "60m", "90m"],
//         "1mo": ["1d"],
//         "3mo": ["1d"],
//         "6mo": ["1d", "1wk"],
//         "1y": ["1d", "1wk"],
//         "2y": ["1wk", "1mo"],
//         "5y": ["1wk", "1mo"],
//         "max": ["1mo"]
//     };

//     // Fetch company info (static data)
//     const { data: companyData, isLoading, error } = useQuery({
//         queryKey: ["company-info", ticker],
//         queryFn: async () => {
//             const res = await axiosInstance.get(`company/${ticker}/`);
//             setStockInfo({
//                 stock_id: res.data.about?.id,
//                 stock_name: res.data.about?.name,
//                 stock_ticker: ticker
//             });
//             return res.data;
//         },
//         retry: 1,
//         enabled: !!ticker,
//     });

//     // Fetch live data separately from the chart
//     const fetchLiveData = async () => {
//         try {
//             const suffix = exchange === "NSE" ? ".NS" : ".BO";
//             const tickerNew = ticker.replace(/\.(NS|BO)$/, '');
//             const res = await axiosInstance.get(`/proxy/yahoo/${tickerNew}${suffix}/`, {
//                 params: {
//                     interval: "1m",
//                     range: "1d"
//                 },
//             });

//             const result = res.data.chart?.result?.[0];
//             if (!result) return;
//             setMeta(result.meta || {});

//             const timestamps = result.timestamp || [];
//             const quotes = result.indicators?.quote?.[0] || {};
//             const lastIndex = timestamps.length - 1;

//             if (lastIndex < 0) return;

//             setLiveData({
//                 open: quotes.open?.[lastIndex] ?? 0,
//                 close: quotes.close?.[lastIndex] ?? 0,
//                 high: quotes.high?.[lastIndex] ?? 0,
//                 low: quotes.low?.[lastIndex] ?? 0,
//                 volume: quotes.volume?.[lastIndex] ?? 0,
//                 timestamp: timestamps[lastIndex] ? Math.floor(timestamps[lastIndex]) : 0,
//             });
//         } catch (err) {
//             console.error("Live data fetch error:", err);
//         }
//     };

//     useEffect(() => {
//         fetchLiveData();
//         const interval = setInterval(fetchLiveData, 5000);
//         return () => clearInterval(interval);
//     }, [ticker, exchange]);

//     if (isLoading) return <div className="text-center">Loading...</div>;
//     if (error) return <div className="alert alert-danger">Error: {error.message}</div>;
//     if (!companyData) return <div className="text-center">No data found</div>;

//     return (
//         <div className="container py-4">
//             <div className="row d-flex justify-content-between">
//                 <div className="col-12 col-lg-8">
//                     <div className="row align-items-center mb-4">
//                         <div className="col-12 col-md-6 d-flex align-items-center gap-2">
//                             <h2 className="mb-0 fs-5">{companyData.about?.name || 'stockName'}</h2>
//                         </div>
//                         <div className="col-12 col-md-6 mt-3 mt-md-0 text-md-end">
//                             <button
//                                 className="btn btn-outline-secondary d-flex align-items-center gap-2"
//                                 onClick={() => setShowBuyModal(true)}
//                             >
//                                 <Bookmark size={18} />
//                                 Watchlist
//                             </button>
//                         </div>
//                     </div>

//                     {/* Summary */}
//                     <StockSummary stockData={companyData} />

//                     {/* Live Data */}
//                     <div className="stock-info mb-4 p-3 rounded shadow-sm" style={{
//                         backgroundColor: "#F9FCFF",
//                         border: "1px solid #081F5C"
//                     }}>
//                         {liveData ? (
//                             <div className="row text-center">
//                                 <div className="col-6 col-md-3 mb-3 mb-md-0">
//                                     <small style={{ color: "#081F5C" }}>Open</small>
//                                     <div className="fw-semibold" style={{ color: "#081F5C" }}>
//                                         {liveData.open.toFixed(2)}
//                                     </div>
//                                 </div>
//                                 <div className="col-6 col-md-3 mb-3 mb-md-0">
//                                     <small style={{ color: "#081F5C" }}>Prev. Close</small>
//                                     <div className="fw-semibold" style={{ color: "#081F5C" }}>
//                                         {meta.previousClose.toFixed(2)}
//                                     </div>
//                                 </div>
//                                 <div className="col-6 col-md-3 mb-3 mb-md-0">
//                                     <small style={{ color: "#081F5C" }}>Volume</small>
//                                     <div className="fw-semibold" style={{ color: "#081F5C" }}>
//                                         {liveData.volume.toLocaleString('en-IN')}
//                                     </div>
//                                 </div>
//                                 <div className="col-6 col-md-3 mb-3 mb-md-0">
//                                     <small style={{ color: "#081F5C" }}>Total traded value</small>
//                                     <div className="fw-semibold" style={{ color: "#081F5C" }}>
//                                         {(liveData.volume * liveData.close).toLocaleString('en-IN', {
//                                             style: 'currency',
//                                             currency: 'INR',
//                                             minimumFractionDigits: 0,
//                                             maximumFractionDigits: 0
//                                         })}
//                                     </div>
//                                 </div>
//                             </div>
//                         ) : (
//                             <div className="text-muted">Loading live stock data...</div>
//                         )}
//                     </div>

//                     {/* Circuit Info */}
//                     {/* <div className="row mb-4">
//                         <div className="col-6">
//                             <div className="card h-100">
//                                 <div className="card-body text-center">
//                                     <h6 className="card-title text-danger">Upper Circuit</h6>
//                                     <p className="card-text fs-5 fw-bold">
//                                         {liveData ? (liveData.close * 1.2).toFixed(2) : '--'}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="col-6">
//                             <div className="card h-100">
//                                 <div className="card-body text-center">
//                                     <h6 className="card-title text-success">Lower Circuit</h6>
//                                     <p className="card-text fs-5 fw-bold">
//                                         {liveData ? (liveData.close * 0.8).toFixed(2) : '--'}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div> */}

//                     {/* Time Range Buttons */}
//                     <div className="d-flex flex-wrap gap-2 mb-3 overflow-auto">
//                         {Object.keys(intervals).map((range) => (
//                             <button
//                                 key={range}
//                                 className={`btn btn-sm ${selectedRange === range ? "btn-primary" : "btn-outline-secondary"}`}
//                                 onClick={() => {
//                                     setSelectedRange(range);
//                                     setSelectedInterval(intervals[range][0]);
//                                 }}
//                             >
//                                 {range.toUpperCase()}
//                             </button>
//                         ))}
//                     </div>

//                     {/* Interval Buttons */}
//                     {intervals[selectedRange] && (
//                         <div className="d-flex flex-wrap gap-2 mb-4 overflow-auto">
//                             {intervals[selectedRange].map((interval) => (
//                                 <button
//                                     key={interval}
//                                     className={`btn btn-sm ${selectedInterval === interval ? "btn-primary" : "btn-outline-secondary"}`}
//                                     onClick={() => setSelectedInterval(interval)}
//                                 >
//                                     {interval}
//                                 </button>
//                             ))}
//                         </div>
//                     )}

//                     {/* Chart Controls */}
//                     <div className="d-flex flex-wrap gap-2 mb-3">
//                         <div className="btn-group">
//                             <button
//                                 className={`btn btn-sm ${exchange === "NSE" ? "btn-primary" : "btn-outline-secondary"}`}
//                                 onClick={() => setExchange("NSE")}
//                             >
//                                 NSE
//                             </button>
//                             <button
//                                 className={`btn btn-sm ${exchange === "BSE" ? "btn-primary" : "btn-outline-secondary"}`}
//                                 onClick={() => setExchange("BSE")}
//                             >
//                                 BSE
//                             </button>
//                         </div>
//                         <div className="btn-group">
//                             <button
//                                 className={`btn btn-sm ${chartType === "line" ? "btn-primary" : "btn-outline-secondary"} d-flex align-items-center gap-1`}
//                                 onClick={() => setChartType("line")}
//                             >
//                                 <LineChart size={16} />
//                                 Line
//                             </button>
//                             <button
//                                 className={`btn btn-sm ${chartType === "candlestick" ? "btn-primary" : "btn-outline-secondary"} d-flex align-items-center gap-1`}
//                                 onClick={() => setChartType("candlestick")}
//                             >
//                                 <CandlestickChart size={16} />
//                                 Candle
//                             </button>
//                         </div>
//                     </div>

//                     {/* Chart */}
//                     <div className="mb-4">
//                         <StockChart
//                             ticker={ticker}
//                             selectedRange={selectedRange}
//                             selectedInterval={selectedInterval}
//                             chartType={chartType}
//                             exchange={exchange}
//                         />
//                     </div>

//                     {/* Additional Tabs */}
//                     <StockFinancials ticker={ticker} data={companyData} />
//                     <StockSuggestions ticker={ticker} data={companyData} />
//                     <StockNews ticker={ticker} data={companyData} />
//                 </div>

//                 {/* RIGHT SIDEBAR */}
//                 <div className="col-12 col-lg-4" style={{ maxWidth: "320px" }}>
//                     <div className="mb-4 sidebar-box">
//                         <StockFundamentals fundamentals={companyData.fundamentals} />
//                     </div>
//                     <div className="mb-4 sidebar-box">
//                         <CompanyInfoCard about={companyData.about} ticker={companyData.ticker} />
//                     </div>
//                 </div>
//             </div>

//             {/* Buy Modal */}
//             {showBuyModal && stockInfo && (
//                 <BuyModal
//                     stock={stockInfo}
//                     onClose={() => setShowBuyModal(false)}
//                     onSuccess={() => setShowBuyModal(false)}
//                 />
//             )}
//         </div>
//     );
// };

// export default StockDetails;

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import StockChart from "../components/StockChart";
import StockSummary from "../components/Customer/tabs/StockSummary";
import StockFinancials from "../components/Customer/tabs/StockFinancials";
import StockSuggestions from "../components/Customer/tabs/StockSuggestions";
import StockNews from "../components/Customer/tabs/StockNews";
import CompanyInfoCard from "../components/Customer/tabs/CompanyInfoCard";
import StockFundamentals from "../components/Customer/tabs/StockFundamentals";
import { Bookmark, CandlestickChart, LineChart, ArrowUp, ArrowDown } from "lucide-react";
import BuyModal from "../components/BuyModal";

const StockDetails = () => {
    const { stockTicker: ticker, stockId } = useParams();
    const [chartType, setChartType] = useState("candlestick");
    const [selectedRange, setSelectedRange] = useState("1d");
    const [selectedInterval, setSelectedInterval] = useState("5m");
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [stockInfo, setStockInfo] = useState(null);
    const [exchange, setExchange] = useState("NSE"); // NSE or BSE
    const [liveData, setLiveData] = useState(null);
    const [meta, setMeta] = useState(null);
    const [priceChange, setPriceChange] = useState(0);
    const [percentChange, setPercentChange] = useState(0);

    const intervals = {
        "1d": ["1m", "2m", "5m", "15m", "30m", "60m", "90m"],
        "5d": ["5m", "15m", "30m", "60m", "90m"],
        "1mo": ["1d"],
        "3mo": ["1d"],
        "6mo": ["1d", "1wk"],
        "1y": ["1d", "1wk"],
        "2y": ["1wk", "1mo"],
        "5y": ["1wk", "1mo"],
        "max": ["1mo"]
    };

    // Fetch company info (static data)
    // const { data: companyData, isLoading, error } = useQuery({
    //     queryKey: ["company-info", ticker],
    //     queryFn: async () => {
    //         const res = await axiosInstance.get(`company/${ticker}/`);
    //         setStockInfo({
    //             stock_id: stockId,
    //             stock_name: res.data.about?.name,
    //             stock_ticker: ticker
    //         });
    //         console.log("Company Data:", stockInfo);
    //         return res.data;
    //     },
    //     retry: 1,
    //     enabled: !!ticker,
    // });

    // Fetch live data separately from the chart
    const fetchLiveData = async () => {
        try {
            const suffix = exchange === "NSE" ? ".NS" : ".BO";
            const tickerNew = ticker.replace(/\.(NS|BO)$/, '');
            const res = await axiosInstance.get(`/proxy/yahoo/${tickerNew}${suffix}/`, {
                params: {
                    interval: "1m",
                    range: "1d"
                },
            });

            const result = res.data.chart?.result?.[0];
            if (!result) return;
            setMeta(result.meta || {});

            const timestamps = result.timestamp || [];
            const quotes = result.indicators?.quote?.[0] || {};
            const lastIndex = timestamps.length - 1;

            if (lastIndex < 0) return;

            const currentClose = quotes.close?.[lastIndex] ?? 0;
            const prevClose = meta?.previousClose || currentClose;
            const change = currentClose - prevClose;
            const changePercent = (change / prevClose) * 100;

            setPriceChange(change);
            setPercentChange(changePercent);

            setLiveData({
                open: quotes.open?.[lastIndex] ?? 0,
                close: currentClose,
                high: quotes.high?.[lastIndex] ?? 0,
                low: quotes.low?.[lastIndex] ?? 0,
                volume: quotes.volume?.[lastIndex] ?? 0,
                timestamp: timestamps[lastIndex] ? Math.floor(timestamps[lastIndex]) : 0,
            });
        } catch (err) {
            console.error("Live data fetch error:", err);
        }
    };

    useEffect(() => {
        fetchLiveData();
    }, [ticker, exchange]);

    // if (isLoading) return (
    //     <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
    //         <div className="spinner-border text-primary" role="status">
    //             <span className="visually-hidden">Loading...</span>
    //         </div>
    //     </div>
    // );

    // if (error) return (
    //     <div className="alert alert-danger mx-auto mt-5" style={{ maxWidth: "600px" }}>
    //         <h4 className="alert-heading">Error Loading Data</h4>
    //         <p>{error.message}</p>
    //         <hr />
    //         <p className="mb-0">Please try refreshing the page or check back later.</p>
    //     </div>
    // );

    // if (!companyData) return (
    //     <div className="text-center mt-5">
    //         <div className="card mx-auto" style={{ maxWidth: "500px" }}>
    //             <div className="card-body">
    //                 <h3 className="card-title">No Data Found</h3>
    //                 <p className="card-text">We couldn't find any data for the stock with ticker: {ticker}</p>
    //             </div>
    //         </div>
    //     </div>
    // );

    return (
        <div className="container py-4">
            <div className="row d-flex justify-content-between">
                <div className="col-12 col-lg-8">
                    {/* Stock Header */}
                    <div className="stock-header mb-4">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                            <div>
                                {/* <h2 className="mb-1 fw-bold">
                                    {companyData.about?.name || 'N/A'}
                                    <span className="ms-2 badge bg-secondary">{ticker}</span>
                                </h2> */}
                                <div className="d-flex align-items-center gap-2">
                                    <span className="fs-3 fw-bold">
                                        {liveData ? liveData.close.toFixed(2) : '--'}
                                    </span>
                                    {liveData && (
                                        <span className={`d-flex align-items-center fs-6 fw-bold ${priceChange >= 0 ? 'text-success' : 'text-danger'}`}>
                                            {priceChange >= 0 ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                                            {Math.abs(priceChange).toFixed(2)} ({Math.abs(percentChange).toFixed(2)}%)
                                        </span>
                                    )}
                                </div>
                                {/* <div className="text-muted small">
                                    {companyData.about?.industry || 'Industry not specified'}
                                </div> */}
                            </div>
                            <div>
                                <button
                                    className="btn btn-primary d-flex align-items-center gap-2"
                                    onClick={() => setShowBuyModal(true)}
                                >
                                    <Bookmark size={18} />
                                    Add to Watchlist
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    {/* <StockSummary stockData={companyData} /> */}

                    {/* Live Data Card */}
                    <div className="card mb-4 border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="card-title mb-0 text-primary">Live Market Data</h5>
                                <button className="btn btn-sm btn-outline-primary" onClick={fetchLiveData}>
                                    <ArrowUp size={16} className={`me-1 ${false ? 'spin' : ''}`} /> Refresh
                                </button>
                            </div>
                            {liveData ? (
                                <div className="row text-center">
                                    <div className="col-6 col-md-3 mb-3 mb-md-0">
                                        <div className="text-muted small">Open</div>
                                        <div className="fw-bold fs-5">
                                            {liveData.open.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-3 mb-3 mb-md-0">
                                        <div className="text-muted small">Prev. Close</div>
                                        <div className="fw-bold fs-5">
                                            {meta.previousClose.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-3 mb-3 mb-md-0">
                                        <div className="text-muted small">Volume</div>
                                        <div className="fw-bold fs-5">
                                            {liveData.volume.toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-3 mb-3 mb-md-0">
                                        <div className="text-muted small">Traded Value</div>
                                        <div className="fw-bold fs-5">
                                            {(liveData.volume * liveData.close).toLocaleString('en-IN', {
                                                style: 'currency',
                                                currency: 'INR',
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="d-flex justify-content-center py-3">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chart Controls */}
                    <div className="card mb-3 border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                                {/* Time Range Buttons */}
                                <div className="d-flex flex-wrap gap-2">
                                    {Object.keys(intervals).map((range) => (
                                        <button
                                            key={range}
                                            className={`btn btn-sm ${selectedRange === range ? "btn-primary" : "btn-outline-primary"}`}
                                            onClick={() => {
                                                setSelectedRange(range);
                                                setSelectedInterval(intervals[range][0]);
                                            }}
                                        >
                                            {range.toUpperCase()}
                                        </button>
                                    ))}
                                </div>

                                {/* Exchange and Chart Type Buttons */}
                                <div className="d-flex flex-wrap gap-2">
                                    <div className="btn-group">
                                        <button
                                            className={`btn btn-sm ${exchange === "NSE" ? "btn-primary" : "btn-outline-primary"}`}
                                            onClick={() => setExchange("NSE")}
                                        >
                                            NSE
                                        </button>
                                        <button
                                            className={`btn btn-sm ${exchange === "BSE" ? "btn-primary" : "btn-outline-primary"}`}
                                            onClick={() => setExchange("BSE")}
                                        >
                                            BSE
                                        </button>
                                    </div>
                                    <div className="btn-group">
                                        <button
                                            className={`btn btn-sm ${chartType === "line" ? "btn-primary" : "btn-outline-primary"} d-flex align-items-center gap-1`}
                                            onClick={() => setChartType("line")}
                                        >
                                            <LineChart size={16} />
                                            Line
                                        </button>
                                        <button
                                            className={`btn btn-sm ${chartType === "candlestick" ? "btn-primary" : "btn-outline-primary"} d-flex align-items-center gap-1`}
                                            onClick={() => setChartType("candlestick")}
                                        >
                                            <CandlestickChart size={16} />
                                            Candle
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Interval Buttons */}
                            {intervals[selectedRange] && (
                                <div className="d-flex flex-wrap gap-2 mt-3">
                                    {intervals[selectedRange].map((interval) => (
                                        <button
                                            key={interval}
                                            className={`btn btn-sm ${selectedInterval === interval ? "btn-primary" : "btn-outline-primary"}`}
                                            onClick={() => setSelectedInterval(interval)}
                                        >
                                            {interval}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="card mb-4 border-0 shadow-sm">
                        <div className="card-body p-0">
                            <StockChart
                                ticker={ticker}
                                selectedRange={selectedRange}
                                selectedInterval={selectedInterval}
                                chartType={chartType}
                                exchange={exchange}
                            />
                        </div>
                    </div>

                    {/* Additional Tabs */}
                    {/* <StockFinancials ticker={ticker} data={companyData} />
                    <StockSuggestions ticker={ticker} data={companyData} />
                    <StockNews ticker={ticker} data={companyData} /> */}
                </div>

                {/* RIGHT SIDEBAR */}
                {/* <div className="col-12 col-lg-4">
                    <div className="mb-4 border-0 shadow-sm">
                        <div className="">
                            <StockFundamentals fundamentals={companyData.fundamentals} />
                        </div>
                    </div>
                    <div className="mb-4 border-0 shadow-sm">
                        <div className="">
                            <CompanyInfoCard about={companyData.about} ticker={companyData.ticker} />
                        </div>
                    </div>
                </div> */}
            </div>

            {/* Buy Modal */}
            {showBuyModal && stockInfo && (
                <BuyModal
                    stock={stockInfo}
                    onClose={() => setShowBuyModal(false)}
                    onSuccess={() => setShowBuyModal(false)}
                />
            )}
        </div>
    );
};

export default StockDetails;