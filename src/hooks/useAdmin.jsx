import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useAdmin = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();
    
    const { 
        data: isAdmin, 
        isPending: isAdminLoading,
        isFetching: isAdminFetching
    } = useQuery({
        queryKey: ['adminStatus', user?.email],
        enabled: !!user?.email && !loading, // Only enable if user email exists and auth isn't loading
        queryFn: async () => {
            try {
                console.log('Checking admin status for', user.email);
                const res = await axiosSecure.get(`/users/admin/${user.email}`);
                return res.data?.admin || false;
            } catch (error) {
                console.error('Error checking admin status:', error);
                return false; // Default to false if there's an error
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes before refetching
        cacheTime: 15 * 60 * 1000, // 15 minutes cache lifetime
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnReconnect: false, // Don't refetch on network reconnect
        retry: 1, // Only retry once if the query fails
    });

    // Combine loading states from auth and the query
    const isLoading = loading || (!!user?.email && isAdminLoading);
    
    return [isAdmin, isLoading, isAdminFetching];
};

export default useAdmin;