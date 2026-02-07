// StockTable.js
import React, { useState, useEffect, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import BuyModal from "./BuyModal";

const StockTable = memo(({ showOnlyFive = false }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStock, setSelectedStock] = useState(null);
    const [showBuyModal, setShowBuyModal] = useState(false);

    const stocksPerPage = 10;

    const { data: stocks = [], isLoading, isError } = useQuery({
        queryKey: ["stocks"],
        queryFn: async () => {
            const response = await axiosInstance.get("/all_stock_names/");
            return response.data;
        },
    });

    const filteredStocks = stocks.filter(
        (stock) =>
            stock.stock_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stock.stock_ticker.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const offset = currentPage * stocksPerPage;
    const visibleStocks = showOnlyFive
        ? filteredStocks.slice(0, 5)
        : filteredStocks.slice(offset, offset + stocksPerPage);

    const pageCount = Math.ceil(filteredStocks.length / stocksPerPage);

    const handlePageClick = ({ selected }) => setCurrentPage(selected);

    const tickers = visibleStocks.map((stock) => stock.stock_ticker);

    const { data: stockInfo = {}, refetch } = useQuery({
        queryKey: ["liveStockData", tickers],
        queryFn: async () => {
            if (tickers.length === 0) return {};
            const responses = await Promise.all(
                tickers.map((ticker) =>
                    axiosInstance.get(`/proxy/yahoo/${ticker}/`)
                        .then(res => {
                            const result = res.data.chart.result[0];
                            const meta = result.meta;
                            return {
                                ltp: meta.regularMarketPrice,
                                change: meta.regularMarketChange,
                                changePercent: meta.regularMarketChangePercent,
                                volume: meta.regularMarketVolume,
                                turnover: meta.regularMarketPrice * meta.regularMarketVolume
                            };
                        })
                        .catch(() => null)
                )
            );
            return responses.reduce((acc, response, index) => {
                if (response) {
                    acc[tickers[index]] = response;
                }
                return acc;
            }, {});
        },
        enabled: tickers.length > 0,
        refetchInterval: 60000,
    });

    const handleBuyClick = (stock) => {
        setSelectedStock({
            ...stock,
            ...(stockInfo[stock.stock_ticker] || {})
        });
        setShowBuyModal(true);
    };

    if (isLoading) return <p>Loading stocks...</p>;
    if (isError) return <p>Error fetching stocks. Please try again.</p>;

    return (
        <div className="mt-3">
            {!showOnlyFive && (
                <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Search by stock name or ticker..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(0);
                    }}
                />
            )}

            <div className="table-responsive">
                <table className="table table-striped table-bordered text-nowrap">
                    <thead className="thead-dark">
                        <tr>
                            <th>Stock Name</th>
                            <th>Ticker</th>
                            <th>LTP (₹)</th>
                            <th>Change (%)</th>
                            <th>Volume</th>
                            <th>Turnover (₹)</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleStocks.map((stock) => {
                            const liveData = stockInfo[stock.stock_ticker] || {};
                            const isPositive = liveData.change >= 0;

                            return (
                                <tr key={stock.stock_id}>
                                    <td>
                                        <Link
                                            to={`/layout/stock/${stock.stock_ticker}/${stock.stock_id}`}
                                            style={{ color: "blue", textDecoration: "underline" }}
                                        >
                                            {stock.stock_name}
                                        </Link>
                                    </td>
                                    <td>{stock.stock_ticker}</td>
                                    <td>{liveData.ltp ? liveData.ltp.toFixed(2) : "-"}</td>
                                    <td style={{ color: isPositive ? 'green' : 'red' }}>
                                        {liveData.change ? `${liveData.change.toFixed(2)} (${liveData.changePercent.toFixed(2)}%)` : "-"}
                                    </td>
                                    <td>{liveData.volume ? liveData.volume.toLocaleString() : "-"}</td>
                                    <td>{liveData.turnover ? `₹${(liveData.turnover / 10000000).toFixed(2)} Cr` : "-"}</td>
                                    <td>
                                        <div className="btn-group">
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => handleBuyClick(stock)}
                                            >
                                                Buy
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {!showOnlyFive && pageCount > 1 && (
                <ReactPaginate
                    previousLabel={"Previous"}
                    nextLabel={"Next"}
                    breakLabel={"..."}
                    pageCount={pageCount}
                    marginPagesDisplayed={1}
                    pageRangeDisplayed={3}
                    onPageChange={handlePageClick}
                    containerClassName={"pagination justify-content-center"}
                    pageClassName={"page-item"}
                    pageLinkClassName={"page-link"}
                    previousClassName={"page-item"}
                    previousLinkClassName={"page-link"}
                    nextClassName={"page-item"}
                    nextLinkClassName={"page-link"}
                    breakClassName={"page-item"}
                    breakLinkClassName={"page-link"}
                    activeClassName={"active"}
                />
            )}

            {showBuyModal && selectedStock && (
                <BuyModal
                    stock={selectedStock}
                    onClose={() => setShowBuyModal(false)}
                    onSuccess={() => {
                        setShowBuyModal(false);
                        refetch();
                    }}
                />
            )}
        </div>
    );
});

export default StockTable;