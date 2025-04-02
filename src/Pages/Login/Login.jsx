import { useContext, useState } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import { AuthContext } from "../../Providers/AuthProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoEye, IoEyeOff } from "react-icons/io5"; // Import eye icons

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { loginUser, loading } = useContext(AuthContext); // Get loginUser and loading from context

  // State to manage password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await loginUser(email, password); // Use the loginUser from context

      // After successful login, redirect to the desired page
      const redirectPath = location.state?.from || "/";
      navigate(redirectPath);
    } catch (error) {
      // Display the error message from loginUser
      toast.error(error.message);
    }
  };

  return (
    <div>
      <div className="w-full text-center mt-12">
        <div className="text-center lg:text-left ">
          <h1 className="text-2xl font-bold text-center text-white lg:text-4xl py-5 mb-5">
            Sign In
          </h1>
        </div>
        <div className="flex justify-center items-center w-full">
          <div className="card shrink-0 bg-white drop-shadow-2xl rounded-xl shadow-2xl">
            <form onSubmit={handleLogin} className="card-body">
              <h2 className="text-center font-semibold text-2xl">
                Sign In <br />
                <span className="text-lg"> to Your Account</span>
              </h2>
              <div className="form-control">
                <legend className="text-start font-medium mb-1">Email</legend>

                <input
                  type="email"
                  placeholder="email"
                  name="email"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Handle email change
                  required
                />
              </div>
              <div className="form-control">
                <legend className="text-start font-medium mb-1">
                  Password
                </legend>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="password"
                    className="input input-bordered pr-10 w-full box-border" // Ensures full width
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} // Handle password change
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                  >
                    {showPassword ? (
                      <IoEye className="w-5 h-5" />
                    ) : (
                      <IoEyeOff className="w-5 h-5" />
                    )}
                  </span>
                </div>
              </div>
              <div className="form-control mt-6">
                <button
                  className="btn bg-blue-950 text-md text-white lg:text-lg"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Sign In"}
                </button>
              </div>
            </form>
            <div>
              <p className="p-8 pt-0 text-md font-medium lg:text-lg">
                New to the website?
                <NavLink
                  to="/register"
                  className="text-lg font-bold bg-grad-button lg:text-xl"
                >
                  {" "}
                  Sign Up
                </NavLink>{" "}
                here.
              </p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
