import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
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
import "./dashboard.css";

const Dashboard = () => {
  const [isAdmin, isAdminLoading] = useAdmin();
  const [isInstructor, isInstructorLoading] = useInstructor();
  const { user, logOut } = useContext(AuthContext);

  const handleSignOut = () => {
    logOut()
      .then((result) => {
        console.log(result.user);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  if (isAdminLoading || isInstructorLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-ring loading-lg"></span>
      </div>
    );
  }

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
          <label
            htmlFor="my-drawer-2"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="p-4 w-80 min-h-full bg-blue-950 text-white text-lg lg:text-xl font-semibold mr-5">
            <Link to="/">
              <h3 className="text-2xl font-bold text-white pb-5">JUST_EDGE</h3>
            </Link>

            {/* Admin routes */}
            {isAdmin ? (
              <>
                <li className="hover:text-sky-200 flex flex-row pt-3 py-1">
                  <NavLink
                    className="hover:text-sky-200 flex justify-center items-center gap-3"
                    to="/dashboard/adminDashboard"
                  >
                    <MdSpaceDashboard className="text-xl text-white hover:text-amber-500" />{" "}
                    Dashboard
                  </NavLink>
                </li>
                <li className="hover:text-sky-200 flex flex-row pt-3 py-1">
                  <NavLink
                    className="hover:text-sky-200 flex justify-center items-center gap-3"
                    to="/dashboard/courseManagement"
                  >
                    <MdSpaceDashboard className="text-xl text-white hover:text-amber-500" />{" "}
                    Course Management
                  </NavLink>
                </li>
                <li className="hover:text-sky-200 flex flex-row pt-3 py-1">
                  <NavLink
                    className="hover:text-sky-200 flex justify-center items-center gap-3"
                    to="/dashboard/instructorManagement"
                  >
                    <MdSpaceDashboard className="text-xl text-white hover:text-amber-500" />{" "}
                    Instructor Management
                  </NavLink>
                </li>
                <li className="hover:text-sky-200 flex flex-row pt-3 py-1">
                  <NavLink
                    className="hover:text-sky-200 flex justify-center items-center gap-3"
                    to="/dashboard/batchManagement"
                  >
                    <VscCombine className="text-xl text-white hover:text-amber-500" />{" "}
                    Batch Management
                  </NavLink>
                </li>
                <li className="hover:text-sky-200 flex flex-row py-1">
                  <NavLink
                    className="hover:text-sky-200 flex items-center gap-3"
                    to="/dashboard/courseAssignment"
                  >
                    <MdAssignmentInd className="text-xl text-white hover:text-sky-200" />
                    Batch Assignment
                  </NavLink>
                </li>

                <li className="hover:text-sky-200 flex flex-row py-1">
                  <NavLink
                    className="hover:text-sky-200 flex items-center gap-3"
                    to="/dashboard/noticeManagement"
                  >
                    <MdAssignmentInd className="text-xl text-white hover:text-sky-200" />
                    Notice Management
                  </NavLink>
                </li>
              </>
            ) : isInstructor ? (
              // Instructor-related routes
              <>
                <li className="hover:text-sky-200 flex flex-row pt-3 py-2">
                  <NavLink
                    className="hover:text-sky-200 flex justify-center items-center gap-3"
                    end
                    to="/dashboard"
                  >
                    <MdSpaceDashboard className="text-xl text-white hover:text-blue-600" />{" "}
                    Dashboard
                  </NavLink>
                </li>
                <li className="hover:text-sky-200 flex flex-row pt-3 py-2">
                  <NavLink
                    className="hover:text-sky-200 flex justify-center items-center gap-3"
                    to="/dashboard/instructorRoutine"
                  >
                    <MdSpaceDashboard className="text-xl text-white hover:text-blue-600" />{" "}
                    Routine
                  </NavLink>
                </li>
                <li className="hover:text-sky-200 flex flex-row pt-3 py-2">
                  <NavLink
                    className="hover:text-sky-200 flex justify-center items-center gap-3"
                    to="/dashboard/classes"
                  >
                    <MdSpaceDashboard className="text-xl text-white hover:text-blue-600" />{" "}
                    Classes
                  </NavLink>
                </li>

                <li className="hover:text-sky-200 flex flex-row pt-3 py-2">
                  <NavLink
                    className="hover:text-sky-200 flex justify-center items-center gap-3"
                    to="/dashboard/result"
                  >
                    <MdSpaceDashboard className="text-xl text-white hover:text-blue-600" />{" "}
                    Result
                  </NavLink>
                </li>
              </>
            ) : (
              // Default routes for normal users
              <>
                <li className="hover:text-sky-200 flex flex-row py-2 pb-3">
                  <NavLink
                    className="hover:text-sky-200 flex justify-center items-center gap-3"
                    to="/dashboard/studentDashboard"
                  >
                    <MdPending className="text-xl text-white hover:text-blue-600" />{" "}
                  Dashboard
                  </NavLink>
                </li>

                <li className="hover:text-sky-200 flex flex-row pt-3 py-2">
                  <NavLink
                    className="hover:text-sky-200 flex justify-center items-center gap-3"
                    to="/dashboard/profileAndDocument"
                  >
                    <ImProfile className="text-xl text-white hover:text-blue-600" />{" "}
                    Profile and Document Update
                  </NavLink>
                </li>
          
            
              </>
            )}

            <hr />
            <Link
              className="hover:text-sky-200 flex flex-row gap-3 items-center mt-4 pb-2"
              to="/"
            >
              <AiFillHome className="text-xl text-white hover:text-blue-600" />
              <h3 className="font-semibold">Home</h3>
            </Link>

            <Link className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <IoIosLogOut className="text-xl text-white hover:text-sky-200" />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleSignOut();
                  }}
                  className="text-white font-semibold hover:text-sky-200"
                >
                  Logout
                </button>
              </div>
            </Link>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
