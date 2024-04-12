import React, { useContext } from 'react';
import { AuthContext } from '../../Providers/AuthProvider';
import { useLoaderData } from 'react-router-dom';

const Details = () => {
    const { user, signIn, loading } = useContext(AuthContext);
    const courseDetails = useLoaderData();
    console.log(courseDetails)
    const {course_name, image, enrolled_student, _id} = courseDetails;
    console.log(courseDetails)

    return (
        <div>
            <div>
                <img className='w-full h-[250px]' src={image} alt="" />
            </div>

            <div className='container mx-auto flex flex-row'>
                <div className='w-4/5 mt-16'>
                    <h2 className='text-3xl font-semibold'>Course Material</h2>
                </div>
                <div className='w-1/5 mt-16'>
                    <h2 className='text-3xl font-semibold mb-3'>Enrolled Student</h2>
                    <ul>
                        {/* Map through enrolled students and display their profile image and displayName */}
                        {enrolled_student.map((student, index) => (
                            <li className='flex items-center text-xl py-3' key={index}>
                                <img className='w-8 h-8 mr-2 rounded-full' src={student.photoURL} alt={student.displayName} />
                              
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
        </div>
    );
};

export default Details;