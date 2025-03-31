import { Link, Outlet } from "react-router-dom";

const InstructorDashboard = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/5 bg-blue-950 text-white p-5">
        <h2 className="text-xl font-bold mb-5">Instructor Dashboard</h2>
        <ul className="space-y-3">
          <li>
            <Link to="classes" className="block p-2 hover:bg-blue-800 rounded">
              📌 Record Class
            </Link>
          </li>
          <li>
            <Link to="routine" className="block p-2 hover:bg-blue-800 rounded">
              📅 View Routine
            </Link>
          </li>
          <li>
            <Link to="results" className="block p-2 hover:bg-blue-800 rounded">
              📊 Update Results
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-4/5 p-5">
        <Outlet />
      </div>
    </div>
  );
};

export default InstructorDashboard;
