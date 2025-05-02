import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { FaRegFileArchive, FaEye } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import "./courseAssignment.css";
import { Link } from "react-router-dom";

const CourseAssignment = () => {
  const axiosSecure = useAxiosSecure();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCourse, setFilterCourse] = useState("");
  const [batchList, setBatchList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 8;
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);

  // Fetch batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await axiosSecure.get("/batches");
        setBatchList(response.data);
      } catch (error) {
        console.error("Error fetching batches:", error);
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    fetchBatches();
  }, [axiosSecure]);

// Fetch courses
useEffect(() => {
  const fetchCourses = async () => {
    try {
      const response = await axiosSecure.get("/courses");
      // Filter out courses where isDeleted is true
      const activeCourses = response.data.filter(course => course.isDeleted === false);
      setCourseList(activeCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      if (error.code === "ERR_NETWORK") {
        toast.error("Network Error: Please check your internet connection.");
      } else {
        toast.error(`Error fetching courses: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  fetchCourses();
}, []);

  // Fetch users and students data
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users");
      return res.data.filter((user) => user.type === "student");
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await axiosSecure.get("/students");
      return res.data;
    },
  });

  const getBatchNameById = (batchId) => {
    const batch = batchList.find((batch) => batch._id === batchId);
    return batch ? batch.batchName : "Unknown Batch";
  };

  const getCourseNameById = (courseId) => {
    const course = courseList.find((course) => course._id === courseId);
    return course ? course.courseName : "Unknown Course";
  };

  const combinedData = React.useMemo(() => {
    return students
      .map((student) => {
        const userInfo = users.find((user) => user._id === student.userId);
        if (!userInfo) return null;

        return {
          _id: userInfo._id,
          name: userInfo.name,
          email: userInfo.email,
          image: userInfo.image,
          type: userInfo.type,
          studentID: student.studentID,
          session: student.session,
          prefBatch: getBatchNameById(student.prefBatch),
          prefCourse: getCourseNameById(student.prefCourse),
          enrolled_batch: student.enrolled_batch,
          studentDocId: student._id, // Add student document ID
          isDeleted: student.isDeleted || false, // Add isDeleted status
        };
      })
      .filter(
        (item) =>
          item !== null &&
          item.isDeleted === false &&
          item.enrolled_batch === null &&
          (filterCourse ? item.prefCourse === filterCourse : true)
      );
  }, [students, users, filterCourse, batchList, courseList]);

  // Pagination
  const totalPages = Math.ceil(combinedData.length / itemsPerPage);
  const currentItems = combinedData
    .filter((instructor) =>
      instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = combinedData.slice(indexOfFirstItem, indexOfLastItem);

  const handleSelectUser = (userId) => {
    setSelectedUsers((prevSelected) => {
      const updatedSelection = prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId];
      return updatedSelection;
    });
  };

  const handleSelectAll = () => {
    setSelectAll((prev) => !prev);

    const allCurrentUserIds = currentUsers.map((user) => user._id);

    setSelectedUsers((prev) => {
      if (!selectAll) {
        return [...new Set([...prev, ...allCurrentUserIds])];
      }
      return prev.filter((id) => !allCurrentUserIds.includes(id));
    });
  };

  const handleAssignBatch = async () => {
    if (selectedUsers.length === 0) {
      toast.error(
        "No students selected. Please select students before proceeding."
      );
      return;
    }

    if (!selectedBatch) {
      toast.error(
        "No batch selected. Please select a batch before proceeding."
      );
      return;
    }

    // Find the selected batch
    const batchToAssign = batchList.find(
      (batch) => batch.batchName === selectedBatch
    );

    if (!batchToAssign) {
      toast.error("Invalid batch. The selected batch could not be found.");
      return;
    }

    // Check if batch has available seats
    const availableSeats =
      batchToAssign.seat - (batchToAssign.occupiedSeat || 0);
    if (selectedUsers.length > availableSeats) {
      toast.error(
        `The selected batch only has ${availableSeats} available seats, but you're trying to assign ${selectedUsers.length} students.`
      );
      return;
    }

    try {
      const successfulAssignments = [];
      const failedAssignments = [];

      // First, verify all students can be assigned (pre-check)
      for (const userId of selectedUsers) {
        const student = students.find((s) => s.userId === userId);
        if (!student) {
          failedAssignments.push(userId);
        }
      }

      if (failedAssignments.length > 0) {
        toast.error(
          `Could not find ${failedAssignments.length} student records. Assignment aborted.`
        );
        return;
      }

      // Process all assignments in a single transaction if your backend supports it
      // Alternatively, process sequentially with error handling
      for (const userId of selectedUsers) {
        try {
          const student = students.find((s) => s.userId === userId);
          const response = await axiosSecure.patch(`/students/${student._id}`, {
            enrolled_batch: batchToAssign._id,
          });

          if (response.status === 200) {
            successfulAssignments.push(userId);
          } else {
            failedAssignments.push(userId);
          }
        } catch (error) {
          console.error(`Error assigning batch to student ${userId}:`, error);
          failedAssignments.push(userId);
        }
      }

      // Update batch occupied seats if any assignments were successful
      if (successfulAssignments.length > 0) {
        try {
          await axiosSecure.patch(`/batches/${batchToAssign._id}`, {
            occupiedSeat:
              (batchToAssign.occupiedSeat || 0) + successfulAssignments.length,
          });
        } catch (error) {
          console.error("Error updating batch seats:", error);
          // Revert student assignments if batch update fails
          for (const userId of successfulAssignments) {
            try {
              const student = students.find((s) => s.userId === userId);
              await axiosSecure.patch(`/students/${student._id}`, {
                enrolled_batch: null,
              });
            } catch (revertError) {
              console.error(
                `Failed to revert assignment for student ${userId}:`,
                revertError
              );
            }
          }
          toast.error(
            "Failed to update batch seats. All assignments have been reverted."
          );
          return;
        }
      }

      // Show result
      if (successfulAssignments.length > 0) {
        toast.success(
          `Successfully assigned ${batchToAssign.batchName} to ${successfulAssignments.length} students.`
        );
      }

      if (failedAssignments.length > 0) {
        toast.error(`Failed to assign ${failedAssignments.length} students.`);
      }

      // Refresh data
      await queryClient.refetchQueries(["students"]);
      await queryClient.refetchQueries(["batches"]);
    } catch (error) {
      console.error("Error during batch assignment:", error);
      if (error.response?.status === 401) {
        // Handle unauthorized error (likely token expired)
        toast.error("Session expired. Please login again.");
        // You might want to redirect to login here
      } else {
        toast.error("An unexpected error occurred during assignment.");
      }
    } finally {
      // Reset selections
      setSelectedUsers([]);
      setSelectAll(false);
      setSelectedBatch("");
    }
  };

  const handleArchiveStudent = async (studentId, studentDocId) => {
    const confirmArchive = window.confirm(
      "Are you sure you want to archive this student?"
    );

    if (!confirmArchive) return;

    try {
      const response = await axiosSecure.patch(`/students/${studentDocId}`, {
        isDeleted: true,
      });

      if (response.status === 200) {
        toast.success("Student archived successfully");
        await queryClient.refetchQueries(["students"]);
      } else {
        toast.error("Failed to archive student");
      }
    } catch (error) {
      console.error("Error archiving student:", error);
      toast.error("An error occurred while archiving the student");
    }
  };

  const availableBatches = batchList.filter((batch) => {
    const occupied = batch.occupiedSeat || 0;
    const hasAvailableSeats = occupied < batch.seat;
    const validStatus =
      batch.status === "Ongoing" || batch.status === "Upcoming";

    if (selectedUsers.length > 0) {
      const firstStudent = combinedData.find((student) =>
        selectedUsers.includes(student._id)
      );
      if (firstStudent) {
        return (
          hasAvailableSeats &&
          validStatus &&
          batch.course_id ===
            courseList.find((c) => c.courseName === firstStudent.prefCourse)
              ?._id
        );
      }
    }

    return hasAvailableSeats && validStatus;
  });

  return (
    <div className="min-h-[calc(100vh-64px)] mt-6 w-[1100px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Student Batch Enrollment
          </h1>
          <p className="text-gray-600">Manage student batch Enrollment</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* In the first select element (Filter by Course) */}
          <select
            className="select select-bordered w-full md:w-64"
            value={filterCourse}
            onChange={(e) => {
              setFilterCourse(e.target.value);
              setCurrentPage(1); // Reset to first page when changing filter
            }}
          >
            <option value="">Filter by Course</option>
            {courseList.map((course) => (
              <option key={course._id} value={course.courseName}>
                {course.courseName}
              </option>
            ))}
          </select>

          <Link
            to="/dashboard/changeRequests"
            className="btn btn-outline w-full md:w-auto"
          >
            View Change Requests
          </Link>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Total Students:{" "}
          <span className="text-blue-600">{combinedData.length}</span>
        </h2>
      </div>

      {/* Batch Selection (shown only when students are selected) */}
      {selectedUsers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Selected Students ({selectedUsers.length}) to Batch:
              </label>

              {availableBatches.length > 0 ? (
                <>
                  <select
                    className="select select-bordered w-full"
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                  >
                    <option value="">Select a Batch</option>
                    {availableBatches.map((batch) => {
                      const course = courseList.find(
                        (c) => c._id === batch.course_id
                      );
                      const availableSeats =
                        batch.seat - (batch.occupiedSeat || 0);
                      return (
                        <option
                          key={batch._id}
                          value={batch.batchName}
                          disabled={availableSeats < selectedUsers.length}
                        >
                          {batch.batchName} (
                          {course?.courseName || "Unknown Course"}) - Available:{" "}
                          {availableSeats}/{batch.seat} ({batch.status})
                          {availableSeats < selectedUsers.length &&
                            " - Not enough seats"}
                        </option>
                      );
                    })}
                  </select>
                  <div className="mt-2 text-sm text-gray-500">
                    Showing batches for:{" "}
                    {combinedData.find((student) =>
                      selectedUsers.includes(student._id)
                    )?.prefCourse || "All courses"}
                  </div>
                </>
              ) : (
                <div className="alert alert-warning shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-bold">No available batches!</h3>
                    <div className="text-xs">
                      No ongoing/upcoming batches found with available seats for
                      the selected students' preferred course.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                className="btn btn-primary"
                onClick={handleAssignBatch}
                disabled={!selectedBatch || availableBatches.length === 0}
              >
               Enroll
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setSelectedUsers([]);
                  setSelectedBatch("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Data Loaded State */}
      {!loading && (
        <>
          {/* No Data State */}
          {combinedData.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-700">
                {filterCourse
                  ? "No students prefer the selected course"
                  : "No student data available"}
              </h3>
            </div>
          )}

          {/* Data Available State */}
          {combinedData.length > 0 && (
            <>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                    <table className="table w-full">
                      <thead className="bg-blue-950 text-white sticky top-0 z-10">
                        <tr>
                          <th className="w-10">
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={handleSelectAll}
                              className="checkbox checkbox-sm bg-white border border-gray-300"
                            />
                          </th>
                          <th className="py-3 px-4 text-left">#</th>
                          <th className="py-3 px-4 text-left min-w-[150px]">
                            Name
                          </th>
                          <th className="py-3 px-4 text-left">Student ID</th>
                          <th className="py-3 px-4 text-left">Session</th>
                          <th className="py-3 px-4 text-left min-w-[180px]">
                            Preferred Course
                          </th>
                          <th className="py-3 px-4 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentUsers.map((user, index) => (
                          <tr key={user._id} className="hover:bg-gray-50">
                            <td className="py-2 px-4">
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(user._id)}
                                onChange={() => handleSelectUser(user._id)}
                                className="checkbox checkbox-sm"
                              />
                            </td>
                            <td className="py-2 px-4">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                        
                            <td className="py-2 px-4 font-medium">
                              {user.name}
                            </td>
                            <td className="py-2 px-4">{user.studentID}</td>
                            <td className="py-2 px-4">{user.session}</td>
                            <td className="py-2 px-4">{user.prefCourse}</td>
                            <td className="py-2 px-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedStudent(user);
                                    document
                                      .getElementById("studentModal")
                                      .showModal();
                                  }}
                                  className="btn btn-ghost btn-sm text-gray-600 hover:text-blue-600"
                                  title="View Details"
                                >
                                  <FaEye size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleArchiveStudent(
                                      user._id,
                                      user.studentDocId
                                    )
                                  }
                                  className="btn btn-ghost btn-sm text-gray-600 hover:text-red-600"
                                  title="Archive Student"
                                >
                                  <FaRegFileArchive size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end p-4 border-t border-gray-200">
          <div className="join">
            <button
              className="join-item btn"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              «
            </button>
            <button className="join-item btn">
              Page {currentPage} of {totalPages}
            </button>
            <button
              className="join-item btn"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      <dialog id="studentModal" className="modal">
        <div className="modal-box max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Student Details</h3>
            <button
              onClick={() => {
                setSelectedStudent(null);
                document.getElementById("studentModal").close();
              }}
              className="btn btn-sm btn-circle btn-ghost"
            >
              ✕
            </button>
          </div>

          {selectedStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <img
                  src={selectedStudent.image}
                  alt={selectedStudent.name}
                  className="w-32 h-32 rounded-full object-cover mb-4"
                />
                <h4 className="text-xl font-semibold">
                  {selectedStudent.name}
                </h4>
                <p className="text-gray-600">{selectedStudent.email}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Student ID:</span>
                  <span>{selectedStudent.studentID}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Session:</span>
                  <span>{selectedStudent.session}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Preferred Course:</span>
                  <span>{selectedStudent.prefCourse}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </dialog>
      <Toaster position="top-center" />
    </div>
  );
};

export default CourseAssignment;
