import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import AlertToastify from "./AlertToastify";

const SellModal = ({ stock, onClose, onSuccess }) => {
    const [quantity, setQuantity] = useState(1);
    const [exchange, setExchange] = useState('NSE');
    const [useMarketPrice, setUseMarketPrice] = useState(true);
    const [customPrice, setCustomPrice] = useState('');
    const [orderType, setOrderType] = useState('delivery');
    const [isSelling, setIsSelling] = useState(false);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [isPriceLoading, setIsPriceLoading] = useState(false);
    const [priceError, setPriceError] = useState('');

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

    const handleCustomPriceChange = (e) => {
        const value = e.target.value;
        // Allow empty string or valid numbers
        if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
            setCustomPrice(value);
            setPriceError('');
        }
    };

    const handleQuantityChange = (e) => {
        const value = Math.min(Number(e.target.value), stock.quantity);
        setQuantity(isNaN(value) ? 1 : Math.max(1, value));
    };

    const handleSellConfirm = async () => {
        if (isSelling) return;

        // Validate quantity
        if (quantity <= 0 || quantity > stock.quantity) {
            AlertToastify({
                message: `Please enter a valid quantity (1-${stock.quantity})`,
                type: "error"
            });
            return;
        }

        // Get and validate price
        let sellPrice;
        if (useMarketPrice) {
            sellPrice = currentPrice;
        } else {
            if (customPrice === '') {
                setPriceError('Please enter a valid price');
                return;
            }
            sellPrice = parseFloat(customPrice);
            if (isNaN(sellPrice) || sellPrice <= 0) {
                setPriceError('Price must be greater than 0');
                return;
            }
        }

        if (!sellPrice || isNaN(sellPrice)) {
            AlertToastify({ message: "Please enter a valid price", type: "error" });
            return;
        }

        setIsSelling(true);
        try {
            await axiosInstance.post("/portfolio/sell_stock/", {
                stock_id: stock.stock_id,
                quantity: quantity,
                sell_price: sellPrice,
                exchange: exchange,
                order_type: orderType
            });

            onSuccess();
            AlertToastify({ message: "Stock sold successfully!", type: "success" });
        } catch (error) {
            AlertToastify({
                message: error.response?.data?.error || "Failed to sell stock. Please try again.",
                type: "error"
            });
        } finally {
            setIsSelling(false);
        }
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Sell {stock.stock_name}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Stock Name</label>
                            <input type="text" className="form-control" value={stock.stock_name} readOnly />
                        </div>

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

                        <div className="mb-3">
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
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Quantity (Available: {stock.quantity})</label>
                            <input
                                type="number"
                                className="form-control"
                                min="1"
                                max={stock.quantity}
                                value={quantity}
                                onChange={handleQuantityChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Current Market Price (₹)</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={isPriceLoading ? 'Loading...' : (currentPrice?.toFixed(2) || 'N/A')}
                                    readOnly
                                />
                                {isPriceLoading && (
                                    <span className="input-group-text">
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    </span>
                                )}
                            </div>
                        </div>

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

                        {!useMarketPrice && (
                            <div className="mb-3">
                                <label className="form-label">Custom Price (₹)</label>
                                <input
                                    type="text"
                                    className={`form-control ${priceError ? 'is-invalid' : ''}`}
                                    value={customPrice}
                                    onChange={handleCustomPriceChange}
                                    placeholder="Enter price (e.g. 123.45)"
                                />
                                {priceError && <div className="invalid-feedback">{priceError}</div>}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
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
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Selling...
                                </>
                            ) : 'Confirm Sell'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellModal;