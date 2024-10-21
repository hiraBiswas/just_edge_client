import React from 'react';
import { useContext } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Providers/AuthProvider";
import { getAuth, updateProfile } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useForm } from 'react-hook-form';
import useAxiosPublic from '../../hooks/useAxiosPublic'

const Register = () => {
    const {
        register,
        handleSubmit, reset,
        formState: { errors },
    } = useForm();

    const location = useLocation()
    const navigate = useNavigate()
    const auth = getAuth();
    const { createUser } = useContext(AuthContext)
    const axiosPublic = useAxiosPublic();

    

    const onSubmit = async (data) => {
        try {
            const { password, confirmPassword, name, email, roll, department, year, institution, prefCourse } = data;
            console.log(data)

            // Set photo URL and user type
            const image = 'https://i.ibb.co/JvWtdNv/anonymous-user-circle-icon-vector-illustration-flat-style-with-long-shadow-520826-1931.jpg';
            const type = 'student';

            // Password validation
            if (password !== confirmPassword) {
                toast.error("Passwords do not match");
                return;
            }
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

            const assignedCourse = ''; 
    
            // Firebase authentication
            createUser(name, image, type, email, password)
                .then(() => {
                    updateProfile(auth.currentUser, {
                        displayName: name,
                        photoURL:image

                    })
                        .then(() => {
                       
                            // Database upload
                            axiosPublic.post('/users', { name, email, roll, department, year, institution, prefCourse, image, type, assignedCourse })
                                .then(res => {
                                    if (res.data.insertedId) {
                                        // Success
                                        toast.success('Registered Successfully');
                                        reset(); // Clear the form
                                        navigate('/');
                                    }
                                })
                                .catch((error) => {
                                    toast.error(`Error posting user info: ${error.message}`);
                                });
                        })
                        .catch((error) => {
                            toast.error(`Profile update error: ${error.message}`);
                        });
                })
                .catch((error) => {
                    toast.error(`User creation error: ${error.message}`);
                });
    
        } catch (error) {
            toast.error(`Error during form submission: ${error.message}`);
        }
    };
    
    
    return (
        <div>
            <div className="text-center mt-8">

                <div className="text-center lg:text-left ">
                    <h1 className="text-2xl font-bold text-center lg:text-4xl py-5">Register now!</h1>

                </div>
                <div className="flex flex-col justify-center items-center  mx-auto">
                   
                        <form onSubmit={handleSubmit(onSubmit)} className=" ">

                         <div className='grid grid-cols-2 gap-4'>
                         <div className="form-control ">
                                    <label className="label">
                                        <span className="label-text text-lg font-medium">Name * </span>
                                    </label>
                                    <input {...register('name', { required: true })} type="text" placeholder="name" name="name" className="input input-bordered" required />

                                </div>

                                <div className="form-control ">
                                    <label className="label">
                                        <span className="label-text text-lg font-medium">Contact *</span>
                                    </label>
                                    <input {...register('contact', { required: true })} type="text" placeholder="contact number" name="contact" className="input input-bordered  " required />
                                </div>


                                <div className="form-control ">
                                    <label className="label">
                                        <span className="label-text text-lg font-medium">Email *</span>
                                    </label>
                                    <input {...register('email', { required: true })} type="email" placeholder="email" name="email" className="input input-bordered  " required />
                                </div>


                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text text-lg font-medium">Roll No *</span>
                                    </label>
                                    <input {...register('roll', { required: true })} type="text" placeholder="roll number" name="roll" className="input input-bordered " required />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text text-lg font-medium">Department *</span>
                                    </label>
                                    <input {...register('department', { required: true })} type="text" placeholder="department" name="department" className="input input-bordered " required />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text text-lg font-medium">Year & Semester *</span>
                                    </label>
                                    <select {...register('year', { required: true })}  className="select select-bordered ml-2" required>
                                        <option value="">Select Year & Semester</option>
                                        <option value="1st Year 1st Semester">1st Year 1st Semester</option>
                                        <option value="1st Year 2nd Semester">1st Year 2nd Semester</option>
                                        <option value="2nd Year 1st Semester">2nd Year 1st Semester </option>
                                        <option value="2nd Year 2nd Semester">2nd Year 2nd Semester </option>
                                        <option value="3rd Year 1st Semester">3rd Year 1st Semester</option>
                                        <option value="3rd Year 2nd Semester">3rd Year 2nd Semester</option>
                                        <option value="4th Year 1st Semester">4th Year 1st Semester</option>
                                        <option value="4th Year 2nd Semester">4th Year 2nd Semester</option>


                                    </select>
                                </div>


                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text text-lg font-medium">Institution *</span>
                                    </label>
                                    <input {...register('institution', { required: true })} type="text" placeholder="institution" name="institution" className="input input-bordered " required />
                                </div>



                                <div>


                                    <div className="form-control">
                                        <label className="label ">
                                            <span className="label-text text-lg font-medium">Preferable Course *</span>
                                        </label>
                                        <select {...register('prefCourse', { required: true })} className="select select-bordered ml-2" required>
                                        <option value="">Select Preferable Course</option>
                                        <option value="Data Visualization with Python">Data Visualization with Python</option>
                                        <option value="Database">Database</option>
                                        <option value="Basic Programming with Python">Basic Programming with Python</option>
                                        <option value="Front End Development">Front End Development </option>
                                    </select>

                                    </div>
                                </div>


                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text text-lg font-medium">Password</span>
                                    </label>
                                    <input {...register('password', { required: true })} type="password" placeholder="password" name="password" className="input input-bordered" required />
                                </div>

                                <div className="form-control flex  ">
                                    <label className="label">
                                        <span className="label-text text-lg font-medium">Confirm Password</span>
                                    </label>
                                    <input {...register('confirmPassword', { required: true })} type="password" placeholder="confirm password" name="confirmPassword" className="input input-bordered" required />
                                </div>
                         </div>
                    

                            <div className="form-control mt-6">
                                <button className="btn bg-blue-950 flex-1 text-lg text-white">Register</button>
                            </div>
                        </form>


                        <div>
                            <p className="p-8  text-xl font-medium pt-5">Already have an account? <NavLink to="/login" className="text-2xl font-semibold text-blue-950">Login</NavLink> here.</p>
                        </div>
                    </div>
            
            </div>
            <ToastContainer />

        </div>
    );
};

export default Register;