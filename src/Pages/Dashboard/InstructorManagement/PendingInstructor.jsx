import React, { useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
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
    <div className="flex w-[1100px] flex-col min-h-screen">
      <div className="breadcrumbs text-sm mt-6">
        <ul className="flex space-x-2 text-gray-600">
          <li>
            <Link to="/dashboard" className="text-blue-900 text-xl font-medium hover:underline">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/dashboard/instructorManagement" className="text-blue-900 text-xl font-medium hover:underline">
              Instructor Management
            </Link>
          </li>
          <li className="text-gray-700 text-xl font-medium">
            Pending Instructor
          </li>
        </ul>
      </div>
      <ToastContainer />
      
      {loading ? (
        <div className="animate-pulse w-full mt-6 mx-auto">
          <table className="table w-[1100px] mx-auto">
            <thead className="bg-gray-200">
              <tr className="text-lg font-medium">
                <th>SI</th>
                <th>Profile</th>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Action</th>
              </tr>
            </thead>
          </table>
        </div>
      ) : combinedData.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-20 w-20 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="text-xl font-medium text-gray-600 mt-4">
            No Pending Instructor Requests
          </h3>
          <p className="text-gray-500 mt-2">
            There are currently no instructor applications waiting for approval.
          </p>
        </div>
      ) : (
        <>
          <table className="table w-[1000px] mx-auto mt-8">
            <thead className="bg-blue-950">
              <tr className="text-lg text-white font-medium">
                <th>SI</th>
                <th>Profile</th>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((instructor, index) => (
                <tr key={instructor._id}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={instructor.image || "https://via.placeholder.com/150"}
                      alt={instructor.name}
                      className="w-12 h-12 rounded-full"
                    />
                  </td>
                  <td>{instructor.name}</td>
                  <td>{instructor.email}</td>
                  <td>{instructor.contact}</td>
                  <td>
                    <button
                      className="btn btn-outline btn-success btn-xs mr-2"
                      onClick={() => handleApprove(instructor._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-outline btn-error btn-xs"
                      onClick={() => handleReject(instructor._id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
        </>
      )}
        <Toaster />
    </div>
  );
};

export default PendingInstructor;