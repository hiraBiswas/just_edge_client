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
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../../../Firebase/firebase.config";




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
  const itemsPerPage = 8;


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
    fetchInstructors(); // Fetch instructors on initial load
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


const getToken = async () => {
  const auth = getAuth(app);  // Get the auth instance using the initialized app
  const currentUser = auth.currentUser;  // Check the current authenticated user


  if (currentUser) {
    try {
      const idToken = await currentUser.getIdToken(true); // Force refresh of the token
      console.log("Firebase ID Token:", idToken);
      return idToken;
    } catch (error) {
      console.error("Error getting Firebase ID token:", error);
      toast.error("Network issue. Please check your connection.");
    }
  } else {
    console.log("No user is logged in");
    toast.error("User is not authenticated.");
    return null;
  }
};


    const onSubmit = async (data) => {
      const { name, email, contact } = data;
      const image = "https://i.ibb.co/JvWtdNv/anonymous-user-circle-icon-vector-illustration-flat-style-with-long-shadow-520826-1931.jpg";
      const password = "123456"; // Default password for instructors
      const type = "instructor";
    
      try {
        setIsLoading(true);
        toast.info("Starting instructor registration process...");
// Step 1: Get Firebase ID token
const idToken = await getToken();  // Get the token using getToken function

if (!idToken) {
  toast.error("User is not authenticated.");
  return;
}
    // Step 2: Create user in Firebase via backend
    const createUserResponse = await axiosSecure.post(
      "/createUser",
      { email, password, displayName: name, type },
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
    
    const { uid } = createUserResponse.data;  // Assume backend returns the Firebase UID
    toast.success("User created successfully in Firebase");
    
        // Step 2: Save user details to collections
        const userPayload = {
          uid,
          name,
          email,
          image,
          type,
          createdAt: new Date(),
        };
    
        const userResponse = await axiosSecure.post(
          "/users",
          { ...userPayload },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
    
        // Save instructor details
        const newInstructor = {
          userId: userResponse.data.insertedId,
          contact,
        };
    
        await axiosSecure.post(
          "/instructors",
          newInstructor,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
    
        // Update UI
        setInstructors((prevInstructors) => [
          { ...newInstructor, ...userPayload },
          ...prevInstructors,
        ]);
    
        toast.success("Instructor registered successfully");
        reset();
        setIsModalOpen(false);
        await fetchInstructors(); // Refresh instructor list
      } catch (error) {
        console.error("Error during user registration:", error);
        toast.error("Registration failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    


  // Paginate the combined data
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
              onClick={() => setIsModalOpen(true)}
            >
              <FaPlus /> Add New Instructor
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-2/5 h-4/5 relative">
            <div className="flex justify-center mb-6">
              <h2 className="text-xl font-semibold mt-6 text-center">
            Add New Instructor
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6">
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

              <div className="absolute bottom-4 right-4 flex gap-4 mt-4 px-6">
                <button className="btn bg-blue-950 text-white w-auto" disabled={isLoading}>
                  {isLoading ? <span className="loading loading-ring loading-lg"></span> : "Register Instructor"}
                </button>
                <button
                  type="button"
                  className="btn bg-gray-500 text-white w-auto"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex-grow overflow-x-auto">
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
                  {[...Array(itemsPerPage)].map((_, index) => (
                    <tr key={index}>
                      <td colSpan="6">
                        <div className="h-8 bg-gray-100 rounded-lg"></div>
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
                    style={{ height: "20px" }}
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
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="flex justify-end join my-4 px-8 py-4 mt-auto">
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

      <ToastContainer />
    </div>
  );
};

export default InstructorManagement;
