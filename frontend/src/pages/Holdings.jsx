import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import AlertToastify from "../components/AlertToastify";

const fetchPortfolio = async () => {
    const res = await axiosInstance.get("/portfolio/get_user_portfolio/");
    return res.data;
};

const cleanTicker = (ticker) => {
    return ticker.replace(/\.(NS|BO)$/, '');
};

const Holdings = () => {
    const [selectedStock, setSelectedStock] = useState(null);
    const [sellQuantity, setSellQuantity] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [isSelling, setIsSelling] = useState(false);
    const [exchange, setExchange] = useState('NSE');
    const [useMarketPrice, setUseMarketPrice] = useState(true);
    const [customPrice, setCustomPrice] = useState('');
    const [currentPrice, setCurrentPrice] = useState(null);
    const [isPriceLoading, setIsPriceLoading] = useState(false);
    const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);

    const { data: portfolio, isLoading, isError, refetch: refetchPortfolio } = useQuery({
        queryKey: ["portfolio"],
        queryFn: fetchPortfolio,
        staleTime: 60000,
    });

    const [prices, setPrices] = useState({});

    const fetchAllLivePrices = async () => {
        if (!portfolio) return;

        setIsRefreshingPrices(true);
        try {
            const pricesMap = {};
            await Promise.all(
                portfolio.map(async (stock) => {
                    try {
                        const ticker = cleanTicker(stock.stock_ticker);
                        const res = await axiosInstance.get(`/proxy/yahoo/${ticker}.NS`);
                        pricesMap[stock.stock_ticker] = res.data.chart.result[0].meta.regularMarketPrice;
                    } catch (err) {
                        console.error(`Failed to fetch price for ${stock.stock_ticker}:`, err);
                        pricesMap[stock.stock_ticker] = 0;
                    }
                })
            );
            setPrices(pricesMap);
        } finally {
            setIsRefreshingPrices(false);
        }
    };

    useEffect(() => {
        if (portfolio) {
            fetchAllLivePrices();
        }
    }, [portfolio]);

    useEffect(() => {
        if (showModal && selectedStock) {
            fetchLivePrice();
        }
    }, [showModal, exchange]);

    const fetchLivePrice = async () => {
        if (!selectedStock) return;

        setIsPriceLoading(true);
        try {
            const ticker = cleanTicker(selectedStock.stock_ticker);
            const suffix = exchange === 'NSE' ? '.NS' : '.BO';
            const res = await axiosInstance.get(`/proxy/yahoo/${ticker}${suffix}`);
            setCurrentPrice(res.data.chart.result[0].meta.regularMarketPrice);
        } catch (error) {
            console.error("Failed to fetch current price:", error);
            setCurrentPrice(null);
        } finally {
            setIsPriceLoading(false);
        }
    };

    const handleSellClick = (stock) => {
        setSelectedStock(stock);
        setSellQuantity(1);
        setExchange('NSE');
        setUseMarketPrice(true);
        setCustomPrice('');
        setCurrentPrice(prices[stock.stock_ticker] || null);
        setShowModal(true);
    };

    const handleSellConfirm = async () => {
        if (!selectedStock || isSelling) return;

        const sellPrice = useMarketPrice
            ? currentPrice
            : parseFloat(customPrice);

        if (!sellPrice || isNaN(sellPrice)) {
            AlertToastify({
                message: "Please enter a valid price",
                type: "error"
            });
            return;
        }

        setIsSelling(true);
        try {
            await axiosInstance.post("/portfolio/sell_stock/", {
                stock_id: selectedStock.stock_id,
                stock_ticker: selectedStock.stock_ticker,
                quantity: sellQuantity,
                exchange: exchange,
                sell_price: sellPrice
            });

            setShowModal(false);
            refetchPortfolio();
            AlertToastify({
                message: "Stock sold successfully!",
                type: "success"
            });
        } catch (error) {
            AlertToastify({
                message: error.response?.data?.error || "Failed to sell stock. Please try again.",
                type: "error"
            });
        } finally {
            setIsSelling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading your portfolio...</p>
                </div>
            </div>
        );
    }

    if (isError || !portfolio?.length) {
        return (
            <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body">
                    <h5 className="card-title text-primary mb-3">Your Holdings</h5>
                    <div className="text-center py-4">
                        <i className="bi bi-box-seam fs-1 text-muted mb-3"></i>
                        <p className="text-muted">No holdings found in your portfolio</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="card shadow-sm border-0 rounded-3 mb-4">
                <div className="card-header bg-white border-0 py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 text-primary">
                            <i className="bi bi-pie-chart me-2"></i>
                            Your Holdings
                        </h5>
                        <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={fetchAllLivePrices}
                            disabled={isRefreshingPrices}
                        >
                            <i className={`bi bi-arrow-repeat ${isRefreshingPrices ? 'spin' : ''}`}></i>
                            {isRefreshingPrices ? ' Refreshing...' : ' Refresh Prices'}
                        </button>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Stock Name</th>
                                    <th>Ticker</th>
                                    <th className="text-end">Qty</th>
                                    <th className="text-end">Invested (₹)</th>
                                    <th className="text-end">Current (₹)</th>
                                    <th className="text-end">Returns (₹)</th>
                                    <th className="pe-4 text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {portfolio.map((stock, index) => {
                                    const ticker = cleanTicker(stock.stock_ticker);
                                    const currentPrice = prices[stock.stock_ticker] || 0;
                                    const invested = parseFloat(stock.total_amount);
                                    const currentValue = currentPrice * stock.quantity;
                                    const profitOrLoss = currentValue - invested;
                                    const isProfit = profitOrLoss >= 0;
                                    const returnPercentage = (profitOrLoss / invested) * 100;

                                    return (
                                        <tr key={index} className="position-relative">
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div>
                                                        <div className="fw-semibold">{stock.stock_name}</div>
                                                        <div className="text-muted small">{stock.exchange}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-dark">{ticker}</span>
                                            </td>
                                            <td className="text-end fw-semibold">{stock.quantity}</td>
                                            <td className="text-end">{invested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                            <td className="text-end">
                                                {currentPrice ? (
                                                    <span className="fw-semibold">{currentPrice.toFixed(2)}</span>
                                                ) : (
                                                    <span className="spinner-border spinner-border-sm text-muted"></span>
                                                )}
                                            </td>
                                            <td className="text-end">
                                                <div className={`d-flex flex-column ${isProfit ? 'text-success' : 'text-danger'}`}>
                                                    <span className="fw-bold">{profitOrLoss.toFixed(2)}</span>
                                                    <small className="text-muted">{returnPercentage.toFixed(2)}%</small>
                                                </div>
                                            </td>
                                            <td className="pe-4 text-end">
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleSellClick(stock)}
                                                    disabled={isRefreshingPrices}
                                                >
                                                    <i className="bi bi-currency-dollar me-1"></i>
                                                    Sell
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="card-footer bg-white border-0 py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">Showing {portfolio.length} holdings</small>
                        <small className="text-muted">Prices update on refresh</small>
                    </div>
                </div>
            </div>

            {/* Sell Modal */}
            {showModal && selectedStock && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title">
                                    <i className="bi bi-currency-dollar text-danger me-2"></i>
                                    Sell {selectedStock.stock_name}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Stock ID</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={selectedStock.stock_id}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Available Qty</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={selectedStock.quantity}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Exchange</label>
                                        <div className="btn-group w-100">
                                            <button
                                                type="button"
                                                className={`btn ${exchange === 'NSE' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => setExchange('NSE')}
                                            >
                                                NSE
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn ${exchange === 'BSE' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => setExchange('BSE')}
                                            >
                                                BSE
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Quantity to Sell</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="1"
                                            max={selectedStock.quantity}
                                            value={sellQuantity}
                                            onChange={(e) => setSellQuantity(Math.min(Number(e.target.value), selectedStock.quantity))}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="useMarketPrice"
                                                checked={useMarketPrice}
                                                onChange={(e) => setUseMarketPrice(e.target.checked)}
                                            />
                                            <label className="form-check-label" htmlFor="useMarketPrice">
                                                Use current market price
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Current Market Price</label>
                                        <div className="input-group">
                                            <span className="input-group-text">₹</span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={isPriceLoading ? 'Loading...' : (currentPrice?.toFixed(2)) || 'N/A'}
                                                readOnly
                                            />
                                            {isPriceLoading && (
                                                <span className="input-group-text">
                                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {!useMarketPrice && (
                                        <div className="col-12">
                                            <label className="form-label">Custom Price</label>
                                            <div className="input-group">
                                                <span className="input-group-text">₹</span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={customPrice}
                                                    onChange={(e) => setCustomPrice(e.target.value)}
                                                    placeholder="Enter custom price"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleSellConfirm}
                                    disabled={isSelling || isPriceLoading}
                                >
                                    {isSelling ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-currency-dollar me-1"></i>
                                            Confirm Sell
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .symbol {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                }
                .symbol-label {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 1.1rem;
                }
                .bi-arrow-repeat.spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .table-hover tbody tr:hover {
                    background-color: rgba(8, 31, 92, 0.05) !important;
                }
            `}</style>
        </>
    );
};

export default Holdings;