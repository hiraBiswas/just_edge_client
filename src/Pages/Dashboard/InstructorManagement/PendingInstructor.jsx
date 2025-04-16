import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { Link } from "react-router-dom";

const PendingInstructor = () => {
  const [users, setUsers] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const axiosSecure = useAxiosSecure();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch instructors and users
  const fetchInstructors = async () => {
    try {
      const usersResponse = await axiosSecure.get("/users");
      const instructorsResponse = await axiosSecure.get("/instructors");

      setUsers(usersResponse.data);
      setInstructors(instructorsResponse.data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, [axiosSecure]);

  // Combine users and instructors data
  const combinedData = React.useMemo(() => {
    const combined = instructors
      .filter(
        (instructor) => instructor.status === "Pending" && !instructor.isDeleted
      )
      .map((instructor) => {
        const userInfo = users.find((user) => user._id === instructor.userId);
        if (!userInfo) return null;

        return {
          _id: instructor._id,
          name: userInfo.name,
          email: userInfo.email,
          image: userInfo.image,
          contact: instructor.contact,
        };
      })
      .filter(Boolean);

    return combined;
  }, [instructors, users]);

  // Dynamic handler for updating instructor
  const handleUpdateInstructor = async (instructorId, updateFields) => {
    try {
      const response = await axiosSecure.patch(
        `/instructors/${instructorId}`,
        updateFields
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchInstructors();
      } else {
        toast.error(response.data.message || "Failed to update instructor");
      }
    } catch (error) {
      console.error("Error updating instructor:", error);
      const errorMessage =
        error.response?.data?.message || "Error updating instructor";
      toast.error(errorMessage);
    }
  };

  // Approve an instructor
  const handleApprove = (instructorId) => {
    handleUpdateInstructor(instructorId, { status: "Approved" });
  };

  // Reject an instructor
  const handleReject = (instructorId) => {
    handleUpdateInstructor(instructorId, { status: "Rejected" });
  };

  // Pagination logic
  const totalPages = Math.ceil(combinedData.length / itemsPerPage);
  const currentItems = combinedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex w-full max-w-[1050px] flex-col min-h-screen mx-auto px-4">
      <div className="breadcrumbs text-sm mt-6">
        <ul className="flex space-x-2 text-gray-600">
          <li>
            <Link
              to="/dashboard"
              className="text-blue-900 text-xl font-medium hover:underline"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/instructorManagement"
              className="text-blue-900 text-xl font-medium hover:underline"
            >
              Instructor Management
            </Link>
          </li>
          <li className="text-gray-700 text-xl font-medium">
            Pending Instructor
          </li>
        </ul>
      </div>
      <Toaster position="top-center" reverseOrder={false} />

      <div className="bg-white rounded-lg mt-6 shadow-lg border border-gray-100 w-full overflow-hidden">
  {loading ? (
    <div className="animate-pulse w-full">
      <table className="w-full">
        <thead className="bg-blue-950">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider rounded-tl-lg">Index</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">Profile</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">Email</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">Contact</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider rounded-tr-lg">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {[...Array(itemsPerPage)].map((_, index) => (
            <tr key={index} className="hover:bg-blue-50">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-5 bg-gray-100 rounded w-8"></div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-12 w-12 bg-gray-100 rounded-full"></div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-5 bg-gray-100 rounded w-32"></div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-5 bg-gray-100 rounded w-48"></div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="h-5 bg-gray-100 rounded w-24"></div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-20 bg-gray-100 rounded"></div>
                  <div className="h-8 w-20 bg-gray-100 rounded"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="w-[1050px]  overflow-x-auto">
      <table className="w-[1050px]">
        {/* Table Header - always shown */}
        <thead className="bg-blue-950">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider rounded-tl-lg">Index</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">Profile</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">Email</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">Contact</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider rounded-tr-lg">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {combinedData.length > 0 ? (
            currentItems.map((instructor, index) => (
              <tr key={instructor._id} className="hover:bg-blue-50 transition-colors duration-150">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <img
                    src={instructor.image || "https://via.placeholder.com/150"}
                    alt={instructor.name}
                    className="w-12 h-12 rounded-full"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {instructor.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {instructor.email}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {instructor.contact}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleApprove(instructor._id)}
                      className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(instructor._id)}
                      className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="py-12 text-center">
       
                <h3 className="text-xl font-medium text-gray-600 mt-4">
                  No Pending Instructor Requests
                </h3>
             
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )}
  </div>

      {/* Pagination - Only show if there are items */}
      {combinedData.length > 0 && (
        <div className="flex justify-end join my-4 mt-auto">
          <button
            className="join-item btn"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>
          <button className="join-item btn">{`Page ${currentPage}`}</button>
          <button
            className="join-item btn"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PendingInstructor;
