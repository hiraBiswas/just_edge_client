import { Link, NavLink, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../Providers/AuthProvider";
import useAdmin from "../hooks/useAdmin";
import { AiFillHome } from "react-icons/ai";
import { FaBorderAll } from "react-icons/fa";
import { FaTruckMoving } from "react-icons/fa";
import './dashboard.css'
import { MdSpaceDashboard } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { PiUsersFill } from "react-icons/pi";
import { MdOutlineAddCircleOutline } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import { TbBrandBooking } from "react-icons/tb";
import { MdPending } from "react-icons/md";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { VscCombine } from "react-icons/vsc";
import { MdAssignmentInd } from "react-icons/md";

const Dashboard = () => {
  const [isAdmin, isAdminLoading] = useAdmin();  // Destructure isAdmin and isAdminLoading
  const { user, logOut } = useContext(AuthContext);

  const handleSignOut = () => {
    logOut()
      .then(result => {
        console.log(result.user);
      })
      .catch(error => {
        console.error(error);
      });
  };

  if (isAdminLoading) {
    // Show loading spinner while admin status is being checked
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-ring loading-lg"></span> {/* Loader */}
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
          <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">
            Open drawer
          </label>
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
          <ul className="p-4 w-80 min-h-full bg-blue-950 text-white text-lg lg:text-xl font-semibold mr-5">
            <Link to="/">
              <h3 className="text-2xl font-bold text-white pb-5">JUST_EDGE</h3>
            </Link>
            {isAdmin ? (
              <>
                <li className="hover:text-sky-200 flex flex-row pt-3 py-1">
                  <NavLink className="hover:text-sky-200 flex justify-center items-center gap-3" to="/dashboard/adminHome">
                    <MdSpaceDashboard className="text-xl text-white hover:text-amber-500" /> Dashboard
                  </NavLink>
                </li>
                <li className="hover:text-sky-200 flex flex-row pt-3 py-1">
                  <NavLink className="hover:text-sky-200 flex justify-center items-center gap-3" to="/dashboard/courseManagement">
                    <MdSpaceDashboard className="text-xl text-white hover:text-amber-500" /> Course Management
                  </NavLink>
                </li>
                <li className="hover:text-sky-200 flex flex-row pt-3 py-1">
                  <NavLink className="hover:text-sky-200 flex justify-center items-center gap-3" to="/dashboard/instructorManagement">
                    <MdSpaceDashboard className="text-xl text-white hover:text-amber-500" /> Instructor Management
                  </NavLink>
                </li>
                <li className="hover:text-sky-200 flex flex-row pt-3 py-1">
                  <NavLink className="hover:text-sky-200 flex justify-center items-center gap-3" to="/dashboard/batchManagement">
                    <VscCombine className="text-xl text-white hover:text-amber-500" /> Batch Management
                  </NavLink>
                </li>
                <li className="hover:text-sky-200 flex flex-row py-1">
                  <NavLink className="hover:text-sky-200 flex items-center gap-3" to="/dashboard/courseAssignment">
                    <MdAssignmentInd className="text-xl text-white hover:text-sky-200" />
                    Course Assignment
                  </NavLink>
                </li>
              </>
            ) : (
              <>
                <li className="hover:text-sky-200 flex flex-row pt-3 py-2">
                  <NavLink className="hover:text-sky-200 flex justify-center items-center gap-3" to="/dashboard/allRequest">
                    <MdSpaceDashboard className="text-xl text-white hover:text-amber-500" /> All Request
                  </NavLink>
                </li>
                <li className="hover:text-sky-200 flex flex-row py-2">
                  <NavLink className="hover:text-sky-200 flex justify-center items-center gap-3" to="/dashboard/approvedRequest">
                    <IoMdCheckmarkCircle className="text-xl text-white hover:text-amber-500" /> Approved Request
                  </NavLink>
                </li>
                <li className="hover:text-sky-200 flex flex-row py-2 pb-3">
                  <NavLink className="hover:text-sky-200 flex justify-center items-center gap-3" to="/dashboard/pendingRequest">
                    <MdPending className="text-xl text-white hover:text-amber-500" /> Pending Request
                  </NavLink>
                </li>
              </>
            )}
            <hr />
            <Link className="hover:text-sky-200 flex flex-row gap-3 items-center mt-4 pb-2" to="/">
              <AiFillHome className="text-xl text-white hover:text-amber-500" />
              <h3 className="font-semibold">Home</h3>
            </Link>

            <Link className="flex items-center gap-3">
              <IoIosLogOut className="text-xl text-white hover:text-sky-200" />
              <button onClick={handleSignOut} className="text-white font-semibold hover:text-sky-200">
                Logout
              </button>
            </Link>
          </ul>
        </div>
      </div>
      {/* Main content */}
    </div>
  );
};

export default Dashboard;
