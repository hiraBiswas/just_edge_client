import React from 'react';
import { Link } from 'react-router-dom';

const Course = ({ course }) => {
    const { image, course_name, _id } = course;
    console.log(course)

    return (
        <div className="hero h-[250px] " style={{ backgroundImage: `url(${image})` }}>
            <div className="hero-overlay bg-opacity-60 hover:bg-blue-950"></div>
            <div className="hero-content text-center text-neutral-content">
                <div className="max-w-md">
                    <h1 className="mb-5 text-white text-4xl font-bold">{course_name}</h1>
                    <Link to={`/details/${_id}`}> <button className='btn text-white btn-outline border-white border-2 hover:bg-blue-900 hover:text-white'>Details</button></Link>
                </div>
            </div>
        </div>
    );
};

export default Course;
