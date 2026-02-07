import React, { useState, useEffect } from "react";
import axios from "axios";

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get("http://localhost:8000/api/portfolio/get_user_portfolio/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPortfolio(response.data);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
        alert("Failed to load portfolio.");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const calculateInvestedAmount = (quantity, totalAmount) => {
    return (quantity * totalAmount).toFixed(2);
  };

  const calculatePercentageChange = (currentPrice, previousPrice) => {
    return ((currentPrice - previousPrice) / previousPrice * 100).toFixed(2);
  };

  const handleAddStock = (stock) => {
    console.log(`Adding stock: ${stock.stock_name}`);
    // Add your logic for adding the stock here
  };

  const handleSellStock = (stock) => {
    console.log(`Selling stock: ${stock.stock_name}`);
    // Add your logic for selling the stock here
  };

  if (loading) {
    return <div>Loading portfolio...</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="text-center">Your Portfolio</h2>

      <div className="portfolio-container">
        <div className="portfolio-header">
          <div className="portfolio-column">Stock</div>
          <div className="portfolio-column">Quantity</div>
          <div className="portfolio-column">Invested Amount</div>
          <div className="portfolio-column">Current Price</div>
          <div className="portfolio-column">% Change</div>
          <div className="portfolio-column">Actions</div>
        </div>

        {portfolio.map((stock) => {
          const investedAmount = calculateInvestedAmount(stock.quantity, stock.total_amount);
          const percentageChange = calculatePercentageChange(stock.current_price, stock.previous_price);

          return (
            <div key={stock.stock_ticker} className="portfolio-row">
              <div className="portfolio-column">{stock.stock_name} ({stock.stock_ticker})</div>
              <div className="portfolio-column">{stock.quantity}</div>
              <div className="portfolio-column">${investedAmount}</div>
              <div className="portfolio-column">${stock.current_price}</div>
              <div className="portfolio-column">{percentageChange}%</div>
              <div className="portfolio-column">
                <button onClick={() => handleAddStock(stock)} className="btn btn-success">Add</button>
                <button onClick={() => handleSellStock(stock)} className="btn btn-danger">Sell</button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .portfolio-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .portfolio-header {
          display: flex;
          font-weight: bold;
          background-color: #f0f0f0;
          padding: 10px;
          border-radius: 5px;
          text-align: center;
        }

        .portfolio-row {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          border-bottom: 1px solid #e0e0e0;
        }

        .portfolio-column {
          flex: 1;
          text-align: center;
          font-size: 14px;
        }

        .portfolio-column button {
          margin: 0 5px;
        }

        .btn {
          padding: 8px 16px;
          font-size: 14px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .btn-success {
          background-color: #28a745;
          color: white;
        }

        .btn-danger {
          background-color: #dc3545;
          color: white;
        }

        @media (max-width: 768px) {
          .portfolio-row {
            flex-direction: column;
            text-align: left;
          }

          .portfolio-column {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default Portfolio;
