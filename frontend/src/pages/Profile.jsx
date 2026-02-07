import React from "react";
import useAuthStore from "../store/authStore";

const Profile = () => {
    const { user } = useAuthStore();

    // 🧠 If user is not yet loaded, show loading
    if (!user || Object.keys(user).length === 0) {
        return (
            <div className="container mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="card shadow-sm p-4">
                <div className="d-flex align-items-center">
                    {user.profile_photo ? (
                        <img
                            src={user.profile_photo}
                            alt="Profile"
                            className="rounded-circle me-3"
                            width="80"
                            height="80"
                        />
                    ) : (
                        <div className="rounded-circle bg-light text-secondary d-flex align-items-center justify-content-center"
                            style={{ width: "80px", height: "80px" }}>
                            No Photo
                        </div>
                    )}
                    <h2 className="mb-0">{user.full_name}</h2>
                </div>
                <hr />
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Contact:</strong> {user.contact_number}</p>
                <p><strong>Address:</strong> {user.address}</p>
                <p><strong>Status:</strong> <span className="badge bg-success">{user.status}</span></p>
                <p><strong>Last Login:</strong> {new Date(user.last_login).toLocaleString()}</p>
                {user.role === "Customer" && user.consultant_name && (
                    <p><strong>Consultant:</strong> {user.consultant_name}</p>
                )}
                <button className="btn btn-primary mt-3">Edit Profile</button>
            </div>
        </div>
    );
};

export default Profile;
