import { useContext, useState } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import { AuthContext } from "../../Providers/AuthProvider";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoEye, IoEyeOff } from "react-icons/io5"; // Import eye icons

const SignIn = () => {
    const location = useLocation();  
    const navigate = useNavigate(); 
    const { signIn } = useContext(AuthContext);  

    // State to manage password visibility
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const email = form.get('email');
        const password = form.get('password');

        try {
            await signIn(email, password);  
            const redirectPath = location.state?.from || '/';
            navigate(redirectPath);  
        } catch (error) {
            console.error("Login Error:", error.message);
            toast.error(error.message); 
        }
    };

    return (
        <div>
            <div className="w-full text-center mt-12">
                <div className="text-center lg:text-left ">
                    <h1 className="text-2xl font-bold text-center text-white lg:text-4xl py-5 mb-5">Sign In</h1>
                </div>
                <div className="flex justify-center items-center w-full">
                    <div className="card flex-shrink-0 bg-white drop-shadow-2xl rounded-xl shadow-2xl">
                        <form onSubmit={handleLogin} className="card-body">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-md font-medium lg:text-lg">Email</span>
                                </label>
                                <input type="email" placeholder="email" name="email" className="input input-bordered w-full" required />
                            </div>
                            <div className="form-control">
                                <label className="label ">
                                    <span className="label-text text-md font-medium lg:text-lg">Password</span>
                                </label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? 'text' : 'password'} 
                                        placeholder="password" 
                                        className="input input-bordered pr-10 w-full box-border" // Ensures full width
                                        name="password" 
                                        required 
                                    />
                                    <span 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        className="absolute inset-y-0 right-3 flex items-center cursor-pointer" 
                                    >
                                        {showPassword ? <IoEye className="w-5 h-5" /> : <IoEyeOff className="w-5 h-5" />}
                                    </span>
                                </div>
                            </div>
                            <div className="form-control mt-6">
                                <button className="btn bg-blue-950 text-md text-white lg:text-lg">Sign In</button>
                            </div>
                        </form>
                        <div>
                            <p className="p-8 pt-0 text-md font-medium lg:text-lg">
                                New to the website? <NavLink to="/register" className="text-lg font-bold bg-grad-button lg:text-xl ">Sign Up</NavLink> here.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default SignIn;
