import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import AlertToastify from "./AlertToastify";

const BuyModal = ({ stock, onClose, onSuccess }) => {
    const [quantity, setQuantity] = useState(1);
    const [exchange, setExchange] = useState('NSE');
    const [useMarketPrice, setUseMarketPrice] = useState(true);
    const [customPrice, setCustomPrice] = useState('');
    const [orderType, setOrderType] = useState('delivery');
    const [isBuying, setIsBuying] = useState(false);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [isPriceLoading, setIsPriceLoading] = useState(false);

    useEffect(() => {
        if (!stock) return;

        const fetchLivePrice = async () => {
            setIsPriceLoading(true);
            try {
                const ticker = stock.stock_ticker.replace(/\.(NS|BO)$/, '');
                const suffix = exchange === 'NSE' ? '.NS' : '.BO';
                const res = await axiosInstance.get(`/proxy/yahoo/${ticker}${suffix}`);
                setCurrentPrice(res.data.chart.result[0].meta.regularMarketPrice);
            } catch (error) {
                console.error("Failed to fetch current price:", error);
            } finally {
                setIsPriceLoading(false);
            }
        };

        fetchLivePrice();
        const interval = setInterval(fetchLivePrice, 5000);
        return () => clearInterval(interval);
    }, [stock, exchange]);

    const handleBuyConfirm = async () => {
        if (isBuying) return;

        const buyPrice = useMarketPrice ? currentPrice : parseFloat(customPrice);

        if (!buyPrice || isNaN(buyPrice)) {
            AlertToastify({ message: "Please enter a valid price", type: "error" });
            return;
        }

        setIsBuying(true);
        try {
            await axiosInstance.post("/portfolio/add_to_portfolio/", {
                stock_id: stock.stock_id,
                quantity: quantity,
                purchase_price: buyPrice
            });

            onSuccess();
            AlertToastify({ message: "Stock bought successfully!", type: "success" });
        } catch (error) {
            AlertToastify({
                message: error.response?.data?.error || "Failed to buy stock. Please try again.",
                type: "error"
            });
        } finally {
            setIsBuying(false);
        }
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    {/* Modal Header */}
                    <div className="modal-header">
                        <h5 className="modal-title">Buy {stock.stock_name}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    {/* Modal Body */}
                    <div className="modal-body">
                        {/* Stock Info */}
                        <div className="mb-3">
                            <label className="form-label">Stock Name</label>
                            <input type="text" className="form-control" value={stock.stock_name} readOnly />
                        </div>

                        {/* Exchange Selection */}
                        <div className="mb-3">
                            <label className="form-label">Exchange</label>
                            <div className="btn-group w-100">
                                <button
                                    type="button"
                                    className={`btn btn-outline-secondary ${exchange === 'NSE' ? 'active' : ''}`}
                                    onClick={() => setExchange('NSE')}
                                >
                                    NSE
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-outline-secondary ${exchange === 'BSE' ? 'active' : ''}`}
                                    onClick={() => setExchange('BSE')}
                                >
                                    BSE
                                </button>
                            </div>
                        </div>

                        {/* Order Type */}
                        {/* <div className="mb-3">
                            <label className="form-label">Order Type</label>
                            <div className="btn-group w-100">
                                <button
                                    type="button"
                                    className={`btn btn-outline-secondary ${orderType === 'delivery' ? 'active' : ''}`}
                                    onClick={() => setOrderType('delivery')}
                                >
                                    Delivery
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-outline-secondary ${orderType === 'intraday' ? 'active' : ''}`}
                                    onClick={() => setOrderType('intraday')}
                                >
                                    Intraday
                                </button>
                            </div>
                        </div> */}

                        {/* Quantity */}
                        <div className="mb-3">
                            <label className="form-label">Quantity</label>
                            <input
                                type="number"
                                className="form-control"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)) || 1)}
                            />
                        </div>

                        {/* Current Price */}
                        <div className="mb-3">
                            <label className="form-label">Current Market Price (₹)</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={isPriceLoading ? 'Loading...' : (currentPrice?.toFixed(2)) || 'N/A'}
                                    readOnly
                                />
                                {isPriceLoading && (
                                    <span className="input-group-text">
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Price Selection */}
                        <div className="mb-3 form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="useMarketPrice"
                                checked={useMarketPrice}
                                onChange={(e) => setUseMarketPrice(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="useMarketPrice">
                                Use current market price
                            </label>
                        </div>

                        {/* Custom Price */}
                        {!useMarketPrice && (
                            <div className="mb-3">
                                <label className="form-label">Custom Price (₹)</label>
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
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={handleBuyConfirm}
                            disabled={isBuying || isPriceLoading}
                        >
                            {isBuying ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Buying...
                                </>
                            ) : 'Confirm Buy'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyModal;