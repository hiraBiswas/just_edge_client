import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
          _id: instructor._id, // Use instructor._id here
          name: userInfo.name,
          email: userInfo.email,
          image: userInfo.image,
          contact: instructor.contact,
        };
      })
      .filter(Boolean); // Ensure no null values are included

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
        await fetchInstructors(); // Refetch the updated list
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
      <div className="flex flex-col min-h-screen">
             <div className="breadcrumbs text-sm mt-12">
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
          <div className="animate-pulse w-full mt-8 mx-auto">
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
        ) : (
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
        )}
    
        {/* Pagination */}
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
      </div>
    );
 
};

export default PendingInstructor;
