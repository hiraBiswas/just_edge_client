import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { FaRegFileArchive, FaEye } from "react-icons/fa";
import Swal from "sweetalert2";
import "./courseAssignment.css";
import { Link } from "react-router-dom";

const CourseAssignment = () => {
  const axiosSecure = useAxiosSecure();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCourse, setFilterCourse] = useState(""); // changed to filter by course
  const [batchList, setBatchList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [assignedBatches, setAssignedBatches] = useState({});
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
        setLoading(false); // Ensure that loading is set to false after data is fetched or failed
      }
    };
    setLoading(true); // Set loading to true when data is being fetched
    fetchBatches();
  }, [axiosSecure]);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosSecure.get("/courses");
        setCourseList(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        if (error.code === "ERR_NETWORK") {
          Swal.fire({
            icon: "error",
            title: "Network Error",
            text: "Please check your internet connection.",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error fetching courses",
            text: error.message,
          });
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
          enrolled_batch: student.enrolled_batch, // include enrolled_batch
          assignedBatch: student.assigned_batch || "",
        };
      })
      .filter(
        (item) =>
          item !== null &&
          item.enrolled_batch === null && // Only show students without an enrolled batch
          (filterCourse ? item.prefCourse === filterCourse : true) // updated filter by course
      );
  }, [students, users, filterCourse, batchList, courseList]);

  // Paginate the combined data
  const totalPages = Math.ceil(combinedData.length / itemsPerPage);
  const currentItems = combinedData
    .filter((instructor) =>
      instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    const initialAssignedBatches = {};
    combinedData.forEach((student) => {
      if (!assignedBatches[student._id]) {
        initialAssignedBatches[student._id] = student.prefBatch;
      }
    });

    if (Object.keys(initialAssignedBatches).length > 0) {
      setAssignedBatches((prev) => ({
        ...prev,
        ...initialAssignedBatches,
      }));
    }
  }, [combinedData]);

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
      // If currently selecting all, add all current users
      if (!selectAll) {
        // Merge with existing selected users to avoid duplicates
        const newSelectedUsers = [...new Set([...prev, ...allCurrentUserIds])];

        // Track batch increments
        const batchIncrements = {};
        newSelectedUsers.forEach((userId) => {
          const user = currentUsers.find((u) => u._id === userId);
          if (user && user.prefBatch) {
            batchIncrements[user.prefBatch] =
              (batchIncrements[user.prefBatch] || 0) + 1;
          }
        });

        // Update assigned batches based on current page's selections
        setAssignedBatches((prev) => {
          const updatedBatches = { ...prev };
          newSelectedUsers.forEach((userId) => {
            const user = currentUsers.find((u) => u._id === userId);
            if (user && !updatedBatches[userId]) {
              updatedBatches[userId] = user.prefBatch;
            }
          });
          return updatedBatches;
        });

        return newSelectedUsers;
      }

      // If deselecting all, remove only the current page's users
      return prev.filter((id) => !allCurrentUserIds.includes(id));
    });
  };

  const handleAssignBatch = async () => {
    console.log("Starting batch assignment process...");
    console.log("Selected Users:", selectedUsers);
    console.log("Current Assigned Batches:", assignedBatches);

    if (selectedUsers.length > 0) {
      // Map to store batch IDs and their new enrolledStudentNumber
      const batchUpdates = {};
      const successfulAssignments = [];
      const failedAssignments = [];

      const selectedUserDetails = selectedUsers.map(async (userId) => {
        console.log(`Processing user ID: ${userId}`);

        // Get the student associated with the user
        const student = students.find((student) => student.userId === userId);

        if (student) {
          const studentId = student._id;
          const assignedBatchName =
            assignedBatches[userId] || student.prefBatch;

          console.group(`Student ${studentId} Details`);
          console.log(`Preferred batch: ${student.prefBatch}`);
          console.log(`Assigned batch from UI: ${assignedBatchName}`);

          // Find the corresponding batch from the batchList
          const assignedBatch = batchList.find(
            (batch) => batch.batchName === assignedBatchName
          );

          if (!assignedBatch) {
            console.warn(`Batch "${assignedBatchName}" not found!`);
            failedAssignments.push(userId);
            console.groupEnd();
            return;
          }

          console.log(
            `Assigned batch ID: ${assignedBatch._id}, Name: ${assignedBatch.batchName}`
          );

          // Prepare the data to be updated
          const updateData = {
            enrolled_batch: assignedBatch._id,
          };

          try {
            const response = await axiosSecure.patch(
              `/students/${studentId}`,
              updateData
            );

            if (response.status === 200) {
              console.log(
                `Batch ${assignedBatchName} assigned to student ${studentId}`
              );
              successfulAssignments.push(userId);

              // Increment batch update count
              batchUpdates[assignedBatch._id] =
                (batchUpdates[assignedBatch._id] || 0) + 1;
            }
          } catch (error) {
            console.error(
              `Error assigning batch to student ${studentId}:`,
              error
            );
            failedAssignments.push(userId);
          }
          console.groupEnd();
        }
      });

      await Promise.all(selectedUserDetails);

      // Log batch update details
      console.log("Batch Updates:", batchUpdates);

      // Update the enrolledStudentNumber for all affected batches
      const batchUpdatePromises = Object.entries(batchUpdates).map(
        async ([batchId, increment]) => {
          console.group(`Batch ${batchId} Update`);
          console.log(`Updating batch with increment: ${increment}`);

          const batch = batchList.find((batch) => batch._id === batchId);

          if (!batch) {
            console.warn(`Batch ID ${batchId} not found!`);
            console.groupEnd();
            return;
          }

          const newOccupiedSeat = (batch.occupiedSeat || 0) + increment;

          try {
            const response = await axiosSecure.patch(`/batches/${batchId}`, {
              occupiedSeat: newOccupiedSeat,
            });

            if (response.status === 200) {
              console.log(`Batch ${batchId} updated successfully`);
              console.log(`New Occupied Seat: ${newOccupiedSeat}`);
            }
          } catch (error) {
            console.error(`Error updating batch ${batchId}:`, error);
          }
          console.groupEnd();
        }
      );

      await Promise.all(batchUpdatePromises);

      // Comprehensive notification
      if (successfulAssignments.length > 0) {
        Swal.fire({
          title: "Batch Assignment Completed",
          html: `
            <p>Successfully assigned batches to ${
              successfulAssignments.length
            } students.</p>
            ${
              failedAssignments.length > 0
                ? `<p style="color:red">${failedAssignments.length} assignments failed.</p>`
                : ""
            }
          `,
          icon:
            successfulAssignments.length === selectedUsers.length
              ? "success"
              : "warning",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Batch Assignment Failed",
          text: "No students could be assigned to batches.",
        });
      }

      // Log final summary
      console.log("Batch Assignment Summary:");
      console.log("Total Selected Users:", selectedUsers.length);
      console.log("Successful Assignments:", successfulAssignments.length);
      console.log("Failed Assignments:", failedAssignments.length);

      // Refetch data to reflect updates
      await queryClient.refetchQueries(["students"]);
      await queryClient.refetchQueries(["batches"]);

      // Reset selection after assignment
      setSelectedUsers([]);
      setSelectAll(false);
    } else {
      Swal.fire({
        icon: "error",
        title: "No Students Selected",
        text: "Please select students before proceeding.",
      });
    }
  };

  const handleArchive = async () => {
    if (selectedUsers.length > 0) {
      const selectedUserDetails = selectedUsers.map((userId) => {
        // Archive the student by setting isDeleted to true
        axiosSecure
          .patch(`/students/${userId}`, {
            isDeleted: true, // Mark student as archived
          })
          .then(() => {
            Swal.fire({
              title: "Student Archived!",
              text: `Student ${userId} has been archived successfully.`,
              icon: "success",
            });
          })
          .catch((error) => {
            console.error("Error archiving student:", error);
            Swal.fire({
              icon: "error",
              title: "Failed to Archive Student",
              text: "Something went wrong while archiving the student.",
            });
          });
      });

      if (selectedUserDetails.some((user) => user === null)) return;
    } else {
      Swal.fire({
        icon: "error",
        title: "No Students Selected",
        text: "Please select students before proceeding.",
      });
    }
  };

  return (
    <div className="min-h-screen w-full p-4 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Student Batch Assignment</h1>
          <p className="text-gray-600">Manage student batch assignments</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <select
            className="select select-bordered w-full md:w-64"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
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
          Total Students: <span className="text-blue-600">{combinedData.length}</span>
        </h2>
      </div>

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
              <p className="text-gray-500 mt-2">
                {filterCourse
                  ? "Try selecting a different course filter"
                  : "Please check back later or add new students"}
              </p>
            </div>
          )}

          {/* Data Available State */}
          {combinedData.length > 0 && (
            <>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead className="bg-blue-950 text-white">
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
                        <th className="py-3 px-4 text-left">Image</th>
                        <th className="py-3 px-4 text-left min-w-[150px]">Name</th>
                        <th className="py-3 px-4 text-left">Student ID</th>
                        <th className="py-3 px-4 text-left">Session</th>
                        <th className="py-3 px-4 text-left min-w-[180px]">Preferred Course</th>
                        <th className="py-3 px-4 text-left min-w-[200px]">Assign Batch</th>
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
                          <td className="py-2 px-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td className="py-2 px-4">
                            <div className="avatar">
                              <div className="mask mask-squircle w-10 h-10">
                                <img src={user.image} alt={user.name} />
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-4 font-medium">{user.name}</td>
                          <td className="py-2 px-4">{user.studentID}</td>
                          <td className="py-2 px-4">{user.session}</td>
                          <td className="py-2 px-4">{user.prefCourse}</td>
                          <td className="py-2 px-4">
                            <select
                              className="select select-bordered select-sm w-full max-w-xs"
                              value={assignedBatches[user._id] || ""}
                              onChange={(e) => {
                                setAssignedBatches((prev) => ({
                                  ...prev,
                                  [user._id]: e.target.value,
                                }));
                              }}
                            >
                              <option value="">Select Batch</option>
                              {batchList
                                .filter((batch) => batch.status === "Upcoming")
                                .map((batch) => (
                                  <option key={batch._id} value={batch.batchName}>
                                    {batch.batchName}
                                  </option>
                                ))}
                            </select>
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedStudent(user);
                                  document.getElementById("studentModal").showModal();
                                }}
                                className="btn btn-ghost btn-sm text-gray-600 hover:text-blue-600"
                                title="View Details"
                              >
                                <FaEye size={16} />
                              </button>
                              <button
                                onClick={handleArchive}
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

                {/* Action Buttons and Pagination */}
                <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200">
                  <div className="mb-4 sm:mb-0">
                    <button
                      className="btn btn-primary"
                      onClick={handleAssignBatch}
                      disabled={selectedUsers.length === 0}
                    >
                      Assign Batch ({selectedUsers.length})
                    </button>
                  </div>
                  
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
              </div>
            </>
          )}
        </>
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
                <h4 className="text-xl font-semibold">{selectedStudent.name}</h4>
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
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Assigned Batch:</span>
                  <span>
                    {assignedBatches[selectedStudent.enrolled_batch] ||
                      "Not Assigned"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
};

export default CourseAssignment;
