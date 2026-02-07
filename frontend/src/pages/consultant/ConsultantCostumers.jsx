import React from 'react';
import { Link } from 'react-router-dom'; // Import Link to navigate
import { FaTrashAlt } from 'react-icons/fa';
import useAssignedCustomers from '../../hooks/useAssignedCustomers'; // Assuming custom hook to fetch customers

export default function ConsultantCustomer() {
    const { data, isLoading, isError } = useAssignedCustomers(); // Fetching customers

    if (isLoading) return <p>Loading customers...</p>;
    if (isError) return <p>Error fetching customers.</p>;

    const customers = data?.customers || [];

    const handleDelete = (customerId) => {
        console.log(`Delete customer with ID: ${customerId}`);
        // Call the delete API here
    };

    return (
        <div>
            <h1>Hi Consultant!</h1>
            <h2>Assigned Customers</h2>

            {customers.length === 0 ? (
                <p>No customers assigned yet.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Joined On</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.id}>
                                    <td>{customer.id}</td>
                                    <td>
                                        <Link to={`/layout/customer_portfolio/${customer.id}`} className="text-primary">
                                            {customer.name}
                                        </Link>
                                    </td>
                                    <td>{customer.email}</td>
                                    <td>{new Date(customer.date_joined).toLocaleDateString()}</td>
                                    <td>{customer.status}</td>
                                    <td>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDelete(customer.id)}
                                        >
                                            <FaTrashAlt />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
