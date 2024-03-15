import React from 'react';
import { useContext } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Providers/AuthProvider";
import { getAuth,updateProfile } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useForm } from 'react-hook-form'; 
import useAxiosPublic from '../../hooks/UseAxiosPublic'

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const Register = () => {
    const {
        register,
        handleSubmit, reset,
        formState: { errors },
      } = useForm();
    
  const location = useLocation()
  const navigate=useNavigate()
  const auth = getAuth();
  const {createUser}= useContext(AuthContext)
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
      const { course, name, courseLevel, fatherName, motherName, gender, religion, nationality,nationalOrBirth, presentAddress, permanentAddress, mobileNumber, guardianMobileNumber,email, educationLevel,subjectDiplomaGroup,institute, location, image, type, traineeInstitute ,password} = data;
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
              course: data.course,
              fatherName: data.fatherName,
              motherName:data.motherName,
              gender:data.gender,
              religion:data.religion,
              nationality:data.nationality,
              nationalOrBirth:data.nationalOrBirth,
              presentAddress:data.presentAddress,
              permanentAddress:data.permanentAddress,
              mobileNumber:data.mobileNumber,
              guardianMobileNumber:data.guardianMobileNumber,
              educationLevel:data.educationLevel,
              subjectDiplomaGroup:data.subjectDiplomaGroup,
              institute:data.institute,
              traineeInstitute:data.traineeInstitute,
              location:data.location,
              image:res.data.display_url,
            
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
            <div className="w-full bg-base-100 text-center mt-12">

                <div className="text-center lg:text-left ">
                    <h1 className="text-2xl font-bold text-center lg:text-5xl py-5">Register now!</h1>

                </div>
                <div className="flex justify-center items-center w-full">
                    <div className="card flex-shrink-0 shadow-2xl">
                        <form onSubmit={handleSubmit(onSubmit)} className="card-body ">

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-xl font-medium">Course</span>
                                </label>
                                <select {...register('course',{required: true})} name='course' className="select select-bordered w-full ">
                                    <option disabled selected>Select Course?</option>
                                    <option>Han Solo</option>
                                    <option>Greedo</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-xl font-medium">Trainee Name</span>
                                </label>
                                <input {...register('name',{required: true})} type="text" placeholder="trainee name" name="name" className="input input-bordered " required />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-xl font-medium">Course Level</span>
                                </label>
                                <select {...register('courseLevel',{required: true})} name='courseLevel' className="select select-bordered w-full ">
                                    <option disabled selected>Select Course Level?</option>
                                    <option>Foundational for non-IT background</option>
                                    <option>Intermediate for Science Background</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-xl font-medium">Father Name</span>
                                </label>
                                <input {...register('fatherName',{required: true})} type="text" placeholder="father name" name="fatherName" className="input input-bordered " required />
                            </div>


                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-xl font-medium">Mother Name</span>
                                </label>
                                <input {...register('motherName',{required: true})} type="text" placeholder="mother name" name="motherName" className="input input-bordered " required />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-xl font-medium">Gender</span>
                                </label>
                                <select {...register('gender',{required: true})} name='gender' className="select select-bordered w-full ">
                                    <option disabled selected>Select Gender?</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-xl font-medium">Religion</span>
                                </label>
                                <select {...register('religion',{required: true})} name='religion' className="select select-bordered w-full ">
                                    <option disabled selected>Select Religion</option>
                                    <option>Islam</option>
                                    <option>Christianity</option>
                                    <option>Hinduism</option>
                                    <option>Buddhism</option>
                                </select>
                            </div>


                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-xl font-medium">Nationality</span>
                                </label>
                                <select {...register('nationality',{required: true})} name='nationality' className="select select-bordered w-full ">
                                    <option disabled selected>Select Nationality</option>
                                    <option>Bangladeshi</option>
                                    <option>Others</option>

                                </select>
                            </div>


                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-xl font-medium">National ID/ Birth Registration No.</span>
                                </label>
                                <input {...register('nationalOrBirth',{required: true})} type="text" placeholder="national or birth registration no" name="nationalOrBirth" className="input input-bordered" required />
                            </div>


                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-xl font-medium">Present Address</span>
                                </label>
                                <input {...register('presentAddress',{required: true})} type="text" placeholder="present address" name="presentAddress" className="input input-bordered" required />
                            </div>


                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-xl font-medium">Permanent Address</span>
                                </label>
                                <input {...register('permanentAddress',{required: true})} type="text" placeholder="permanent address" name="permanentAddress" className="input input-bordered" required />
                            </div>



                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-xl font-medium">Mobile Number</span>
                                </label>
                                <input {...register('mobileNumber',{required: true})} type="text" placeholder="mobile number" name="mobileNumber" className="input input-bordered" required />
                            </div>



                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-xl font-medium">Guardian Mobile Number</span>
                                </label>
                                <input {...register('guardianMobileNumber',{required: true})} type="text" placeholder="guardian mobile number" name="guardianMobileNumber" className="input input-bordered" required />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-xl font-medium">Email</span>
                                </label>
                                <input {...register('email',{required: true})} type="email" placeholder="email" name="email" className="input input-bordered" required />
                            </div>


                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-xl font-medium">Level of Education</span>
                                </label>
                                <select {...register('educationLevel',{required: true})} name='educationLevel' className="select select-bordered w-full ">
                                    <option disabled selected>Select Level of Education</option>
                                    <option>SSC</option>
                                    <option>HSC</option>
                                    <option>BSc</option>
                                    <option>MSc</option>

                                </select>
                            </div>




                            <div className="form-control">
                                <label className="label ">
                                    <span className="label-text text-xl font-medium">Subject/Diploma/Group</span>
                                </label>
                                <input {...register('subjectDiplomaGroup',{required: true})} type="text" placeholder="subject, diploma or group" className="input input-bordered" name="subjectDiplomaGroup" required />

                            </div>


                            <div className="form-control">
                                <label className="label ">
                                    <span className="label-text text-xl font-medium">Name of Dept./Institute/Center</span>
                                </label>
                                <input {...register('institute',{required: true})} type="text" placeholder="dept, institute or center" className="input input-bordered" name="institute" required />

                            </div>



                            <div className="form-control">
                                <label className="label ">
                                    <span className="label-text text-xl font-medium">Trainee University/ Institute Name</span>
                                </label>
                                <input {...register('traineeInstitute',{required: true})} type="text" placeholder="trainee university or institute name" className="input input-bordered" name="traineeInstitute" required />

                            </div>



                            <div className="form-control">
                                <label className="label ">
                                    <span className="label-text text-xl font-medium">Training Location</span>
                                </label>
                                <input {...register('location',{required: true})} type="text" placeholder="training location" className="input input-bordered" name="location" required />

                            </div>

                            <div className="form-control">
                                <label className="label ">
                                    <span className="label-text text-xl font-medium">Passport Photo</span>
                                </label>
                                <input {...register('image',{required: true})} type="file" name='image' className="file-input file-input-bordered w-full " />

                            </div>




                            <div className="form-control">
                                <label className="label ">
                                    <span className="label-text text-xl font-medium">Password</span>
                                </label>
                                <input {...register('password',{required: true})} type="password" placeholder="password" className="input input-bordered" name="password" required />

                            </div>


                            {/* <div className="form-control">
                                <label className="label ">
                                    <span className="label-text text-xl font-medium">Confirm Password</span>
                                </label>
                                <input {...register('confirmPassword',{required: true})} type="password" placeholder="confirm password" className="input input-bordered" name="confirmPassword" required />

                            </div> */}


                            <div className="form-control mt-6">
                                <button className="btn bg-blue-950 text-white">Register</button>
                            </div>
                        </form>
                        <div>
                            <p className="p-8 pt-0 text-xl font-medium">Already have an account? <NavLink to="/login" className="text-2xl font-semibold text-blue-950">Login</NavLink> here.</p>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer></ToastContainer>

        </div>
    );
};

export default Register;