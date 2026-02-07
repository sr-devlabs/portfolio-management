import React from "react";

export default function StockFundamentals({ fundamentals }) {
    return (
        <div className="card shadow-sm mb-4 rounded-4" style={{ backgroundColor: "#F9FCFF" }}>
            <div className="card-header" style={{ backgroundColor: "#081F5C", color: "white" }}>
                <h6 className="mb-0">📊 Fundamentals</h6>
            </div>
            <div className="card-body p-0">
                <ul className="list-group list-group-flush">
                    {Object.entries(fundamentals).map(([key, value]) => (
                        <li
                            key={key}
                            className="list-group-item d-flex justify-content-between"
                            style={{ backgroundColor: "#F9FCFF" }}
                        >
                            <strong>{key}</strong>
                            <span>{value}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
