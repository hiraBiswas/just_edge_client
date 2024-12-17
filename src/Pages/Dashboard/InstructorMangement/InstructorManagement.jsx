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

  const onSubmit = async (data) => {
    const { name, email, contact } = data;
    const image = "https://i.ibb.co/JvWtdNv/anonymous-user-circle-icon-vector-illustration-flat-style-with-long-shadow-520826-1931.jpg";
    const password = "123456"; 
    const type = "instructor";
    
    try {
      setIsLoading(true); // Start loading state
  
      // Create user
      const createUserResponse = await axiosSecure.post("/users", {
        email,
        password,
        name,
        image,
        type,
      });
      
      // Check if user is created
      if (createUserResponse.data.insertedId) {
        const userId = createUserResponse.data.insertedId;
  
        // Create instructor
        const createInstructorResponse = await axiosSecure.post("/instructors", {
          userId, 
          contact,
          isDeleted: false,  
        });
  
        if (createInstructorResponse.status === 201) {
          // Re-fetch the list of instructors after successful creation
          await fetchInstructors(); // Ensure you have the fetchInstructors function defined
          document.getElementById('my_modal_5').close(); // Close the modal
          reset(); 
        } else {
          toast.error("Failed to register instructor in instructor collection.");
        }
      } else {
        toast.error(createUserResponse.data.message || "User registration failed.");
      }
    } catch (error) {
      console.error("Unexpected error during registration:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false); // Stop loading state
    }
  };
  

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
            <button
              className="btn btn-outline text-bg-950"
              onClick={() => document.getElementById('my_modal_5').showModal()} // Open the modal
            >
              <FaPlus /> Add New Instructor
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h2 className="text-xl font-semibold text-center mb-5">Add New Instructor</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6 ">
            <div className="flex items-center gap-4">
              <label className="label w-1/3">
                <span className="label-text">Name *</span>
              </label>
              <input
                {...register("name", { required: true })}
                type="text"
                placeholder="Enter name"
                className="input input-bordered w-2/3"
                required
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="label w-1/3">
                <span className="label-text">Email *</span>
              </label>
              <input
                {...register("email", { required: true })}
                type="email"
                placeholder="Enter email"
                className="input input-bordered w-2/3"
                required
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="label w-1/3">
                <span className="label-text">Contact *</span>
              </label>
              <input
                {...register("contact", { required: true })}
                type="text"
                placeholder="Enter contact number"
                className="input input-bordered w-2/3"
                required
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="label w-1/3">
                <span className="label-text">Password</span>
              </label>
              <div className="relative w-2/3">
                <input
                  type={showPassword ? "text" : "password"}
                  value="123456"
                  readOnly
                  className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <IoEyeSharp size={20} /> : <FaEyeSlash size={20} />}
                </button>
              </div>
            </div>

            <div className="flex gap-4 mt-4 justify-center">
  <button
    type="submit"
    className={`btn flex justify-center items-center gap-2 bg-blue-950 text-white ${isLoading ? "cursor-not-allowed opacity-70" : ""}`}
    disabled={isLoading}
  >
    {isLoading ? (
      <>
        <span>Registering</span>
        <span className="loading loading-ball loading-md"></span>
      </>
    ) : (
      "Register Instructor"
    )}
  </button>
  <button
    className="absolute top-2 right-2 text-xl"
    onClick={() => document.getElementById('my_modal_5').close()} // Close the modal
  >
    <RxCross2 />
  </button>
</div>


          </form>
        </div>
      </dialog>

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
