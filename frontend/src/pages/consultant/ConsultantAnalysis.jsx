import React from "react";
import { Link } from "react-router-dom";
import { 
    TrendingUp, 
    PieChart, 
    Wallet, 
    ArrowRight, 
    BarChart3,
    LineChart
} from "lucide-react";
import useAssignedCustomers from "../../hooks/useAssignedCustomers";
import HoldingsPreview from "../../components/Customer/HoldingsPreview";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";

export default function ConsultantAnalysis() {
    const { data, isLoading } = useAssignedCustomers();
    const customers = data?.customers || [];

    // --- Chart Data Preparation ---

    // 1. Client Growth (Weekly Signups)
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyData = new Array(7).fill(0);
    customers.forEach(({ date_joined }) => {
        const day = new Date(date_joined).getDay();
        weeklyData[day]++;
    });

    const growthChartData = {
        labels: weekDays,
        datasets: [{
            label: "New Clients",
            data: weeklyData,
            backgroundColor: "rgba(13, 110, 253, 0.7)",
            borderRadius: 4,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
            x: { grid: { display: false } }
        }
    };

    // 2. Investment Volume (Mock Distribution for Demo or Real if we sum up)
    // Let's create a histogram-like distribution of investment sizes
    const investmentRanges = ["< 10k", "10k-50k", "50k-1L", "> 1L"];
    const investmentCounts = [0, 0, 0, 0];
    
    customers.forEach(c => {
        const invested = parseFloat(c.total_invested || 0);
        if (invested < 10000) investmentCounts[0]++;
        else if (invested < 50000) investmentCounts[1]++;
        else if (invested < 100000) investmentCounts[2]++;
        else investmentCounts[3]++;
    });

    const riskChartData = {
        labels: investmentRanges,
        datasets: [{
            label: "Clients",
            data: investmentCounts,
            borderColor: "#0d6efd",
            backgroundColor: "rgba(13, 110, 253, 0.1)",
            fill: true,
            tension: 0.4
        }]
    };

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Analytics Overview</h2>
                    <p className="text-muted mb-0">Deep dive into your client base and portfolio performance.</p>
                </div>
            </div>

            <div className="row g-4">
                {/* --- Section 1: Client Analytics --- */}
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
                        <div className="card-header bg-white border-bottom border-light p-4">
                            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                <BarChart3 size={20} className="text-primary" />
                                Client Growth & Activity
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <h6 className="text-muted mb-3 small fw-bold text-uppercase">Weekly Signups</h6>
                                    <div style={{ height: '200px' }}>
                                        {isLoading ? <p>Loading...</p> : <Bar data={growthChartData} options={chartOptions} />}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <h6 className="text-muted mb-3 small fw-bold text-uppercase">Investment Volume</h6>
                                    <div style={{ height: '200px' }}>
                                         {isLoading ? <p>Loading...</p> : <Line data={riskChartData} options={chartOptions} />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Aggregated Holdings */}
                    <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                        <div className="card-header bg-white border-bottom border-light p-4">
                            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                <PieChart size={20} className="text-success" />
                                Top Holdings Across Clients
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            <HoldingsPreview customers={customers} consultantView />
                        </div>
                    </div>
                </div>

                {/* --- Section 2: Personal Portfolio Management --- */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-primary text-white position-relative">
                        <div className="card-body p-4 position-relative z-1">
                            <div className="mb-4">
                                <div className="p-3 bg-white bg-opacity-25 rounded-3 w-fit mb-3">
                                    <Wallet size={32} className="text-white" />
                                </div>
                                <h4 className="fw-bold mb-1">My Personal Portfolio</h4>
                                <p className="text-white-50 small mb-0">Manage your own investments and track market performance.</p>
                            </div>
                            
                            <div className="d-grid gap-3">
                                <Link to="/layout/holdings" className="btn btn-light w-100 rounded-3 text-primary fw-medium d-flex justify-content-between align-items-center px-4">
                                    View My Holdings
                                    <ArrowRight size={18} />
                                </Link>
                                <Link to="/layout/stocks" className="btn btn-outline-light w-100 rounded-3 fw-medium d-flex justify-content-between align-items-center px-4">
                                    Explore Stocks
                                    <TrendingUp size={18} />
                                </Link>
                            </div>
                        </div>
                        {/* Decorative background circle */}
                        <div className="position-absolute top-0 end-0 translate-middle-y me-n5 mt-n5 rounded-circle bg-white opacity-10" style={{width: '200px', height: '200px'}}></div>
                    </div>

                    {/* Quick Stats or Tips for Consultant */}
                    <div className="card shadow-sm border-0 rounded-4 overflow-hidden mt-4">
                        <div className="card-body p-4">
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                <LineChart size={18} className="text-warning" />
                                Market Insights
                            </h6>
                            <p className="text-muted small mb-3">
                                Stay updated with the latest trends. Your personal portfolio performance can help guide your client recommendations.
                            </p>
                            <Link to="/layout/stocks" className="text-decoration-none small fw-bold text-primary">
                                Go to Market Analysis <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
