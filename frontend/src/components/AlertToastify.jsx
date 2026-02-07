import React from "react";

const AlertToastify = ({ message, duration = 3000, type = "info" }) => {
    const backgroundColors = {
        success: "#28a745",
        error: "#dc3545",
        warning: "#ffc107",
        info: "#17a2b8",
    };

    const showToast = () => {
        Toastify({
            text: message,
            duration: duration,
            gravity: "top",
            position: "right",
            style: { background: backgroundColors[type] || "#17a2b8" },
        }).showToast();
    };

    return showToast();
};

export default AlertToastify;
