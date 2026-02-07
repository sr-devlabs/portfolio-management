import React from "react";
import useAuthStore from "../../store/authStore";
import useAssignedCustomers from "../../hooks/useAssignedCustomers";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { Link } from "react-router-dom";
import HoldingsPreview from "../../components/Customer/HoldingsPreview";
import { 
    Users, 
    TrendingUp, 
    Clock, 
    PieChart, 
    AlertCircle, 
    ArrowRight,
    Activity,
    Briefcase
} from "lucide-react";

export default function ConsultantDashboard() {
    const user = useAuthStore((state) => state.user);
    const { data, isLoading, isError } = useAssignedCustomers();

    if (isLoading) return (
        <div className="container mt-4">
            <div className="card shadow-sm border-0 rounded-4">
                <div className="card-body text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted fw-medium">Loading dashboard data...</p>
                </div>
            </div>
        </div>
    );

    if (isError) return (
        <div className="container mt-4">
            <div className="card shadow-sm border-0 rounded-4">
                <div className="card-body text-center py-5">
                    <AlertCircle size={48} className="text-danger mb-3" />
                    <h5 className="text-danger">Error loading dashboard data</h5>
                    <p className="text-muted">Please try refreshing the page.</p>
                </div>
            </div>
        </div>
    );

    const totalCustomers = data?.total_customers || 0;
    const customers = data?.customers || [];

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyData = new Array(7).fill(0);

    customers.forEach(({ date_joined }) => {
        const day = new Date(date_joined).getDay();
        weeklyData[day]++;
    });

    const chartData = {
        labels: weekDays,
        datasets: [
            {
                label: "New Customers",
                data: weeklyData,
                backgroundColor: "rgba(13, 110, 253, 0.7)", // Bootstrap primary color
                borderRadius: 4,
            },
        ],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    },
                    grid: {
                        display: true,
                        drawBorder: false,
                        color: "rgba(0,0,0,0.05)"
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    };

    return (
        <div className="container py-4">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Welcome, {user?.full_name?.split(" ")[0] || "Consultant"}!</h2>
                    <p className="text-muted mb-0">Here's what's happening with your clients today.</p>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                        <Briefcase size={16} />
                        Consultant Dashboard
                    </span>
                    <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>

            <div className="row g-4">
                {/* Left Side - Main Content */}
                <div className="col-lg-8">
                    <div className="row g-4">
                        {/* Total Customers Card */}
                        <div className="col-md-6">
                            <div className="card shadow-sm border-0 h-100 rounded-4 overflow-hidden card-hover">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="p-2 bg-primary-subtle rounded-3">
                                            <Users size={24} className="text-primary" />
                                        </div>
                                    </div>
                                    <h5 className="text-muted mb-1 fw-normal">Total Customers</h5>
                                    <h2 className="display-5 fw-bold text-dark mb-0">{totalCustomers}</h2>
                                    <p className="text-muted small mt-2 mb-0">
                                        <span className="text-success fw-medium me-1">
                                            <Activity size={14} className="me-1"/>
                                            Active
                                        </span>
                                        under your management
                                    </p>
                                </div>
                                <div className="card-footer bg-light border-0 py-3 px-4">
                                    <Link to="/layout/customers" className="btn btn-primary w-100 rounded-3 d-flex align-items-center justify-content-center gap-2">
                                        View All Customers <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Weekly Growth Card */}
                        <div className="col-md-6">
                            <div className="card shadow-sm border-0 h-100 rounded-4 overflow-hidden">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="p-2 bg-success-subtle rounded-3">
                                                <TrendingUp size={24} className="text-success" />
                                            </div>
                                            <h5 className="mb-0 fw-bold">Weekly Growth</h5>
                                        </div>
                                    </div>
                                    <div style={{ height: '160px' }}>
                                        <Bar data={chartData} options={chartData.options} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Overview List */}
                    <div className="card shadow-sm border-0 mt-4 rounded-4 overflow-hidden">
                        <div className="card-header bg-white border-bottom border-light p-4">
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-2">
                                    <Users size={20} className="text-primary" />
                                    <h5 className="mb-0 fw-bold">Customer Overview</h5>
                                </div>
                                <span className="badge bg-light text-muted border">{customers.length} Customers</span>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            {customers.length > 0 ? (
                                <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <table className="table table-hover align-middle mb-0 text-nowrap">
                                        <thead className="bg-light sticky-top">
                                            <tr>
                                                <th className="ps-4">Customer</th>
                                                <th>Contact</th>
                                                <th>Status</th>
                                                <th>Investments</th>
                                                <th className="text-end pe-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customers.map((customer, index) => (
                                                <tr key={index}>
                                                    <td className="ps-4">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="avatar-placeholder rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold" style={{width: '40px', height: '40px'}}>
                                                                {customer.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <h6 className="mb-0 fw-semibold text-dark">{customer.name}</h6>
                                                                <small className="text-muted">ID: {customer.id}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex flex-column">
                                                            <small className="text-dark fw-medium">{customer.email}</small>
                                                            <small className="text-muted" style={{fontSize: '0.75rem'}}>
                                                                Last Login: {customer.last_login ? new Date(customer.last_login).toLocaleDateString() : 'Never'}
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex flex-column gap-1">
                                                            <span className={`badge bg-${customer.status === 'active' ? 'success' : 'secondary'}-subtle text-${customer.status === 'active' ? 'success' : 'secondary'} border border-${customer.status === 'active' ? 'success' : 'secondary'}-subtle rounded-pill w-fit`}>
                                                                {customer.status}
                                                            </span>
                                                            <small className="text-muted" style={{fontSize: '0.7rem'}}>
                                                                Joined {new Date(customer.date_joined).toLocaleDateString()}
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex flex-column">
                                                            <span className="fw-bold text-dark">
                                                                {parseFloat(customer.total_invested).toLocaleString('en-IN', {
                                                                    style: 'currency',
                                                                    currency: 'INR'
                                                                })}
                                                            </span>
                                                            <small className="text-muted">
                                                                {customer.holdings_count} Active Holdings
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td className="text-end pe-4">
                                                        <Link
                                                            to={`/layout/customer_portfolio/${customer.id}`}
                                                            className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                                        >
                                                            Portfolio
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-5 text-muted">
                                    <Users size={48} className="mb-3 opacity-50" />
                                    <p>No customers found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side - Holdings Preview */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 h-100 rounded-4 overflow-hidden">
                        <div className="card-header bg-white border-bottom border-light p-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold text-dark">
                                    <PieChart size={20} className="text-primary me-2" />
                                    Top Holdings
                                </h5>
                                <Link to="/layout/holdings" className="text-decoration-none small text-muted hover-underline">
                                    View All
                                </Link>
                            </div>
                        </div>
                        <div className="card-body p-4">
                            <HoldingsPreview
                                customers={customers}
                                showOnlyFive
                                consultantView
                            />
                        </div>
                        <div className="card-footer bg-light border-0 p-4">
                            <Link to="/layout/holdings" className="btn btn-outline-primary w-100 rounded-3 d-flex align-items-center justify-content-center gap-2">
                                <Activity size={16} />
                                Analyze All Holdings
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}