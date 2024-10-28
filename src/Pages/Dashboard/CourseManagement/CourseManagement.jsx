import React, { useEffect, useState } from "react";
import { TiPlus } from "react-icons/ti";
import { Link } from "react-router-dom";
import { MdEdit } from "react-icons/md";
import { FaEye, FaFileArchive, FaRegFileArchive } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for skeleton
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  // Fetch data from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:5000/courses");
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };
    fetchCourses();
  }, []);

  const totalPages = Math.ceil(courses.length / itemsPerPage);
  const currentItems = courses
    .filter(
      (course) =>
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedLevel ? course.level === selectedLevel : true)
    )
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleArchive = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:5000/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: true }),
      });

      if (response.ok) {
        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course._id === courseId ? { ...course, isDeleted: true } : course
          )
        );
        toast.success("Course archived successfully!");
      } else {
        toast.error("Failed to archive course.");
      }
    } catch (error) {
      console.error("Error archiving course:", error);
      toast.error("Failed to archive course.");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="overflow-x-auto mt-8 flex-grow">
        <div className="flex justify-between items-center w-full mb-4">
          <div className="flex items-center">
            <input
              className="input input-bordered"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="select select-bordered"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="">All Levels</option>
              <option>Foundational Level</option>
              <option>Intermediate Level</option>
              <option>Advanced Level</option>
            </select>
            <button className="btn px-5 bg-blue-950 text-white">Search</button>
          </div>
          <div>
            <Link to="/dashboard/createCourse">
            <button className="btn border-blue-950 text-blue-950 hover:bg-blue-950 hover:text-white btn-outline flex items-center gap-2">
  <TiPlus />
  Create Course
</button>

            </Link>
          </div>
        </div>

        {/* Table Section with Skeleton Loader */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="animate-pulse w-full mt-8">
              <table className="table w-[1000px]">
                <thead className="bg-gray-200">
                  <tr className="text-lg font-medium">
                    <th>#</th>
                    <th>Course Name</th>
                    <th>Level</th>
                    <th>Qualification</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Skeleton Rows */}
                  {[...Array(itemsPerPage)].map((_, index) => (
                    <tr key={index}>
                      <td className="py-4 px-6 bg-gray-100 rounded-lg"></td>
                      <td className="py-4 px-6 bg-gray-100 rounded-lg"></td>
                      <td className="py-4 px-6 bg-gray-100 rounded-lg"></td>
                      <td className="py-4 px-6 bg-gray-100 rounded-lg"></td>
                      <td className="py-4 px-6 bg-gray-100 rounded-lg"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <table className="table w-[1000px] mt-8">
              <thead className="bg-blue-950 text-white">
                <tr className="text-lg font-medium">
                  <th>#</th>
                  <th>Course Name</th>
                  <th>Level</th>
                  <th>Qualification</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((course, index) => (
                  <tr key={course._id} className={course.isDeleted ? "opacity-50" : ""}>
                    <th>{(currentPage - 1) * itemsPerPage + index + 1}</th>
                    <td>{course.courseName}</td>
                    <td>{course.level}</td>
                    <td>{course.minimumEducationalQualification}</td>
                    <td className="flex items-center justify-center gap-4">
                      <Link to={`/dashboard/courseDetails/${course._id}`}>
                        <FaEye className="text-blue-950 cursor-pointer hover:scale-105" />
                      </Link>
                      <Link to={`/dashboard/courseUpdate/${course._id}`}>
                        <MdEdit className="text-green-600 cursor-pointer hover:scale-105" />
                      </Link>
                      <FaRegFileArchive
                        className="text-red-600 cursor-pointer hover:scale-105"
                        onClick={() => handleArchive(course._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
        <button className="join-item btn">{`Page ${currentPage}`}</button>
        <button
          className="join-item btn"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default CourseManagement;
