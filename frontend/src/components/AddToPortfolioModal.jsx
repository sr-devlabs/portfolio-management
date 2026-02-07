// components/AddToPortfolioModal.jsx
import React, { useState } from "react";
import axios from "axios";

const AddToPortfolioModal = ({ show, onClose, stockId, stockName }) => {
    const [quantity, setQuantity] = useState(1);
    const [purchasePrice, setPurchasePrice] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/portfolio/add_stock_to_portfolio/", {
                stock_id: stockId,
                quantity,
                purchase_price: purchasePrice,
            });
            alert("Stock added successfully!");
            onClose();
        } catch (error) {
            alert("Error adding stock: " + JSON.stringify(error.response.data));
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Add to Portfolio - {stockName}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-control"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Purchase Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-control"
                                    value={purchasePrice}
                                    onChange={(e) => setPurchasePrice(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Add to Portfolio
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddToPortfolioModal;
