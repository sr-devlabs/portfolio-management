import React from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const CustomerDashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Welcome, {user?.full_name || "Valued Customer"}</h2>
        <span className="badge bg-primary">Customer Dashboard</span>
      </div>

      <div className="row g-4">
        {/* Portfolio Card */}
        <div className="col-md-6 col-lg-3">
          <div className="card h-100 shadow-sm hover-shadow transition-all">
            <div className="card-body text-center p-4">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-block mb-3">
                <i className="bi bi-pie-chart-fill fs-2 text-primary"></i>
              </div>
              <h5 className="card-title">Portfolio</h5>
              <p className="card-text text-muted">View your investment distribution and performance.</p>
              <Link to="/layout/portfolio" className="btn btn-outline-primary w-100 stretched-link">
                View Portfolio
              </Link>
            </div>
          </div>
        </div>

        {/* Holdings Card */}
        <div className="col-md-6 col-lg-3">
          <div className="card h-100 shadow-sm hover-shadow transition-all">
            <div className="card-body text-center p-4">
              <div className="rounded-circle bg-success bg-opacity-10 p-3 d-inline-block mb-3">
                <i className="bi bi-wallet2 fs-2 text-success"></i>
              </div>
              <h5 className="card-title">Holdings</h5>
              <p className="card-text text-muted">Manage your current stock holdings and assets.</p>
              <Link to="/layout/holdings" className="btn btn-outline-success w-100 stretched-link">
                View Holdings
              </Link>
            </div>
          </div>
        </div>

        {/* Stocks Card */}
        <div className="col-md-6 col-lg-3">
          <div className="card h-100 shadow-sm hover-shadow transition-all">
            <div className="card-body text-center p-4">
              <div className="rounded-circle bg-info bg-opacity-10 p-3 d-inline-block mb-3">
                <i className="bi bi-graph-up-arrow fs-2 text-info"></i>
              </div>
              <h5 className="card-title">Market</h5>
              <p className="card-text text-muted">Explore stocks and market trends.</p>
              <Link to="/layout/stocks" className="btn btn-outline-info w-100 stretched-link">
                Explore Market
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="col-md-6 col-lg-3">
          <div className="card h-100 shadow-sm hover-shadow transition-all">
            <div className="card-body text-center p-4">
              <div className="rounded-circle bg-secondary bg-opacity-10 p-3 d-inline-block mb-3">
                <i className="bi bi-person-circle fs-2 text-secondary"></i>
              </div>
              <h5 className="card-title">Profile</h5>
              <p className="card-text text-muted">Manage your personal information and settings.</p>
              <Link to="/layout/profile" className="btn btn-outline-secondary w-100 stretched-link">
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
