import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

const Register = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm();
  const [courses, setCourses] = useState([]); // State to store courses
  const [userType, setUserType] = useState("student"); // State to toggle between Student and Instructor forms
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch courses from the database
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosPublic.get("/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      }
    };

    fetchCourses();
  }, [axiosPublic]);

  const validatePassword = (password, confirmPassword) => {
    if (password.length < 6) {
      toast.error("Password should be at least 6 characters long");
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error("Password should contain at least one capital letter");
      return false;
    }
    if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password)) {
      toast.error("Password should contain at least one special character");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleStudentSubmit = async (data) => {
    const {
      password,
      confirmPassword,
      name,
      email,
      studentID,
      department,
      session,
      institution,
      prefCourse,
    } = data;

    const image =
      "https://i.ibb.co/JvWtdNv/anonymous-user-circle-icon-vector-illustration-flat-style-with-long-shadow-520826-1931.jpg";
    const type = "student";

    try {
      setIsLoading(true);

      // Password validation
      if (!validatePassword(password, confirmPassword)) {
        return;
      }

      // Register user
      const userResponse = await axiosPublic.post("/users", {
        name,
        email,
        password,
        image,
        type,
      });

      console.log(userResponse);

      if (userResponse.data.insertedId) {
        const studentResponse = await axiosPublic.post("/students", {
          userId: userResponse.data.insertedId,
          studentID,
          department,
          session,
          institution,
          prefCourse,
        });

        console.log(studentResponse);

        if (studentResponse.data.insertedId) {
          reset();
          navigate("/login");
          toast.success("Student registered successfully");
        } else {
          toast.error("Error saving student data.");
        }
      }
    } catch (error) {
      console.error("Error during student registration:", error);
      toast.error(`Error during student registration: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstructorSubmit = async (data) => {
    const { name, email, contact, password, confirmPassword } = data;
    const image =
      "https://i.ibb.co/JvWtdNv/anonymous-user-circle-icon-vector-illustration-flat-style-with-long-shadow-520826-1931.jpg";
    const type = "instructor";

    try {
      setIsLoading(true);

      // Password validation
      if (!validatePassword(password, confirmPassword)) {
        return;
      }

      // Log request payload for debugging
      console.log({
        name,
        email,
        password,
        image,
        type,
      });

      // Register user
      const userResponse = await axiosPublic.post("/users", {
        name,
        email,
        password,
        image,
        type,
      });

      if (userResponse.data.insertedId) {
        const instructorResponse = await axiosPublic.post("/instructors", {
          userId: userResponse.data.insertedId,
          contact,
          status: "Pending",
          isDeleted: false,
        });

        if (instructorResponse.status === 201) {
          reset();
          navigate("/login");
          toast.success("Instructor registered successfully");
        } else {
          toast.error("Error saving instructor data.");
        }
      }
    } catch (error) {
      console.error(
        "Error during instructor registration:",
        error.response?.data || error.message
      );
      toast.error(
        `Error during instructor registration: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data) => {
    if (userType === "student") {
      handleStudentSubmit(data);
    } else if (userType === "instructor") {
      handleInstructorSubmit(data);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="text-center mt-8 lg:mt-28">
        <div className="flex flex-col justify-center items-center mx-auto gap-4">
          <div className="shadow-lg rounded-lg p-6 bg-white w-2/5">
            <div className="mb-4">
              <h2 className="text-center font-semibold text-2xl mb-2">
                Sign Up <br /> <span className="text-lg font-medium">as</span>
              </h2>
              <div className="flex justify-center gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="student"
                    className="radio radio-xs"
                    checked={userType === "student"}
                    onChange={() => setUserType("student")}
                  />
                  <span className="ml-2 text-sm">Student</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="instructor"
                    className="radio radio-xs"
                    checked={userType === "instructor"}
                    onChange={() => setUserType("instructor")}
                  />
                  <span className="ml-2 text-sm">Instructor</span>
                </label>
              </div>
            </div>

            {userType === "student" ? (
              <form onSubmit={handleSubmit(onSubmit)} className="">
                <div className="grid grid-cols-2 gap-2">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-md font-medium ">
                        Name *
                      </span>
                    </label>
                    <input
                      {...register("name", { required: true })}
                      type="text"
                      placeholder="name"
                      name="name"
                      className="input input-bordered input-sm"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-md font-medium ">
                        Contact *
                      </span>
                    </label>
                    <input
                      {...register("contact", { required: true })}
                      type="text"
                      placeholder="contact number"
                      name="contact"
                      className="input  input-bordered input-sm"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-md font-medium">
                        Email *
                      </span>
                    </label>
                    <input
                      {...register("email", { required: true })}
                      type="email"
                      placeholder="email"
                      name="email"
                      className="input input-bordered input-sm"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-md font-medium">
                        Student ID *
                      </span>
                    </label>
                    <input
                      {...register("studentID", { required: true })}
                      type="text"
                      placeholder="student ID"
                      name="studentID"
                      className="input input-bordered input-sm"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-md font-medium ">
                        Department *
                      </span>
                    </label>
                    <input
                      {...register("department", { required: true })}
                      type="text"
                      placeholder="department"
                      name="department"
                      className="input input-bordered input-sm"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-md font-medium ">
                        Session *
                      </span>
                    </label>
                    <input
                      {...register("session", { required: true })}
                      type="text"
                      placeholder="session"
                      name="session"
                      className="input input-bordered input-sm"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-md font-medium ">
                        Institution *
                      </span>
                    </label>
                    <input
                      {...register("institution", { required: true })}
                      type="text"
                      placeholder="institution"
                      name="institution"
                      className="input input-bordered input-sm"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-md font-medium ">
                        Preferable Course *
                      </span>
                    </label>
                    <select
                      {...register("prefCourse", { required: true })}
                      className="select select-bordered select-sm"
                      required
                    >
                      <option value="">Select Preferable Course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.courseName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-md font-medium ">
                        Password
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        {...register("password", { required: true })}
                        type={showPassword ? "text" : "password"}
                        placeholder="password"
                        name="password"
                        className="input input-bordered w-full input-sm"
                        required
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                      >
                        {showPassword ? (
                          <HiEye className="h-5 w-5" />
                        ) : (
                          <HiEyeOff className="h-5 w-5" />
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-md font-medium ">
                        Confirm Password
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        {...register("confirmPassword", { required: true })}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="confirm password"
                        name="confirmPassword"
                        className="input input-bordered w-full input-sm"
                        required
                      />
                      <span
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <HiEye className="h-5 w-5" />
                        ) : (
                          <HiEyeOff className="h-5 w-5" />
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="form-control mt-6">
                  <button className="btn bg-blue-950 text-white">
                    Register
                  </button>
                </div>
                <p className="p-8 pt-0 text-md font-medium mt-2 lg:text-lg">
                              Already have account?
                              <NavLink to="/login" className="text-lg font-bold bg-grad-button lg:text-xl"> Sign In</NavLink> here.
                            </p>
              </form>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4 px-6"
              >
                <div className="flex items-center gap-4">
                  <label className="label w-1/3">
                    <span className="label-text">Name *</span>
                  </label>
                  <input
                    {...register("name", { required: true })}
                    type="text"
                    placeholder="Enter name"
                    className="input input-bordered w-2/3 input-sm"
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
                    className="input input-bordered w-2/3 input-sm"
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
                    className="input input-bordered w-2/3 input-sm"
                    required
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="label w-1/3">
                    <span className="label-text">Password *</span>
                  </label>
                  <div className="relative w-2/3">
                    <input
                      {...register("password", { required: true })}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      className="input input-bordered w-full input-sm"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <IoEyeSharp size={20} />
                      ) : (
                        <FaEyeSlash size={20} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="label w-1/3">
                    <span className="label-text">Confirm Password *</span>
                  </label>
                  <div className="relative w-2/3">
                    <input
                      {...register("confirmPassword", {
                        required: "Confirm password is required",
                        validate: (value) =>
                          value === watch("password") ||
                          "Passwords do not match", // Use watch to compare
                      })}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      className="input input-bordered w-full input-sm"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? (
                        <IoEyeSharp size={20} />
                      ) : (
                        <FaEyeSlash size={20} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>

                <div className="flex gap-4 mt-4 justify-center">
                  <button
                    type="submit"
                    className={`btn flex justify-center w-full items-center gap-2 bg-blue-950 text-white ${
                      isLoading ? "cursor-not-allowed opacity-70" : ""
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span>Registering</span>
                        <span className="loading loading-ball loading-md"></span>
                      </>
                    ) : (
                      "Register"
                    )}
                  </button>
                </div>
                <p className="p-8 pt-0 text-md font-medium lg:text-lg">
                              Already have account?
                              <NavLink to="/login" className="text-lg font-bold bg-grad-button lg:text-xl"> Sign In</NavLink> here.
                            </p>
              </form>
            )}
            
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Register;
