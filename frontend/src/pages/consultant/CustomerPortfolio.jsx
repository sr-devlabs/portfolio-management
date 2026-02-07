import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosInstance";
import AlertToastify from "../../components/AlertToastify";

const fetchPortfolio = async (customerId) => {
    const response = await axiosInstance.get(`/portfolio/customer_portfolio/${customerId}/`);
    return response.data;
};

const cleanTicker = (ticker) => {
    return ticker.replace(/\.(NS|BO)$/, '');
};

export default function CustomerPortfolio() {
    const { customerId } = useParams();
    const [selectedStock, setSelectedStock] = useState(null);
    const [showSuggestionModal, setShowSuggestionModal] = useState(false);
    const [suggestionType, setSuggestionType] = useState('buy');
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState('');
    const [exchange, setExchange] = useState('NSE');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPrices, setCurrentPrices] = useState({});
    const [isLoadingPrices, setIsLoadingPrices] = useState(false);

    const { data: portfolio, isLoading, isError, refetch } = useQuery({
        queryKey: ['customerPortfolio', customerId],
        queryFn: () => fetchPortfolio(customerId),
        enabled: !!customerId,
    });

    const fetchCurrentPrices = async () => {
        if (!portfolio) return;

        setIsLoadingPrices(true);
        try {
            const prices = {};
            await Promise.all(
                portfolio.map(async (stock) => {
                    try {
                        const ticker = cleanTicker(stock.stock_ticker);
                        const res = await axiosInstance.get(`/proxy/yahoo/${ticker}.NS/`);
                        prices[stock.stock_ticker] = res.data.chart.result[0].meta.regularMarketPrice;
                    } catch (err) {
                        console.error(`Failed to fetch price for ${stock.stock_ticker}:`, err);
                        prices[stock.stock_ticker] = null;
                    }
                })
            );
            setCurrentPrices(prices);
        } finally {
            setIsLoadingPrices(false);
        }
    };

    useEffect(() => {
        if (portfolio && portfolio.length > 0) {
            fetchCurrentPrices();
        }
    }, [portfolio]);

    const handleSuggestionClick = (stock) => {
        setSelectedStock(stock);
        setShowSuggestionModal(true);
        setSuggestionType('buy');
        setQuantity(1);
        setPrice('');
        setExchange('NSE');
    };

    const handleSubmitSuggestion = async () => {
        if (!selectedStock || isSubmitting) return;

        const suggestionData = {
            customer_id: customerId,
            stock_id: selectedStock.stock_id,
            stock_ticker: selectedStock.stock_ticker,
            action: suggestionType,
            quantity: quantity,
            price: parseFloat(price),
            exchange: exchange
        };

        setIsSubmitting(true);
        try {
            await axiosInstance.post("/portfolio/suggest_trade/", suggestionData);
            AlertToastify({
                message: `Suggestion to ${suggestionType} ${selectedStock.stock_name} sent successfully!`,
                type: "success"
            });
            setShowSuggestionModal(false);
        } catch (error) {
            AlertToastify({
                message: error.response?.data?.error || "Failed to submit suggestion. Please try again.",
                type: "error"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate Summary Stats
    const totalInvested = portfolio ? portfolio.reduce((sum, stock) => sum + Number(stock.total_amount), 0) : 0;
    
    let currentTotalValue = 0;
    if (portfolio) {
        currentTotalValue = portfolio.reduce((sum, stock) => {
            const ticker = cleanTicker(stock.stock_ticker);
            const price = currentPrices[stock.stock_ticker] || currentPrices[ticker];
            if (price) {
                return sum + (price * stock.quantity);
            }
            // If live price is missing, use cost price to avoid massive drop in chart/value
            // or just 0? Using cost price is safer for UX temporarily.
            // But let's stick to 0 or previous close if available?
            // For now, let's assume if no price, we don't count it or use avg price.
            // Let's use cost price as fallback to avoid "Loss" due to missing data.
            return sum + (Number(stock.total_amount)); 
        }, 0);
    }

    const totalProfitLoss = currentTotalValue - totalInvested;
    const totalReturnPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    if (isLoading) {
        return (
            <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading customer portfolio...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body text-center py-5">
                    <i className="bi bi-exclamation-triangle fs-1 text-danger mb-3"></i>
                    <p className="text-danger">Error fetching portfolio data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="customer-portfolio-container">
            <div className="card shadow-sm border-0 rounded-3 mb-4">
                <div className="card-header bg-white border-0 py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 text-primary">
                            <i className="bi bi-person-badge me-2"></i>
                            Portfolio for Customer {customerId}
                        </h5>
                        <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={fetchCurrentPrices}
                            disabled={isLoadingPrices}
                        >
                            <i className={`bi bi-arrow-repeat ${isLoadingPrices ? 'spin' : ''}`}></i>
                            {isLoadingPrices ? ' Refreshing...' : ' Refresh Prices'}
                        </button>
                    </div>
                </div>

                {/* Portfolio Summary Cards */}
                <div className="card-body p-4 bg-light border-bottom">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <small className="text-muted fw-semibold">Total Invested</small>
                                    <h3 className="mb-0 text-dark fw-bold mt-2">
                                        {totalInvested.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <small className="text-muted fw-semibold">Current Value</small>
                                    <h3 className="mb-0 text-primary fw-bold mt-2">
                                        {currentTotalValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <small className="text-muted fw-semibold">Total Profit/Loss</small>
                                    <div className={`d-flex align-items-baseline mt-2 ${totalProfitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                                        <h3 className="mb-0 fw-bold">
                                            {Math.abs(totalProfitLoss).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </h3>
                                        <span className="ms-2 fw-medium">
                                            ({totalProfitLoss >= 0 ? '+' : '-'}{Math.abs(totalReturnPercentage).toFixed(2)}%)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 text-nowrap">
                            <thead className="table-light">
                                <tr>
                                    <th>Stock Name</th>
                                    <th>Ticker</th>
                                    <th className="text-end">Qty</th>
                                    <th className="text-end">Invested (₹)</th>
                                    <th className="text-end">Avg. Price</th>
                                    <th className="text-end">Current (₹)</th>
                                    <th className="text-end">Returns (₹)</th>
                                    <th className="pe-4 text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {portfolio?.map((stock, index) => {
                                    const ticker = cleanTicker(stock.stock_ticker);
                                    const avgPrice = stock.total_amount / stock.quantity;
                                    const currentPrice = currentPrices[stock.stock_ticker];
                                    const currentValue = (currentPrice !== undefined && currentPrice !== null) ? currentPrice * stock.quantity : null;
                                    const profitOrLoss = currentValue !== null ? currentValue - stock.total_amount : null;
                                    const isProfit = profitOrLoss >= 0;
                                    
                                    let returnPercentage = null;
                                    if (profitOrLoss !== null && stock.total_amount && stock.total_amount !== 0) {
                                        returnPercentage = (profitOrLoss / stock.total_amount) * 100;
                                    } else if (profitOrLoss !== null) {
                                        returnPercentage = 0;
                                    }

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
                                            <td className="text-end">{parseFloat(stock.total_amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                            <td className="text-end">{avgPrice.toFixed(2)}</td>
                                            <td className="text-end">
                                                {currentPrice ? (
                                                    <span className="fw-semibold">{currentPrice.toFixed(2)}</span>
                                                ) : (
                                                    <span className="spinner-border spinner-border-sm text-muted"></span>
                                                )}
                                            </td>
                                            <td className="text-end">
                                                {profitOrLoss !== null ? (
                                                    <div className={`d-flex flex-column ${isProfit ? 'text-success' : 'text-danger'}`}>
                                                        <span className="fw-bold">{profitOrLoss.toFixed(2)}</span>
                                                        <small className="text-muted">{returnPercentage !== null ? returnPercentage.toFixed(2) : '0.00'}%</small>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex flex-column text-muted">
                                                        <span className="fw-bold">-</span>
                                                        <small>-</small>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="pe-4 text-end">
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => handleSuggestionClick(stock)}
                                                >
                                                    <i className="bi bi-lightbulb me-1"></i>
                                                    Suggest
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
                        <small className="text-muted">Showing {portfolio?.length || 0} holdings</small>
                        <small className="text-muted">Last updated: {new Date().toLocaleString()}</small>
                    </div>
                </div>
            </div>

            {/* Suggestion Modal */}
            {showSuggestionModal && selectedStock && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title">
                                    <i className="bi bi-lightbulb text-primary me-2"></i>
                                    Trade Suggestion for {selectedStock.stock_name}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowSuggestionModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-4">
                                    <div className="btn-group w-100">
                                        <button
                                            type="button"
                                            className={`btn ${suggestionType === 'buy' ? 'btn-success' : 'btn-outline-success'}`}
                                            onClick={() => setSuggestionType('buy')}
                                        >
                                            <i className="bi bi-arrow-down-circle me-1"></i>
                                            Buy
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn ${suggestionType === 'sell' ? 'btn-danger' : 'btn-outline-danger'}`}
                                            onClick={() => setSuggestionType('sell')}
                                        >
                                            <i className="bi bi-arrow-up-circle me-1"></i>
                                            Sell
                                        </button>
                                    </div>
                                </div>

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
                                        <label className="form-label">Quantity</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="1"
                                            max={suggestionType === 'sell' ? selectedStock.quantity : 10000}
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Price (₹)</label>
                                        <div className="input-group">
                                            <span className="input-group-text">₹</span>
                                            <input
                                                type="number"
                                                className="form-control"
                                                min="0.01"
                                                step="0.01"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                placeholder="Enter price"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowSuggestionModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${suggestionType === 'buy' ? 'btn-success' : 'btn-danger'}`}
                                    onClick={handleSubmitSuggestion}
                                    disabled={isSubmitting || !price}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-send me-1"></i>
                                            Submit Suggestion
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .customer-portfolio-container .table-hover tbody tr:hover {
                    background-color: rgba(8, 31, 92, 0.05) !important;
                }
                .customer-portfolio-container .modal-backdrop {
                    background-color: rgba(0,0,0,0.5) !important;
                }
                .customer-portfolio-container .bi-arrow-repeat.spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}