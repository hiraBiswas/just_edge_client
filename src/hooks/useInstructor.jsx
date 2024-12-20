import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useInstructor = () => {
  const { user, loading } = useAuth();
  const axiosSecure = useAxiosSecure();

  // Ensure query runs only when user is loaded and authenticated
  const isQueryEnabled = !loading && user !== null;

  const { data: isInstructor, isLoading: isInstructorLoading, error } = useQuery({
    queryKey: [user?.email, 'isInstructor'],
    enabled: isQueryEnabled,
    queryFn: async () => {
      if (!user) {
        console.log('No user found, returning false');
        return false;
      }
      
      try {
        console.log('Fetching instructor status for email:', user.email);
        const res = await axiosSecure.get(`/users/instructor/${user.email}`);
        
        // Debug logging
        console.log('API Response:', res.data);
        console.log('User type from response:', res.data?.type);
        console.log('Is type instructor?', res.data?.type === 'instructor');
        
        // Check if we're getting the full user object or just the type
        if (res.data?.type === 'instructor') {
          return true;
        }
        
        // If we're getting just a boolean response
        if (typeof res.data === 'boolean') {
          return res.data;
        }
        
        // If we're getting the instructor status in a different format
        if (res.data?.isInstructor) {
          return true;
        }
        
        console.log('No instructor status found in response, returning false');
        return false;
        
      } catch (err) {
        console.error('Error fetching instructor status:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        return false;
      }
    },
    cacheTime: 1000 * 60 * 5, // 5 minutes
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Debug log the final result
  console.log('Final isInstructor value:', isInstructor);
  console.log('Loading state:', isInstructorLoading);
  console.log('Error state:', error);

  return [isInstructor, isInstructorLoading, error];
};

export default useInstructor;