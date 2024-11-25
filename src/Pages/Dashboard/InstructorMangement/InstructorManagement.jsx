import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEyeSlash } from "react-icons/fa6";
import { IoEyeSharp } from "react-icons/io5";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

const InstructorManagement = () => {
  const { register, handleSubmit, reset } = useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const axiosPublic = useAxiosPublic();

  const onSubmit = async (data) => {
    const { name, email, contact } = data;
    const image = "https://i.ibb.co/JvWtdNv/anonymous-user-circle-icon-vector-illustration-flat-style-with-long-shadow-520826-1931.jpg"; // Static image URL

    try {
      // Step 1: Save data to the users collection
      const userPayload = {
        name,
        email,
        image,
        type: "instructor",
      };

      const userResponse = await axiosPublic.post("/users", userPayload);

      if (userResponse.data.insertedId) {
        // Step 2: Save data to the instructors collection
        const instructorPayload = {
          userId: userResponse.data.insertedId,
          contact,
          password: "123456", // Default password
          isDeleted: false,
        };

        const instructorResponse = await axiosPublic.post("/instructors", instructorPayload);

        if (instructorResponse.data.insertedId) {
          // Instructor created successfully
          toast.success("Instructor registered successfully");
          reset(); // Reset the form
          setIsModalOpen(false); // Close the modal
        } else {
          throw new Error("Failed to save instructor data.");
        }
      } else {
        throw new Error("Failed to save user data.");
      }
    } catch (error) {
      console.error("Error during instructor creation:", error);
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-end mt-4">
        <button
          className="btn bg-blue-950 text-white"
          onClick={() => setIsModalOpen(true)}
        >
          Add New Instructor
        </button>
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
                <button className="btn bg-blue-950 text-white w-auto">
                  Register Instructor
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

      <ToastContainer />
    </div>
  );
};

export default InstructorManagement;
