import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const CourseDetails = () => {
  const { id } = useParams(); // Get the course ID from the URL
  const [course, setCourse] = useState(null); // State to store course data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/courses/${id}`); // Adjust URL to match your backend
        if (!response.ok) throw new Error("Failed to fetch course details");
        
        const data = await response.json();
        setCourse(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  if (loading) return <p>Loading course details...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-6 bg-white  w-[1000px] h-[600px] mx-auto mt-10 flex flex-col gap-6">
      
      {/* Breadcrumb Navigation */}
      <div className="breadcrumbs text-sm mb-4">
        <ul className="flex space-x-2 text-gray-600">
          <li><Link to="/dashboard" className="text-blue-900 text-xl font-medium hover:underline">Dashboard</Link></li>
          <li><Link to="/dashboard/courseManagement" className="text-blue-900 text-xl font-medium hover:underline">Course Management</Link></li>
          <li className="text-gray-700 text-xl font-medium ">Course Details</li>
          <li className="text-gray-700 text-xl font-medium ">{course.courseName}</li>
        </ul>
      </div>

      {/* Course Details */}
      <div className="flex rounded shadow-md gap-12 mt-12 p-8">
        <img src={course.image} alt={course.courseName} className="flex-1 w-full h-80 object-cover rounded mb-4" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4">{course.courseName}</h1>
          <p className="mb-2"><strong>Level:</strong> {course.level}</p>
          <p className="mb-2"><strong>Course Duration:</strong> {course.courseDuration}</p>
          <p className="mb-2"><strong>Minimum Educational Qualification:</strong> {course.minimumEducationalQualification}</p>
          <p className="mb-2"><strong>Age Limit:</strong> {course.ageLimit}</p>
          <p className="mb-2"><strong>Course Status:</strong> {course.isDeleted ? "Archived" : "Active"}</p>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
