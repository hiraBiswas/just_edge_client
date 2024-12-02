import React, { useEffect, useState } from "react";
import { TiPlus } from "react-icons/ti";
import { Link } from "react-router-dom";
import { FaEye, FaRegFileArchive } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const InstructorContainer = () => {
  const axiosSecure = useAxiosSecure();
  const [instructors, setInstructors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for skeleton
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch users where type = "instructor"
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const usersResponse = await axiosSecure.get("/users");
        const instructorsResponse = await axiosSecure.get("/instructors");

        setUsers(usersResponse.data);
        setInstructors(instructorsResponse.data);
      } catch (error) {
        console.error("Error fetching instructors:", error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };
    fetchInstructors();
  }, [axiosSecure]);

  // Combine users and instructors data
  const combinedData = React.useMemo(() => {
    const combined = instructors
      .map((instructor) => {
        const userInfo = users.find((user) => user._id === instructor.userId);
        if (!userInfo) return null;

        return {
          _id: userInfo._id,
          name: userInfo.name,
          email: userInfo.email,
          image: userInfo.image,
          contact: instructor.contact, // Use the contact from instructor data
        };
      })
      .filter(Boolean); // Remove null values

    return combined;
  }, [instructors, users]);

  // Paginate the combined data
  const totalPages = Math.ceil(combinedData.length / itemsPerPage);
  const currentItems = combinedData
    .filter((instructor) =>
      instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleArchive = async (instructorId) => {
    try {
      const response = await axiosSecure.patch(`/instructors/${instructorId}`, {
        isDeleted: true,
      });

      if (response.status === 200) {
        setInstructors((prevInstructors) =>
          prevInstructors.map((instructor) =>
            instructor._id === instructorId ? { ...instructor, isDeleted: true } : instructor
          )
        );
        toast.success("Instructor archived successfully!");
      } else {
        toast.error("Failed to archive instructor.");
      }
    } catch (error) {
      console.error("Error archiving instructor:", error);
      toast.error("Failed to archive instructor.");
    }
  };

  return (
    <div className="flex flex-col  w-[1100px] mx-auto">
      <div className="overflow-x-auto flex-grow">
        {/* Table Section with Skeleton Loader */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="animate-pulse w-full mt-8 mx-auto">
              <table className="table w-[1000px] mx-auto">
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
                <tbody>
                  {/* Full-width Skeleton Rows */}
                  {[...Array(itemsPerPage)].map((_, index) => (
                    <tr key={index}>
                      <td colSpan="6">
                        <div className="h-8 bg-gray-100 rounded-lg"></div> {/* Adjusted row height */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <table className="table w-[1000px] mt-8">
              <thead className="bg-blue-950 text-white">
                <tr className="text-lg font-medium">
                  <th>#</th>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((instructor, index) => (
                  <tr
                    key={instructor._id}
                    className={instructor.isDeleted ? "opacity-50" : "h-5"}
                    style={{ height: "20px" }} // Adjusted row height
                  >
                    <th>{(currentPage - 1) * itemsPerPage + index + 1}</th>
                    <td>
                      <img
                        src={instructor.image || "https://via.placeholder.com/150"}
                        alt={instructor.name || "Anonymous"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </td>
                    <td>{instructor.name}</td>
                    <td>{instructor.email}</td>
                    <td>{instructor.contact || "N/A"}</td>
                    <td className="flex items-center justify-center gap-4">
                      <Link to={`/dashboard/instructorDetails/${instructor._id}`}>
                        <FaEye className="text-blue-950 cursor-pointer hover:scale-105" />
                      </Link>
                      <Link to={`/dashboard/instructorUpdate/${instructor._id}`}>
                        <MdEdit className="text-green-600 cursor-pointer hover:scale-105" />
                      </Link>
                      <FaRegFileArchive
                        className="text-red-600 cursor-pointer hover:scale-105"
                        onClick={() => handleArchive(instructor._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-end join my-4 mb-20">
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

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default InstructorContainer;
