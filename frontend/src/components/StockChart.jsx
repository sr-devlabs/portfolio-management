import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const StockChart = ({
    ticker,
    chartType,
    selectedRange,
    selectedInterval,
    exchange,
}) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const seriesRef = useRef(null);
    const volumeSeriesRef = useRef(null);
    const resizeObserver = useRef(null);
    const intervalRef = useRef(null);
    const lastTimestampRef = useRef(null);
    const initialDataLoaded = useRef(false);
    const userInteracted = useRef(false);
    const currentVisibleRange = useRef(null);
    const timeScaleSubscription = useRef(null);

    const [clickedData, setClickedData] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [volumeData, setVolumeData] = useState([]);

    const convertToUTC = (unix) => Math.floor(unix);

    const fetchChartData = async () => {
        try {
            const ticker_new = ticker.replace(/\.(NS|BO)$/, "");
            const suffix = exchange === "NSE" ? ".NS" : ".BO";
            const { data } = await axiosInstance.get(`/proxy/yahoo/${ticker_new}${suffix}/`, {
                params: { interval: selectedInterval, range: selectedRange },
            });

            const result = data.chart?.result?.[0];
            if (!result) return;

            const timestamps = result.timestamp || [];
            const quotes = result.indicators?.quote?.[0] || {};
            const volumes = quotes.volume || [];

            const newChartData = timestamps.map((ts, idx) => {
                const time = convertToUTC(ts);
                return chartType === "candlestick"
                    ? {
                        time,
                        open: quotes.open?.[idx] ?? 0,
                        high: quotes.high?.[idx] ?? 0,
                        low: quotes.low?.[idx] ?? 0,
                        close: quotes.close?.[idx] ?? 0,
                    }
                    : {
                        time,
                        value: quotes.close?.[idx] ?? 0,
                    };
            });

            const newVolumeData = timestamps.map((ts, idx) => ({
                time: convertToUTC(ts),
                value: volumes?.[idx] ?? 0,
                color: chartType === "candlestick"
                    ? quotes.close?.[idx] >= quotes.open?.[idx]
                        ? "#26a69a"
                        : "#ef5350"
                    : "#8884d8",
            }));

            setChartData(newChartData);
            setVolumeData(newVolumeData);

            if (newChartData.length > 0) {
                const lastIndex = newChartData.length - 1;
                lastTimestampRef.current = newChartData[lastIndex].time;
            }
        } catch (err) {
            console.error("Chart data fetch error:", err);
        }
    };

    const updateChartWithLiveData = async () => {
        try {
            const ticker_new = ticker.replace(/\.(NS|BO)$/, "");
            const suffix = exchange === "NSE" ? ".NS" : ".BO";
            const { data } = await axiosInstance.get(`/proxy/yahoo/${ticker_new}${suffix}/`, {
                params: {
                    interval: selectedInterval,
                    range: "1d" // Always fetch just 1 day for live updates
                },
            });

            const result = data.chart?.result?.[0];
            if (!result) return;

            const timestamps = result.timestamp || [];
            const quotes = result.indicators?.quote?.[0] || {};
            const volumes = quotes.volume || [];
            const lastIndex = timestamps.length - 1;

            if (lastIndex < 0) return;

            const currentTime = convertToUTC(timestamps[lastIndex]);
            const currentClose = quotes.close?.[lastIndex] ?? 0;
            const currentOpen = quotes.open?.[lastIndex] ?? 0;
            const currentHigh = quotes.high?.[lastIndex] ?? 0;
            const currentLow = quotes.low?.[lastIndex] ?? 0;
            const currentVolume = volumes?.[lastIndex] ?? 0;

            // If we're still in the same candle interval
            if (currentTime === lastTimestampRef.current) {
                const newMain = chartType === "candlestick"
                    ? {
                        time: currentTime,
                        open: currentOpen,
                        high: currentHigh,
                        low: currentLow,
                        close: currentClose,
                    }
                    : {
                        time: currentTime,
                        value: currentClose,
                    };

                const newVolume = {
                    time: currentTime,
                    value: currentVolume,
                    color: chartType === "candlestick"
                        ? currentClose >= currentOpen
                            ? "#26a69a"
                            : "#ef5350"
                        : "#8884d8",
                };

                if (seriesRef.current) seriesRef.current.update(newMain);
                if (volumeSeriesRef.current) volumeSeriesRef.current.update(newVolume);
            } else {
                // New candle interval - we need to fetch full data again
                fetchChartData();
            }
        } catch (err) {
            console.error("Live data update error:", err);
        }
    };

    useEffect(() => {
        fetchChartData();
    }, [ticker, selectedRange, selectedInterval, exchange, chartType]);

    useEffect(() => {
        if (!window.LightweightCharts || !chartRef.current) return;

        const initializeChart = () => {
            if (chartInstance.current) {
                if (timeScaleSubscription.current) {
                    timeScaleSubscription.current();
                }
                chartInstance.current.remove();
            }

            const chart = window.LightweightCharts.createChart(chartRef.current, {
                width: chartRef.current.clientWidth,
                height: 500,
                layout: { backgroundColor: "#fff", textColor: "#000" },
                grid: {
                    vertLines: { color: "#eee" },
                    horzLines: { color: "#eee" },
                },
                rightPriceScale: {
                    visible: true,
                    borderVisible: false,
                    scaleMargins: { top: 0.25, bottom: 0.2 },
                },
                timeScale: {
                    timeVisible: true,
                    borderVisible: false,
                    tickMarkFormatter: (time) => {
                        const date = new Date(time * 1000);
                        return date.toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "Asia/Kolkata",
                        });
                    },
                },
                localization: {
                    timeFormatter: (time) => {
                        const date = new Date(time * 1000);
                        return date.toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "Asia/Kolkata",
                        });
                    },
                },
            });

            chartInstance.current = chart;

            seriesRef.current = chartType === "candlestick"
                ? chart.addCandlestickSeries()
                : chart.addLineSeries();

            volumeSeriesRef.current = chart.addHistogramSeries({
                color: "rgba(136, 132, 216, 0.35)",
                priceFormat: { type: "volume" },
                priceScaleId: "",
                scaleMargins: { top: 0.7, bottom: 0 },
            });

            // Track user interaction with the chart
            timeScaleSubscription.current = chart.timeScale().subscribeVisibleTimeRangeChange((newRange) => {
                userInteracted.current = true;
                currentVisibleRange.current = newRange;
            });

            resizeObserver.current = new ResizeObserver(() => {
                chart.applyOptions({ width: chartRef.current.clientWidth });
            });
            resizeObserver.current.observe(chartRef.current);

            chart.subscribeClick((param) => {
                if (!param || !param.time || !param.seriesData) {
                    setClickedData(null);
                    return;
                }

                const data = param.seriesData.get(seriesRef.current);
                if (data) {
                    const clickedInfo = chartType === "candlestick"
                        ? {
                            time: param.time,
                            open: data.open,
                            high: data.high,
                            low: data.low,
                            close: data.close,
                        }
                        : {
                            time: param.time,
                            value: data.value,
                        };
                    setClickedData(clickedInfo);
                }
            });

            if (chartData.length > 0) {
                seriesRef.current.setData(chartData);
                volumeSeriesRef.current.setData(volumeData);
                if (!userInteracted.current) {
                    chart.timeScale().fitContent();
                }
                initialDataLoaded.current = true;
            }
        };

        initializeChart();

        return () => {
            if (chartInstance.current) {
                if (timeScaleSubscription.current) {
                    timeScaleSubscription.current();
                }
                chartInstance.current.removeSeries(seriesRef.current);
                chartInstance.current.removeSeries(volumeSeriesRef.current);
                chartInstance.current.remove();
            }
            resizeObserver.current?.disconnect();
        };
    }, [chartType]);

    useEffect(() => {
        if (seriesRef.current && chartData.length > 0) {
            seriesRef.current.setData(chartData);
            volumeSeriesRef.current.setData(volumeData);
            if (!userInteracted.current) {
                chartInstance.current?.timeScale().fitContent();
            }
        }
    }, [chartData, volumeData]);

    const formatTime = (unix) => {
        const date = new Date(unix * 1000);
        return date.toLocaleString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour12: true,
            timeZone: "Asia/Kolkata",
        });
    };

    return (
        <div className="position-relative w-100" style={{ height: "500px" }}>
            <button 
                className="btn btn-sm btn-light position-absolute border shadow-sm" 
                style={{ top: '10px', right: '10px', zIndex: 20 }}
                onClick={updateChartWithLiveData}
                title="Refresh Chart Data"
            >
                <i className="bi bi-arrow-clockwise"></i> Refresh
            </button>
            <div ref={chartRef} className="w-100 h-100" />
            {clickedData && (
                <div
                    style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        backgroundColor: "rgba(255,255,255,0.9)",
                        padding: "10px",
                        borderRadius: "8px",
                        boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                        fontSize: "14px",
                        zIndex: 10,
                    }}
                >
                    <div><strong>Time:</strong> {formatTime(clickedData.time)}</div>
                    {chartType === "candlestick" ? (
                        <>
                            <div><strong>Open:</strong> {clickedData.open?.toFixed(2)}</div>
                            <div><strong>High:</strong> {clickedData.high?.toFixed(2)}</div>
                            <div><strong>Low:</strong> {clickedData.low?.toFixed(2)}</div>
                            <div><strong>Close:</strong> {clickedData.close?.toFixed(2)}</div>
                        </>
                    ) : (
                        <div><strong>Price:</strong> {clickedData.value?.toFixed(2)}</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StockChart;