import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

const fetchAssignedCustomers = async () => {
    const { data } = await axiosInstance.get("/cons_cust/assignedcustomers/");
    return data;
};

export default function useAssignedCustomers() {
    return useQuery({
        queryKey: ["assignedCustomers"],
        queryFn: fetchAssignedCustomers,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
}
