import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { FaEyeSlash } from "react-icons/fa6";
import { IoEyeSharp } from "react-icons/io5";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { Link } from "react-router-dom";
import { FaEye, FaRegFileArchive } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";

const InstructorManagement = () => {
  const { register, handleSubmit, reset } = useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();
  const [users, setUsers] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const filteredInstructors = instructors.filter(
      (instructor) => !instructor.isDeleted && instructor.status === "Approved"
    );

    const combined = filteredInstructors
      .map((instructor) => {
        const userInfo = users.find((user) => user._id === instructor.userId);
        if (!userInfo) return null;

        return {
          _id: userInfo._id,
          name: userInfo.name,
          email: userInfo.email,
          image: userInfo.image,
          contact: instructor.contact,
        };
      })
      .filter(Boolean);

    return combined;
  }, [instructors, users]);

  const totalPages = Math.ceil(combinedData.length / itemsPerPage);
  const currentItems = combinedData
    .filter((instructor) =>
      instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="w-[1100px] mx-auto h-screen mt-6 flex flex-col">
      <div className="flex justify-end ">
        <div className="flex justify-between items-center w-full mb-4">
          <div className="flex items-center">
            <input
              className="input input-bordered"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn px-5 bg-blue-950 text-white">Search</button>
          </div>
          <div>
            <Link to="/dashboard/pendingInstructor">
              {" "}
              <button className="btn btn-outline text-bg-950">
                View Pending Instructor
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg mt-6 shadow-lg border border-gray-100 w-full overflow-hidden">
        {loading ? (
          <div className="animate-pulse w-full">
            <table className="w-full">
              <thead className="bg-blue-950">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider rounded-tl-lg">
                    Index
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                    Profile
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider rounded-tr-lg">
                    Action
                  </th>
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
                        <div className="h-8 w-8 bg-gray-100 rounded"></div>
                        <div className="h-8 w-8 bg-gray-100 rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-950">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider rounded-tl-lg">
                    Index
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                    Profile
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider rounded-tr-lg">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-gray-500 text-sm"
                    >
                      No instructors available.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((instructor, index) => (
                    <tr
                      key={instructor._id}
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-700">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap">
                        <img
                          src={
                            instructor.image ||
                            "https://via.placeholder.com/150"
                          }
                          alt={instructor.name}
                          className="w-10 h-10 rounded-full"
                        />
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium text-gray-900">
                        {instructor.name}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-700">
                        {instructor.email}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-700">
                        {instructor.contact}
                      </td>
                      <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => console.log("Edit")}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <MdEdit className="w-5 h-5" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Archive"
                          >
                            <FaRegFileArchive className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-end join my-4">
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
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default InstructorManagement;
