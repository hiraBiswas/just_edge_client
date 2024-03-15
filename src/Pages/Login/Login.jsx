import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

const Login = () => {
    return (
        <div className="  mb-10 " >
        <div className="max-w-sm lg:max-w-3xl mx-auto"  >
            <h2 className="text-2xl font-bold text-black py-5 text-center lg:py-12    lg:text-4xl ">Login Here !</h2>
            <div className="flex drop-shadow rounded-xl">

                <form  className="py-5 px-5 flex-1 bg-white" >
                <div className="form-control">
      <label className="label">
        <span className="label-text text-xl font-medium">Email</span>
      </label>
      <input type="email" placeholder="email" name="email" className="input input-bordered" required />
    </div>
    <div className="form-control">
      <label className="label ">
        <span className="label-text text-xl font-medium">Password</span>
      </label>
      <input type="password" placeholder="password" className="input input-bordered" name="password" required />
    
    </div>
    <div className="form-control mt-6">
      <button className="btn bg-blue-950 text-white  border-none drop-shadow">Login</button>
      
    </div>


    <p className="py-3 text-lg">Create an account. <NavLink to="/register" className="text-blue-950 font-bold">Sign Up.</NavLink>now</p>
                </form>

            </div>
        </div>

    </div>


    );
};

export default Login;