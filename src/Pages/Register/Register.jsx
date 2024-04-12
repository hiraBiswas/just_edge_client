import React from 'react';
import { useContext } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Providers/AuthProvider";
import { getAuth, updateProfile } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useForm } from 'react-hook-form';
import useAxiosPublic from '../../hooks/useAxiosPublic'

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

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

    //   const handleRegister = async (e) => {
    //     e.preventDefault();

    //     const form = new FormData(e.target);
    //     const name = form.get('name');
    //     const photo = form.get('photo');
    //     const email = form.get('email');
    //     const password = form.get('password');
    //     const confirmPassword = form.get('confirmPassword');
    //     const courseLevel = form.get('courseLevel');
    //     const father_name = form.get('father_name');
    //     const mother_name = form.get('mother_name');
    //     const gender = form.get('gender');
    //     const religion = form.get('religion');
    //     const nationality = form.get('nationality');
    //     const nationalOrBirth = form.get('nationalOrBirth');
    //     const presentAddress = form.get('presentAddress');
    //     const permanentAddress = form.get('permanentAddress');
    //     const mobileNumber = form.get('mobileNumber');
    //     const guardianMobileNumber = form.get('guardianMobileNumber');
    //     const educationLevel = form.get('educationLevel');
    //     const subjectDiplomaGroup = form.get('subjectDiplomaGroup');
    //     const institute = form.get('institute');
    //     const trainee_institute = form.get('trainee_institute');
    //     const location = form.get('location');

    //     console.log(name, email, password, photo, location);


    //     const imageFile = photo[0];
    //     const formData = new FormData();
    //     formData.append("image", imageFile);

    //     try {
    //         const response = await fetch(image_hosting_api, {
    //             method: "POST",
    //             body: formData,
    //         });

    //         if (!response.ok) {
    //             throw new Error(`HTTP error! Status: ${response.status}`);
    //         }

    //         const res = await response.json();
    //         if (!res.success) {
    //             toast.error("Error during image upload");
    //             return;
    //         }

    //         if (password.length < 6) {
    //             toast.error('Password should be at least 6 characters long');
    //             return;
    //         }
    //         if (!/[A-Z]/.test(password)) {
    //             toast.error('Password should contain at least one capital letter');
    //             return;
    //         }
    //         if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password)) {
    //             toast.error('Password should contain at least one special character');
    //             return;
    //         }

    //         createUser(name, photo, email, password)
    //             .then(result => {
    //                 console.log(result.user)
    //                 updateProfile(auth.currentUser, {
    //                     displayName: name,
    //                     photoURL: photo
    //                 })
    //                 .then(result => {
    //                     toast.success('Registration Successful')
    //                     navigate(location?.state ? location.state : '/')
    //                 })
    //                 .catch(error => {
    //                     toast.error(error.message)
    //                 })

    //             })
    //             .catch(error => {
    //                 toast.error(error.message)
    //                 console.error("Registration error:", error.message)
    //             })

    //     } catch (error) {
    //         toast.error(error.message);
    //     }
    // };



    const onSubmit = async (data) => {
        try {
            const { } = data;
            console.log(data)
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

            console.log(data)
            // Image upload
            const imageFile = data.image[0];
            const formData = new FormData();
            formData.append("image", imageFile);

            const response = await fetch(image_hosting_api, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const res = await response.json();
            if (!res.success) {
                toast.error("Error during image upload");
                return;
            }

            console.log(res.data.display_url)
            // Firebase authentication
            createUser(name, res.data.display_url, type, email, password)
                .then(() => {
                    updateProfile(auth.currentUser, {
                        displayName: name,
                        photoURL: res.data.display_url,
                    })
                        .then(() => {
                            // Database upload
                            const userInfo = {
                                name: data.name,
                                email: data.email,
                                type: 'user',
                                contact: data.contact,
                                // fatherName: data.fatherName,
                                // motherName: data.motherName,
                                // gender: data.gender,
                                // religion: data.religion,
                                // nationality: data.nationality,
                                // nationalOrBirth: data.nationalOrBirth,
                                // presentAddress: data.presentAddress,
                                // permanentAddress: data.permanentAddress,
                                // guardianMobileNumber: data.guardianMobileNumber,
                                // educationLevel: data.educationLevel,
                                // subjectDiplomaGroup: data.subjectDiplomaGroup,
                                // //   institute:data.institute,
                                // traineeInstitute: data.traineeInstitute,

                                // image: res.data.display_url,


                            };

                            axiosPublic.post('/users', userInfo)
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
            <div className="  text-center mt-8">

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
                                    <input {...register('email', { required: true })} type="email" placeholder="email" name="contact" className="input input-bordered  " required />
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
                                    <select {...register('year', { required: true })} className="select select-bordered ml-2" required>
                                        <option value="">Select Year & Semester</option>
                                        <option value="1">Year 1 Semester 1</option>
                                        <option value="2">Year 1 Semester 2</option>
                                        <option value="3">Year 2 Semester 1</option>
                                        <option value="4">Year 2 Semester 2</option>
                                        <option value="5">Year 3 Semester 1</option>
                                        <option value="6">Year 3 Semester 2</option>
                                        <option value="7">Year 4 Semester 1</option>
                                        <option value="8">Year 4 Semester 2</option>


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
                                        <input {...register('prefCourse', { required: true })} type="text" placeholder="preferable course" className="input input-bordered" name="traineeInstitute" required />

                                    </div>
                                </div>


                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text text-lg font-medium">Password</span>
                                    </label>
                                    <input {...register('password', { required: true })} type="text" placeholder="password" name="password" className="input input-bordered" required />
                                </div>

                                <div className="form-control flex  ">
                                    <label className="label">
                                        <span className="label-text text-lg font-medium">Confirm Password</span>
                                    </label>
                                    <input {...register('confirmPassword', { required: true })} type="text" placeholder="confirm password" name="confirmPassword" className="input input-bordered" required />
                                </div>
                         </div>
                    

                            <div className="form-control mt-6">
                                <button className="btn bg-blue-950 flex-1 text-white">Register</button>
                            </div>
                        </form>


                        <div>
                            <p className="p-8 pt-0 text-xl font-medium">Already have an account? <NavLink to="/login" className="text-2xl font-semibold text-blue-950">Login</NavLink> here.</p>
                        </div>
                    </div>
            
            </div>
            <ToastContainer />

        </div>
    );
};

export default Register;