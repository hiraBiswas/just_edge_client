import React, { useState, useEffect } from 'react';
import CourseForm from './UpdateForm';

const UpdateCourse = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('http://localhost:5000/courses');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setCourses(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleCourseClick = (course) => {
        setSelectedCourse(course);
    };

    if (loading) {
        return <div>Loading courses...</div>;
    }

    if (error) {
        return <div>Error fetching courses: {error}</div>;
    }

    return (
        <div className="flex">
            {/* Course list section */}
            <div className="flex-1 pr-4">
                <h2 className="text-xl font-bold mb-4">Select Course to Update</h2>
                <ul className="list-disc pl-5">
                    {courses.map((course) => (
                        <li
                            key={course._id}
                            onClick={() => handleCourseClick(course)}
                            className={`text-lg cursor-pointer p-2 rounded ${
                                selectedCourse && selectedCourse._id === course._id
                                    ? 'text-black font-semibold'
                                    : 'hover:bg-gray-100'
                            }`}
                        >
                            {course.courseName}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Update form or placeholder section */}
            <div className="flex-1 pl-4">
                {selectedCourse ? (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Update Course</h2>
                        <CourseForm
                            initialData={selectedCourse}
                            onClose={() => setSelectedCourse(null)}
                        />
                    </>
                ) : (
                    <div className="flex mt-40 justify-center h-full  p-4 rounded">
                        <p className=" text-2xl text-gray-600 font-medium">
                            Select a course to view and update its details.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpdateCourse;
