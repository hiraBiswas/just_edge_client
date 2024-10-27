import React, { useEffect, useState } from "react";
import { TiPlus } from "react-icons/ti";
import { Link } from "react-router-dom";
import { MdEdit } from "react-icons/md";
import { FaEye, FaFileArchive } from "react-icons/fa";

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items to display per page

  // Fetch data from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:5000/courses");
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // Calculate the number of pages
  const totalPages = Math.ceil(courses.length / itemsPerPage);

  // Get current items for the current page
  const currentItems = courses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="overflow-x-auto mt-8 flex-grow">
        <div className="flex justify-between items-center w-full mb-4">
          {/* Search and Filter Section */}
          <div className="flex items-center gap-4">
            <input className="input input-bordered" placeholder="Search" />
            <select className="select select-bordered">
              <option disabled selected>
                Level
              </option>
              <option>Foundational</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
            <button className="btn px-5">Search</button>
          </div>

          {/* Create Course Button */}
          <div>
            <Link to="/dashboard/createCourse">
              <button className="btn btn-outline flex items-center gap-2">
                <TiPlus />
                Create Course
              </button>
            </Link>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="table w-full mt-8">
            {/* Table Header */}
            <thead className="bg-blue-50">
              <tr className="text-lg font-medium">
                <th>#</th>
                <th>Course Name</th>
                <th>Level</th>
                <th>Qualification</th>
                <th>Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {currentItems.map((course, index) => (
                <tr key={course._id}>
                  <th>{(currentPage - 1) * itemsPerPage + index + 1}</th>
                  <td>{course.courseName}</td>
                  <td>{course.level}</td>
                  <td>{course.minimumEducationalQualification}</td>
                  <td className="flex items-center justify-center gap-4">
                    {/* Link to course details page */}
                    <Link to={`/dashboard/courseDetails/${course._id}`}>
    <FaEye className="text-blue-600 cursor-pointer hover:scale-105" />
</Link>

<Link to={`/dashboard/courseUpdate/${course._id}`}>
                    <MdEdit className="text-green-600 cursor-pointer hover:scale-105" />
                    </Link>
                    <FaFileArchive className="text-red-600 cursor-pointer hover:scale-105" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-end join my-4">
        <button
          className="join-item btn"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </button>

        {/* Display current page */}
        <button className="join-item btn">{`Page ${currentPage}`}</button>

        <button
          className="join-item btn"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CourseManagement;
