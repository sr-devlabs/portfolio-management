import React from 'react';

const HoldingsPreview = ({ customers = [], showOnlyFive = false, consultantView = false }) => {
  return (
    <div className="text-center py-4">
      <div className="mb-3">
        <i className="bi bi-pie-chart fs-1 text-muted"></i>
      </div>
      <h6 className="text-muted">No Holdings Data Available</h6>
      <p className="small text-muted mb-0">
        {consultantView 
          ? "Customer portfolio data will appear here once populated." 
          : "Start adding stocks to your portfolio to see them here."}
      </p>
    </div>
  );
};

export default HoldingsPreview;
