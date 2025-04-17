import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/courses/${id}`);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-ring loading-lg"></span>
      </div>
    );
  }

  if (error) return <p>Error: {error}</p>;

  return (
    <div className=" bg-white w-[1050px] h-[600px] mx-auto p-4 flex flex-col gap-6">
{/* Breadcrumb Navigation */}
<div className="breadcrumbs text-md mb-6">
  <ul className="flex items-center space-x-2 text-gray-600">
    <li>
      <Link
        to="/dashboard"
        className="text-blue-600 hover:underline font-medium"
      >
        Dashboard
      </Link>
    </li>
  
    <li>
      <Link
        to="/dashboard/courseManagement"
        className="text-blue-600 hover:underline font-medium"
      >
        Course Management
      </Link>
    </li>
  
    <li className="text-gray-500 font-medium">Course Details</li>
  
    <li className="text-gray-500 font-medium">
      {course.courseName}
    </li>
  </ul>
</div>

      {/* Course Details */}
      <div className="flex rounded-sm shadow-md gap-12 mt-12 p-8">
        <img
          src={course.image}
          alt={course.courseName}
          className="flex-1 w-40 h-80 object-cover rounded-sm mb-4"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4">{course.courseName}</h1>
          <p className="mb-2">
            <strong>Level:</strong> {course.level}
          </p>
          <p className="mb-2">
            <strong>Course Duration:</strong>{" "}
            {course.numberOfClass * course.classDuration} hours (
            {course.numberOfClass} classes of {course.classDuration} hours)
          </p>

          <p className="mb-2">
            <strong>Minimum Educational Qualification:</strong>{" "}
            {course.minimumQualification}
          </p>
          <p className="mb-2">
            <strong>Age Limit:</strong> Under {course.ageLimit}
          </p>
          <p className="mb-2">
            <strong>Course Status:</strong>{" "}
            {course.isDeleted ? "Archived" : "Active"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
