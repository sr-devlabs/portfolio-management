// App.jsx
import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./pages/LoginForm";
import Logout from "./components/Logout";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuthStore from "./store/authStore";
import { getCsrfToken } from "./api/auth";
import Layout from "./pages/Layout";
import Register from "./pages/Register.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import CustomerDashboard from "./pages/customer/CustomerDashboard.jsx";
import ConsultantDashboard from "./pages/consultant/ConsultantDashboard.jsx";
import Profile from "./pages/profile.jsx";
import Portfolio from "./pages/portfolio.jsx";
import StockDetails from "./pages/StockDetails.jsx";
import ConsultantCostumers from "./pages/consultant/ConsultantCostumers.jsx";
import CustomerPortfolio from "./pages/consultant/CustomerPortfolio.jsx";
import ConsultantAnalysis from "./pages/consultant/ConsultantAnalysis.jsx";
import StockTable from "./components/Stocktable.jsx";
import Holdings from "./pages/Holdings.jsx";

const queryClient = new QueryClient();

const App = () => {
  const { user } = useAuthStore();
  const [csrfFetched, setCsrfFetched] = useState(false);
  console.log("Current User Role:", user?.role);

  useEffect(() => {
    const fetchCSRF = async () => {
      try {
        await getCsrfToken();
        setCsrfFetched(true);
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
      }
    };

    fetchCSRF();
  }, []);

  if (!csrfFetched || user === undefined) return <p>Loading App...</p>;

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/register" element={<Register />} />

          {/* Protected layout wrapper */}
          <Route
            path="/layout"
            element={
              <ProtectedRoute allowedRoles="Admin, Customer, Consultant">
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Default dashboard */}
            <Route index element={
              user?.role ? (
                user.role === 'Admin' ? <AdminDashboard /> :
                  user.role === 'Customer' ? <CustomerDashboard /> :
                    user.role === 'Consultant' ? <ConsultantDashboard /> :
                      <NotFound />
              ) : <p>Loading Dashboard...</p>
            } />


            {/* Nested routes */}
            <Route path="profile" element={<Profile />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="stocks" element={<StockTable />} />
            {/* <Route path="stock/:stockTicker" element={<StockDetails />} /> */}
            <Route path="stock/:stockTicker/:stockId" element={<StockDetails />} />
            <Route path="holdings" element={
              <ProtectedRoute allowedRoles="Customer, Consultant">
                <Holdings />
              </ProtectedRoute>
            } />
            <Route path="stock/:stockTicker" element={<StockDetails />} />
            <Route path="customers" element={
              <ProtectedRoute allowedRoles="Consultant">
                <ConsultantCostumers />
              </ProtectedRoute>
            } />
            <Route path="analysis" element={
                <ProtectedRoute allowedRoles="Consultant">
                    <ConsultantAnalysis />
                </ProtectedRoute>
            } />
            <Route path="customer_portfolio/:customerId" element={
              <ProtectedRoute allowedRoles="Consultant, Customer">
                <CustomerPortfolio />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="/logout" element={<ProtectedRoute allowedRoles="Admin, Customer, Consultant"><Logout /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
