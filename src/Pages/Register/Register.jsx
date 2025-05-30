import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
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
    try {
      setIsLoading(true);

      // Password match check
      if (data.password !== data.confirmPassword) {
        toast.error("Passwords don't match!");
        return;
      }

      // 1️⃣ Register user (email auto-checked)
      const userResponse = await axiosPublic.post("/users", {
        name: data.name,
        email: data.email,
        password: data.password,
        contact: data.contact,
        image: data.image,
        type: "student",
      });

      // 2️⃣ Save student data (manual studentID check)
      const studentResponse = await axiosPublic.post("/students", {
        userId: userResponse.data.insertedId,
        studentID: data.studentID, // ✅ Backend will check duplicates
        department: data.department,
        session: data.session,
        institution: data.institution,
        prefCourse: data.prefCourse,
      });

      // Success: redirect to login
      toast.success("Registration successful!");
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);

      // Show backend error message
      if (error.response?.data?.message) {
        toast.error(error.response.data.message); // "This Student ID is already registered!"
      } else {
        toast.error("Registration failed! Please try again.");
      }
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

      // Register user
      const userResponse = await axiosPublic.post("/users", {
        name,
        email,
        password,
        image,
        type,
        contact,
      });

      if (userResponse.data.insertedId) {
        const instructorResponse = await axiosPublic.post("/instructors", {
          userId: userResponse.data.insertedId,
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
      <div className="text-center mt-8 lg:mt-20">
        <div className="flex flex-col justify-center items-center mx-auto gap-4">
          <div
            className="card shrink-0 bg-white rounded-xl shadow-2xl my-8 px-6"
            style={{
              width: "40%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div className="mb-4">
              <h2 className="text-center font-semibold text-2xl my-4">
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
                    <div className="text-start text-sm font-medium mb-1">
                      Name *
                    </div>
                    <input
                      {...register("name", { required: true })}
                      type="text"
                      placeholder="name"
                      name="name"
                      className="input input-bordered input-sm w-full"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <div className="text-start text-sm font-medium mb-1">
                      Contact *
                    </div>
                    <input
                      {...register("contact", { required: true })}
                      type="text"
                      placeholder="contact number"
                      name="contact"
                      className="input input-bordered input-sm w-full"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <div className="text-start text-sm font-medium mb-1">
                      Email *
                    </div>
                    <input
                      {...register("email", { required: true })}
                      type="email"
                      placeholder="email"
                      name="email"
                      className="input input-bordered input-sm w-full"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <div className="text-start text-sm font-medium mb-1">
                      Student ID *
                    </div>
                    <input
                      {...register("studentID", { required: true })}
                      type="text"
                      placeholder="student ID"
                      name="studentID"
                      className="input input-bordered input-sm w-full"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <div className="text-start text-sm font-medium mb-1">
                      Department *
                    </div>
                    <input
                      {...register("department", { required: true })}
                      type="text"
                      placeholder="department"
                      name="department"
                      className="input input-bordered input-sm w-full"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <div className="text-start text-sm font-medium mb-1">
                      Session *
                    </div>
                    <input
                      {...register("session", { required: true })}
                      type="text"
                      placeholder="session"
                      name="session"
                      className="input input-bordered input-sm w-full"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <div className="text-start text-sm font-medium mb-1">
                      Institution *
                    </div>
                    <input
                      {...register("institution", { required: true })}
                      type="text"
                      placeholder="institution"
                      name="institution"
                      className="input input-bordered input-sm w-full"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <div className="text-start text-sm font-medium mb-1">
                      Preferable Course *
                    </div>
                    <select
                      {...register("prefCourse", { required: true })}
                      className="select select-bordered select-sm w-full"
                      required
                    >
                      <option value="">Select Preferable Course</option>
                      {courses
                        .filter((course) => course.isDeleted === false) // Only show non-deleted courses
                        .map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.courseName}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="form-control">
                    <div className="text-start text-sm font-medium mb-1">
                      Password *
                    </div>
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
                    <div className="text-start text-sm font-medium mb-1 ">
                      Confirm Password *
                    </div>
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
                  <NavLink
                    to="/login"
                    className="text-lg font-bold bg-grad-button lg:text-xl"
                  >
                    {" "}
                    Sign In
                  </NavLink>{" "}
                  here.
                </p>
              </form>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-2 px-6"
              >
                <div className="form-control">
                  <div className="text-start text-sm font-medium mb-1">
                    Name *
                  </div>
                  <input
                    {...register("name", { required: true })}
                    type="text"
                    placeholder="Enter name"
                    className="input input-bordered w-full input-sm"
                    required
                  />
                </div>
                <div className="form-control">
                  <div className="text-start text-sm font-medium mb-1">
                    Email *
                  </div>
                  <input
                    {...register("email", { required: true })}
                    type="email"
                    placeholder="Enter email"
                    className="input input-bordered w-full input-sm"
                    required
                  />
                </div>
                <div className="form-control">
                  <div className="text-start text-sm font-medium mb-1">
                    Contact *
                  </div>
                  <input
                    {...register("contact", { required: true })}
                    type="text"
                    placeholder="Enter contact number"
                    className="input input-bordered w-full input-sm"
                    required
                  />
                </div>
                <div className="form-control">
                  <div className="text-start text-sm font-medium mb-1">
                    Password *
                  </div>
                  <div className="relative">
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
                <div className="form-control">
                  <div className="text-start text-sm font-medium mb-1">
                    Confirm Password *
                  </div>
                  <div className="relative">
                    <input
                      {...register("confirmPassword", {
                        required: "Confirm password is required",
                        validate: (value) =>
                          value === watch("password") ||
                          "Passwords do not match",
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
                  <NavLink
                    to="/login"
                    className="text-lg font-bold bg-grad-button lg:text-xl"
                  >
                    {" "}
                    Sign In
                  </NavLink>{" "}
                  here.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default Register;
