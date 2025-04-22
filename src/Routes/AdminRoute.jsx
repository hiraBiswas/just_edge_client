import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAdmin from "../hooks/useAdmin";

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const [isAdmin, isAdminLoading] = useAdmin();
    const location = useLocation();
    
    // Show loading indicator while either auth or admin status is loading
    if (loading || isAdminLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-ring loading-lg"></span>
            </div>
        );
    }
    
    // Only render children if user exists and is admin
    if (user && isAdmin) {
        return children;
    }
    
    // Redirect to the home page if user is not an admin
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
};

export default AdminRoute;