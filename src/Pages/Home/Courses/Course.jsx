import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import axios for making HTTP requests
import { AuthContext } from '../../../Providers/AuthProvider';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';

const Course = ({ course }) => {
    const { image, course_name, _id } = course;
    const { user, loading } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();


    console.log(user)
   
    // Function to handle enrollment
    const handleEnroll = () => {
        if (!user) {
            // If user is not present, redirect to login page
            navigate("/login");
            return; // Stop further execution of the function
        }

        const { email, displayName, photoUrl } = user;
        console.log(email, displayName, photoUrl)
        // Make a POST request to enroll the user in the course
        axiosPublic.post(`/enroll/${_id}`, { email, displayName, photoUrl })
            .then(response => {
                // Handle successful 
                toast.success('Enrolled Successfully');
                console.log('Enrollment successful:', response.data);
               
                navigate(`/courseMaterial/${_id}`);
            })
            .catch(error => {
                // Handle errors
                console.error('Enrollment error:', error);
                // You can display an error message or handle the error in any appropriate way
            });
    };

    return (
        <div className="hero h-[250px] " style={{ backgroundImage: `url(${image})` }}>
            <div className="hero-overlay bg-opacity-60 hover:bg-blue-950"></div>
            <div className="hero-content text-center text-neutral-content">
                <div className="max-w-md">
                    <h1 className="mb-5 text-white text-4xl font-bold">{course_name}</h1>
                    {/* Check if user is logged in before showing the "Enroll" button */}
                 
                        <button onClick={handleEnroll} className='btn text-white btn-outline border-white border-2 hover:bg-blue-900 hover:text-white'>
                            Enroll
                        </button>
                    
                    {/* If user is not logged in, you can redirect them to the login page */}
                    {/* {!user && (
                        <Link to="/login" className="btn text-white btn-outline border-white border-2 hover:bg-blue-900 hover:text-white">
                            Log in to Enroll
                        </Link>
                    )} */}
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Course;