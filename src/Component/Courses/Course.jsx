import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Providers/AuthProvider';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaGraduationCap, FaClock, FaUser } from 'react-icons/fa'; // Import icons

const Course = ({ course }) => {
    const { image, courseName, _id, minimumEducationalQualification, courseDuration, ageLimit, level } = course;
    const { user } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();

    // Function to handle enrollment
    const handleEnroll = () => {
        if (!user) {
            navigate("/login");
            return;
        }

        const { email, displayName, photoUrl } = user;
        axiosPublic.post(`/enroll/${_id}`, { email, displayName, photoUrl })
            .then(response => {
                toast.success('Enrolled Successfully');
                navigate(`/courseMaterial/${_id}`);
            })
            .catch(error => {
                console.error('Enrollment error:', error);
            });
    };

    return (
        <div className="card bg-white border border-gray-200 MAX-W-86  drop-shadow-lg rounded-lg overflow-hidden lg:max-w-96 ">
            <figure className="px-5 pt-5">
                <img className='h-52 w-full object-cover rounded-lg' src={image} alt={courseName} />
            </figure>
            <div className="p-5 text-blue-900">
                <h2 className="card-title text-2xl font-semibold mb-2 text-blue-950">{courseName}</h2>

                <div className="mb-3 flex items-center">
                    <FaClock className="text-black text-lg mr-2" />
                    <p className="text-md text-black"><span className='font-semibold'>Duration:</span> {courseDuration}</p>
                </div>

                <div className="mb-3 flex items-center">
                    <FaGraduationCap className="text-black text-lg mr-2" />
                    <p className="text-md text-black"><span className='font-semibold'>Minimum Qualification:</span> {minimumEducationalQualification}</p>
                </div>

                <div className="mb-3 flex items-center">
                    <FaUser className="text-black text-lg mr-2" />
                    <p className="text-md text-black"><span className='font-semibold'>Age Limit:</span> {ageLimit}</p>
                </div>

                {/* <button 
                    onClick={handleEnroll} 
                    className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                    Enroll Now
                </button> */}
            </div>
        </div>
    );
};

export default Course;
