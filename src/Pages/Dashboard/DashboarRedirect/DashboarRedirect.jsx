import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAdmin from "../../../hooks/useAdmin";
import useInstructor from "../../../hooks/useInstructor";

const DashboardRedirect = () => {
  const [isAdmin, isAdminLoading] = useAdmin();
  const [isInstructor, isInstructorLoading] = useInstructor();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Only redirect when we have definitive role information
    if (!isAdminLoading && !isInstructorLoading) {
      if (isAdmin) {
        navigate("/dashboard/adminDashboard", { replace: true });
      } else if (isInstructor) {
        navigate("/dashboard/instructorDashboard", { replace: true });
      } else {
        navigate("/dashboard/studentDashboard", { replace: true });
      }
    }
  }, [isAdmin, isInstructor, isAdminLoading, isInstructorLoading, navigate]);

  // Always show loader until redirect happens
  return (
    <div className="flex justify-center items-center h-screen">
      <span className="loading loading-ring loading-lg"></span>
    </div>
  );
};

export default DashboardRedirect;