import React, { useState } from "react";

export default function CompanyInfoCard({ about, ticker }) {
    const [showFullDesc, setShowFullDesc] = useState(false);

    const description = about.description || "";
    const shortDesc = description.length > 200 ? description.slice(0, 200) + "..." : description;

    return (
        <div className="card shadow-sm mb-4 rounded-4" style={{ backgroundColor: "#F9FCFF" }}>
            <div className="card-header" style={{ backgroundColor: "#081F5C", color: "white" }}>
                <h6 className="mb-0">Company Info</h6>
            </div>

            <div className="card-body">
                <h6 className="mb-3" style={{ color: "#081F5C" }}>🏢 About</h6>
                <p style={{ fontSize: "0.95rem" }}>
                    {showFullDesc ? description : shortDesc}{" "}
                    {description.length > 200 && (
                        <button
                            className="btn btn-link p-0"
                            onClick={() => setShowFullDesc(!showFullDesc)}
                        >
                            {showFullDesc ? "Show less" : "View all"}
                        </button>
                    )}
                </p>

                <ul className="list-group">
                    <li className="list-group-item" style={{ backgroundColor: "#F9FCFF" }}>
                        <strong>CEO:</strong> {about.ceo}
                    </li>
                    <li className="list-group-item" style={{ backgroundColor: "#F9FCFF" }}>
                        <strong>Headquarters:</strong> {about.headquarters}
                    </li>
                    <li className="list-group-item" style={{ backgroundColor: "#F9FCFF" }}>
                        <strong>Employees:</strong> {about.employees}
                    </li>
                    <li className="list-group-item" style={{ backgroundColor: "#F9FCFF" }}>
                        <strong>Website:</strong>{" "}
                        <a href={about.website} target="_blank" rel="noreferrer">
                            {about.website}
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}
