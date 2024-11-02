import React, { useState, useEffect, useContext } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Providers/AuthProvider";
import { getAuth, updateProfile } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { HiEye, HiEyeOff } from "react-icons/hi";

const Register = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [courses, setCourses] = useState([]); // State to store courses
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const { createUser } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch courses from the database
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosPublic.get("/courses");
        setCourses(response.data); // Assuming response.data contains an array of courses
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      }
    };

    fetchCourses();
  }, [axiosPublic]);

  const onSubmit = async (data) => {
    try {
      const {
        password,
        confirmPassword,
        name,
        email,
        studentID,
        department,
        session,
        institution,
        prefCourse, // This will hold the selected courseId
      } = data;

      const image = "https://i.ibb.co/JvWtdNv/anonymous-user-circle-icon-vector-illustration-flat-style-with-long-shadow-520826-1931.jpg";
      const type = "student";

      // Password validation
      if (password.length < 6) {
        toast.error("Password should be at least 6 characters long");
        return;
      }
      if (!/[A-Z]/.test(password)) {
        toast.error("Password should contain at least one capital letter");
        return;
      }
      if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password)) {
        toast.error("Password should contain at least one special character");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      // Firebase authentication
      await createUser(name, image, type, email, password);
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: image,
      });

      // Save common data to users collection
      const userResponse = await axiosPublic.post("/users", {
        name,
        email,
        image,
        type,
      });

      if (userResponse.data.insertedId) {
        const studentResponse = await axiosPublic.post("/students", {
          userId: userResponse.data.insertedId,
          studentID,
          department,
          session,
          institution,
          prefCourse,
          isDeleted: false, 
        });

        console.log(studentResponse);
        
        if (studentResponse.data.insertedId) {
          toast.success("Registered Successfully");
          reset();
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error(`Error during form submission: ${error.message}`);
    }
  };


  return (
    <div className="container mx-auto">
      <div className="text-center mt-8 lg:mt-36">
        <div className="flex flex-col justify-center items-center mx-auto gap-4">
          <div className="shadow-lg rounded-lg p-6 bg-white">
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
              <div className="grid grid-cols-2 gap-2">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-md font-medium lg:text-lg">
                      Name *
                    </span>
                  </label>
                  <input
                    {...register("name", { required: true })}
                    type="text"
                    placeholder="name"
                    name="name"
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control ">
                  <label className="label">
                    <span className="label-text text-md font-medium lg:text-lg">
                      Contact *
                    </span>
                  </label>
                  <input
                    {...register("contact", { required: true })}
                    type="text"
                    placeholder="contact number"
                    name="contact"
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control ">
                  <label className="label">
                    <span className="label-text text-md font-medium lg:text-lg">
                      Email *
                    </span>
                  </label>
                  <input
                    {...register("email", { required: true })}
                    type="email"
                    placeholder="email"
                    name="email"
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-md font-medium lg:text-lg">
                      Student ID *
                    </span>
                  </label>
                  <input
                    {...register("studentID", { required: true })}
                    type="text"
                    placeholder="student ID"
                    name="studentID"
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-md font-medium lg:text-lg">
                      Department *
                    </span>
                  </label>
                  <input
                    {...register("department", { required: true })}
                    type="text"
                    placeholder="department"
                    name="department"
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control ">
                  <label className="label">
                    <span className="label-text text-md font-medium lg:text-lg">
                      Session *
                    </span>
                  </label>
                  <input
                    {...register("session", { required: true })}
                    type="text"
                    placeholder="session"
                    name="session"
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-md font-medium lg:text-lg">
                      Institution *
                    </span>
                  </label>
                  <input
                    {...register("institution", { required: true })}
                    type="text"
                    placeholder="institution"
                    name="institution"
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-md font-medium lg:text-lg">
                      Preferable Course *
                    </span>
                  </label>
                  <select
                    {...register("prefCourse", { required: true })}
                    className="select select-bordered"
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
                    <span className="label-text text-md font-medium lg:text-lg">
                      Password
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      {...register("password", { required: true })}
                      type={showPassword ? "text" : "password"}
                      placeholder="password"
                      name="password"
                      className="input input-bordered w-full"
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
                    <span className="label-text text-md font-medium lg:text-lg">
                      Confirm Password
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      {...register("confirmPassword", { required: true })}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="confirm password"
                      name="confirmPassword"
                      className="input input-bordered w-full"
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
                <button className="btn bg-blue-950 text-white">Register</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Register;
