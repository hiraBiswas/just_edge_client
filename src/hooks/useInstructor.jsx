import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useInstructor = () => {
  const { user, loading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { data: isInstructor = false, isLoading: isInstructorLoading } = useQuery({
    queryKey: ['isInstructor', user?.email],
    enabled: !!user?.email && !loading,
    queryFn: async () => {
      try {
        // Option 1: Fetch by email
        const res = await axiosSecure.get(`/users/instructor/${user.email}`);
        
        // If the endpoint returns the full user object
        if (res.data?.type === 'instructor') {
          return true;
        }
        
        // If the endpoint returns a boolean directly
        if (typeof res.data === 'boolean') {
          return res.data;
        }
        
        // If the endpoint returns an object with isInstructor property
        if (typeof res.data?.isInstructor === 'boolean') {
          return res.data.isInstructor;
        }

        // Option 2: Alternative approach - fetch user data directly
        const userRes = await axiosSecure.get(`/users/${user.email}`);
        return userRes.data?.type === 'instructor';
        
      } catch (error) {
        console.error("Error checking instructor status:", error);
        return false;
      }
    },
    // Cache settings
    staleTime: 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });

  return [isInstructor, isInstructorLoading];
};

export default useInstructor;