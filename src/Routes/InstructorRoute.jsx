import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useInstructor from "../hooks/useInstructor";

const InstructorRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [isInstructor, isInstructorLoading] = useInstructor();
  const location = useLocation();

  // Show loading spinner while checking auth status and instructor status
  if (loading || isInstructorLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-ring loading-lg"></span>
      </div>
    );
  }

  // If user is authenticated and an instructor, render the children
  if (user && isInstructor) {
    return children;
  }

  // If not an instructor, redirect to homepage
  return <Navigate to="/" state={{ from: location }} replace />;
};

export default InstructorRoute;