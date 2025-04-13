import { createContext, useState, useEffect } from "react";
import useAxiosPublic from "../hooks/useAxiosPublic";
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";



// Context
export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Manage user data in state
  const [loading, setLoading] = useState(true); // Loading state
  const axiosPublic = useAxiosPublic(); // Axios instance for public requests


  const loginUser = async (email, password) => {
    try {
      setLoading(true);
      const response = await axiosPublic.post("/login", {
        email,
        password,
      });
  
      if (response.data.token) {
        const { token, user } = response.data;
  
        // Store token and user data in localStorage
        localStorage.setItem("access-token", token);
        localStorage.setItem("user", JSON.stringify(user));
  
        setUser(user);
        toast.success("Login successful!");
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";
      throw new Error(errorMessage); // Throw the error so the calling function can handle it
    } finally {
      setLoading(false);
    }
  };
  
  
  

  // Logout user function
  const logOut = async () => {
   
  
    try {
      setLoading(true);
  
      // Clear localStorage
      localStorage.removeItem('access-token');
      setUser(null);
     
  
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error('Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Check authentication on initial load (i.e., if token exists)
  useEffect(() => {
    const token = localStorage.getItem('access-token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      // If token and user data are available in localStorage, set state
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Log the user state after loading
      console.log('User after useEffect (on page load):', parsedUser);
    } else {
      // If not authenticated, clear state and redirect (if necessary)
      setUser(null);
      console.log('No token found, user is logged out.');
    }

    setLoading(false);
  }, []);

  // Context value to be provided
  const authInfo = {
    user,
    loading,
    loginUser,
    logOut,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
      <Toaster />
    </AuthContext.Provider>
  );
};

export default AuthProvider;
