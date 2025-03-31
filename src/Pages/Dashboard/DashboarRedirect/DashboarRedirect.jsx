import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAdmin from "../../../hooks/useAdmin";
import useInstructor from "../../../hooks/useInstructor";

const DashboardRedirect = () => {
  const [isAdmin, isAdminLoading] = useAdmin();
  const [isInstructor, isInstructorLoading] = useInstructor();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdminLoading || isInstructorLoading) return; // Wait for role check

    if (isAdmin) {
      navigate("/dashboard/adminDashboard", { replace: true });
    } else if (isInstructor) {
      navigate("/dashboard/instructorDashboard", { replace: true });
    } else {
      navigate("/dashboard/studentDashboard", { replace: true }); // Default for students
    }
  }, [isAdmin, isInstructor, isAdminLoading, isInstructorLoading, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <span className="loading loading-ring loading-lg"></span>
    </div>
  );
};

export default DashboardRedirect;
