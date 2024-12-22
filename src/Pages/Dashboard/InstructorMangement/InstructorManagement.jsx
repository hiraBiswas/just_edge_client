import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
    const combined = instructors
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
    <div className="w-[1100px] mx-auto h-screen flex flex-col">
      <div className="flex justify-end mt-4">
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
          <Link to="/dashboard/approveInstructor">  <button
              className="btn btn-outline text-bg-950"
            >
              <FaPlus /> Approve Instructor
            </button></Link>
          </div>
        </div>
      </div>



      {/* Table */}
      <div className="flex-grow overflow-x-auto">
        {loading ? (
          <div className="animate-pulse w-full mt-8 mx-auto">
            <table className="table w-[1100px] mx-auto">
              <thead className="bg-gray-200">
                <tr className="text-lg  font-medium">
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
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
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
                      className="btn btn-outline btn-warning btn-xs mr-2"
                      onClick={() => console.log("Edit")}
                    >
                      <MdEdit size={18} />
                    </button>
                    <button className="btn btn-outline btn-error btn-xs">
                      <FaRegFileArchive size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  );
};

export default InstructorManagement;
