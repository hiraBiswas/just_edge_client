import React, { useEffect, useState } from "react";
import { TiPlus } from "react-icons/ti";
import { Link } from "react-router-dom";
import { MdEdit } from "react-icons/md";
import { FaEye, FaFileArchive, FaRegFileArchive } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast";

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
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
        // Filter out deleted courses and sort by createdAt (newest first)
        const activeCourses = data
          .filter(course => !course.isDeleted)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCourses(activeCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Filter courses based on search term and level
  const filteredCourses = courses.filter(
    (course) =>
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedLevel ? course.level === selectedLevel : true)
  );

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const currentItems = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleArchive = async (courseId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/courses/${courseId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isDeleted: true }),
        }
      );

      if (response.ok) {
        // Remove the archived course from the local state
        setCourses(prevCourses => 
          prevCourses.filter(course => course._id !== courseId)
        );
        toast.success("Course archived successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to archive course.");
      }
    } catch (error) {
      console.error("Error archiving course:", error);
      toast.error("Failed to archive course.");
    }
  };

  return (
    <div className="flex flex-col h-screen w-[1100px] mx-auto">
      <div className="overflow-x-auto mt-6 grow">
        <div className="flex justify-between items-center w-full">
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

        {/* Table Section */}
        <div className="bg-white rounded-lg mt-6 shadow-lg border border-gray-100 w-full">
          {loading ? (
            <div className="animate-pulse w-full overflow-hidden">
              <table className="w-full">
                <thead className="bg-blue-950">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider rounded-tl-lg">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                      Course Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                      Level
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                      Qualification
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider rounded-tr-lg">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[...Array(itemsPerPage)].map((_, index) => (
                    <tr key={index} className="hover:bg-blue-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="h-5 bg-gray-100 rounded w-8"></div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="h-5 bg-gray-100 rounded w-48"></div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="h-5 bg-gray-100 rounded w-24"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-5 bg-gray-100 rounded w-36"></div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-4">
                          <div className="h-5 w-5 bg-gray-100 rounded-full"></div>
                          <div className="h-5 w-5 bg-gray-100 rounded-full"></div>
                          <div className="h-5 w-5 bg-gray-100 rounded-full"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-950">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider rounded-tl-lg">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                      Course Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                      Level
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                      Qualification
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider rounded-tr-lg">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-8 text-center text-gray-500 text-sm"
                      >
                        No courses available. Create a new course to get started.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((course, index) => (
                      <tr
                        key={course._id}
                        className="hover:bg-blue-50 transition-colors duration-150"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {course.courseName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {course.level}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                          {course.minimumQualification || (
                            <span className="text-gray-400 italic">
                              Not specified
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center justify-center gap-4">
                            <Link
                              to={`/dashboard/courseDetails/${course._id}`}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="View Details"
                            >
                              <FaEye className="w-5 h-5" />
                            </Link>
                            <Link
                              to={`/dashboard/courseUpdate/${course._id}`}
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title="Edit Course"
                            >
                              <MdEdit className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleArchive(course._id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Archive Course"
                            >
                              <FaRegFileArchive className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredCourses.length > itemsPerPage && (
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
      )}

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default CourseManagement;