import { Link, NavLink, Outlet, useNavigate, Navigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Providers/AuthProvider";
import useAdmin from "../hooks/useAdmin";
import useInstructor from "../hooks/useInstructor";
import { AiFillHome } from "react-icons/ai";
import { MdSpaceDashboard } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { MdPending } from "react-icons/md";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { VscCombine } from "react-icons/vsc";
import { MdAssignmentInd } from "react-icons/md";
import { ImProfile } from "react-icons/im";
import { AiOutlineProfile } from "react-icons/ai";
import {
  Users, 
  ClipboardCheck,
  BookOpenCheck, 
  BarChart4,
  FileText,
  Bell,
  Bookmark,
  UserCheck,
  RefreshCw,
  PlusCircle
} from "lucide-react";
import "./dashboard.css"

const Dashboard = () => {
  const [isAdmin, isAdminLoading] = useAdmin();
  const [isInstructor, isInstructorLoading] = useInstructor();
  const { user, logOut } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(true);
  
  // Handle initial redirection
  useEffect(() => {
    if (isAdminLoading || isInstructorLoading) return;
    
    const currentPath = window.location.pathname;
    
    // Only redirect if we're at the dashboard root
    if (currentPath === "/dashboard") {
      if (isAdmin) {
        navigate("/dashboard/adminDashboard", { replace: true });
      } else if (isInstructor) {
        navigate("/dashboard/instructorDashboard", { replace: true });
      } else {
        navigate("/dashboard/studentDashboard", { replace: true });
      }
    }
    
    setIsRedirecting(false);
  }, [isAdmin, isInstructor, isAdminLoading, isInstructorLoading, navigate]);

  const handleSignOut = () => {
    logOut()
      .then((result) => {
        console.log(result.user);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Show loading while determining role or during redirection
  if (isAdminLoading || isInstructorLoading || isRedirecting) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-ring loading-lg"></span>
      </div>
    );
  }

  const navLinkClass = ({ isActive }) => 
    `flex items-center gap-3 p-3 rounded-lg transition-colors ${
      isActive 
        ? 'bg-blue-800 text-white' 
        : 'hover:bg-blue-900 hover:text-sky-200'
    }`;

  return (
    <div className="flex">
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center ">
          <div className="">
            <Outlet />
          </div>
          <label
            htmlFor="my-drawer-2"
            className="btn btn-primary drawer-button lg:hidden"
          >
            Open drawer
          </label>
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
          <ul className="p-4 w-80 min-h-full bg-blue-950 text-white space-y-1">
            <li className="mb-4">
              <Link to="/" className="text-2xl font-bold text-white hover:text-sky-200">
                JUST_EDGE
              </Link>
            </li>

            {isAdmin ? (
              <>
                <li><NavLink className={navLinkClass} to="/dashboard/adminDashboard"><BarChart4 /> Dashboard</NavLink></li>
                <li><NavLink className={navLinkClass} to="/dashboard/courseManagement"><BookOpenCheck /> Course Management</NavLink></li>
                <li><NavLink className={navLinkClass} to="/dashboard/instructorManagement"><UserCheck /> Instructor Management</NavLink></li>
                <li><NavLink className={navLinkClass} to="/dashboard/batchManagement"><Users /> Batch Management</NavLink></li>
                <li><NavLink className={navLinkClass} to="/dashboard/courseAssignment"><Bookmark /> Batch Enrollment</NavLink></li>
                <li><NavLink className={navLinkClass} to="/dashboard/publishResult"><ClipboardCheck />Result Management</NavLink></li>
                <li><NavLink className={navLinkClass} to="/dashboard/noticeManagement"><Bell /> Notice Management</NavLink></li>
              </>
            ) : isInstructor ? (
              <>
                <li><NavLink className={navLinkClass} end to="/dashboard/instructorDashboard"><BarChart4 /> Dashboard</NavLink></li>
                <li><NavLink className={navLinkClass} to="/dashboard/resultUpload"><FileText /> Result</NavLink></li>
              </>
            ) : (
              <>
                <li><NavLink className={navLinkClass} to="/dashboard/studentDashboard"><BarChart4 /> Dashboard</NavLink></li>
                <li><NavLink className={navLinkClass} to="/dashboard/profileAndDocument"><ImProfile /> Profile and Document</NavLink></li>
                <li><NavLink className={navLinkClass} to="/dashboard/resultDisplay"><FileText /> Result</NavLink></li>
              </>
            )}

            <li className="pt-4 mt-4 border-t border-blue-800">
              <Link to="/" className={navLinkClass({ isActive: false })}>
                <AiFillHome /> Home
              </Link>
            </li>
            
            <li>
              <button 
                onClick={handleSignOut}
                className={`${navLinkClass({ isActive: false })} w-full text-left`}
              >
                <IoIosLogOut /> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;