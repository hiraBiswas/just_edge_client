import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { FaRegFileArchive, FaEye } from "react-icons/fa";
import Swal from "sweetalert2";
import "./courseAssignment.css";

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
  const itemsPerPage = 7;
  const queryClient = useQueryClient();


  // Fetch batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await axiosSecure.get("/batches");
        setBatchList(response.data);
      } catch (error) {
        console.error("Error fetching batches:", error);
      }
    };
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
      }
    };
    fetchCourses();
  }, [axiosSecure]);

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
  const totalPages = Math.ceil(combinedData.length / itemsPerPage);

  const handleSelectUser = (userId) => {
    setSelectedUsers((prevSelected) => {
      const updatedSelection = prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId];
      return updatedSelection;
    });
  };

  // const handleSelectAll = () => {
  //   setSelectAll((prev) => !prev);
  
  //   setSelectedUsers((prev) =>
  //     selectAll
  //       ? [] // Deselect all users if currently selected
  //       : currentUsers.map((user) => user._id) // Select all visible users
  //   );
  // };

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
        newSelectedUsers.forEach(userId => {
          const user = currentUsers.find(u => u._id === userId);
          if (user && user.prefBatch) {
            batchIncrements[user.prefBatch] = (batchIncrements[user.prefBatch] || 0) + 1;
          }
        });
  
        // Update assigned batches based on current page's selections
        setAssignedBatches(prev => {
          const updatedBatches = {...prev};
          newSelectedUsers.forEach(userId => {
            const user = currentUsers.find(u => u._id === userId);
            if (user && !updatedBatches[userId]) {
              updatedBatches[userId] = user.prefBatch;
            }
          });
          return updatedBatches;
        });
  
        return newSelectedUsers;
      }
      
      // If deselecting all, remove only the current page's users
      return prev.filter(id => !allCurrentUserIds.includes(id));
    });
  };
  
  // const handleAssignBatch = async () => {
  //   if (selectedUsers.length > 0) {
  //     const selectedUserDetails = selectedUsers.map(async (userId) => {
  //       // Get the student associated with the user
  //       const student = students.find((student) => student.userId === userId);
  
  //       if (student) {
  //         const studentId = student._id; // Get the student._id from the student object
  
  //         const assignedBatchName = assignedBatches[userId] || student.prefBatch;
  
  //         // Find the corresponding batch from the batchList
  //         const assignedBatch = batchList.find(
  //           (batch) => batch.batchName === assignedBatchName
  //         );
  
  //         // Prepare the data to be updated (only update the enrolled_batch)
  //         const updateData = {
  //           enrolled_batch: assignedBatch ? assignedBatch._id : null, // Only update enrolled_batch
  //         };
  
  //         // Perform the patch request to update the student's enrolled_batch
  //         try {
  //           const response = await axiosSecure.patch(
  //             `/students/${studentId}`,
  //             updateData
  //           );
  
  //           if (response.status === 200) {
  //             console.log(`Assigned Batch ${assignedBatchName} to student ${studentId}`);
  //             Swal.fire({
  //               title: "Batch Assigned!",
  //               text: `Assigned selected students to Batch ${assignedBatchName}`,
  //               icon: "success",
  //             });
  
  //             // Refetch the students data after the patch operation
  //             await queryClient.refetchQueries(["students"]);
  //           }
  //         } catch (error) {
  //           console.error("Error assigning batch:", error);
  //           Swal.fire({
  //             icon: "error",
  //             title: "Error Assigning Batch",
  //             text: "There was an issue assigning the batch. Please try again.",
  //           });
  //         }
  //       }
  //     });
  
  //     await Promise.all(selectedUserDetails); // Ensure all updates are completed before finishing the process
  //   } else {
  //     Swal.fire({
  //       icon: "error",
  //       title: "No Students Selected",
  //       text: "Please select students before proceeding.",
  //     });
  //   }
  // };
  
  
  
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
          const assignedBatchName = assignedBatches[userId] || student.prefBatch;
  
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
  
          console.log(`Assigned batch ID: ${assignedBatch._id}, Name: ${assignedBatch.batchName}`);
  
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
              console.log(`Batch ${assignedBatchName} assigned to student ${studentId}`);
              successfulAssignments.push(userId);
              
              // Increment batch update count
              batchUpdates[assignedBatch._id] = (batchUpdates[assignedBatch._id] || 0) + 1;
            }
          } catch (error) {
            console.error(`Error assigning batch to student ${studentId}:`, error);
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
  
          const newEnrolledStudentNumber = (batch.enrolledStudentNumber || 0) + increment;
  
          try {
            const response = await axiosSecure.patch(`/batches/${batchId}`, {
              enrolledStudentNumber: newEnrolledStudentNumber,
            });
  
            if (response.status === 200) {
              console.log(`Batch ${batchId} updated successfully`);
              console.log(`New enrolledStudentNumber: ${newEnrolledStudentNumber}`);
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
            <p>Successfully assigned batches to ${successfulAssignments.length} students.</p>
            ${failedAssignments.length > 0 ? `<p style="color:red">${failedAssignments.length} assignments failed.</p>` : ''}
          `,
          icon: successfulAssignments.length === selectedUsers.length ? "success" : "warning",
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
    <div className="">
      <div className="flex justify-between mx-8 items-center">
        <h2 className="text-3xl font-bold mt-8 mb-10">
          Total Students: {combinedData.length}
        </h2>

        <div className="mb-4 flex justify-center">
          <select
            className="select select-bordered"
            value={filterCourse} // updated filterCourse
            onChange={(e) => setFilterCourse(e.target.value)} // updated filterCourse
          >
            <option value="">Filter by Course</option>
            {courseList.map((course) => (
              <option key={course._id} value={course.courseName}>
                {course.courseName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filterCourse && combinedData.length === 0 ? (
        <div className="text-center text-2xl mt-32 min-h-screen font-semibold text-red-600">
          No students prefer the selected course.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-blue-950 text-white">
              <tr className="text-white">
                <th>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="text-lg font-semibold text-white">#</th>
                <th className="text-lg font-semibold text-white">Image</th>
                <th className="text-lg font-semibold text-white">Name</th>
                <th className="text-lg font-semibold text-white">Student ID</th>
                <th className="text-lg font-semibold text-white">Session</th>
                <th className="text-lg font-semibold text-white">Preferred Course</th>
                <th className="text-lg font-semibold text-white">Assign Batch</th>
                <th className="text-lg font-semibold text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, index) => (
                <tr
                  className="text-base text-black compact-row"
                  key={user._id}
                  style={{ height: "15px", padding: "0.25rem" }}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                    />
                  </td>
                  <td>{index + 1}</td>
                  <td className="text-right text-base text-black">
                    <div className="flex items-center justify-center gap-4">
                      <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                          <img src={user.image} alt="User Avatar" />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{user.name}</td>
                  <td>{user.studentID}</td>
                  <td>{user.session}</td>
                  <td>{user.prefCourse}</td>
                  <td>
                 <td>
 
    <select
      className="select select-bordered select-sm"
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
        .filter((batch) => batch.status === "Soon to be started") // filter batches
        .map((batch) => (
          <option key={batch._id} value={batch.batchName}>
            {batch.batchName} ({batch.enrolledStudentNumber})
          </option>
        ))}
    </select>
  
</td>

                  </td>
                  <td>
                    <button
                      className="ml-5"
                      onClick={() => {
                        setSelectedStudent(user);
                        document.getElementById("studentModal").showModal();
                      }}
                    >
                      <FaEye />
                    </button>

                    <button onClick={handleArchive} className="ml-5">
                      <FaRegFileArchive />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-4 text-lg font-semibold text-black">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="btn btn-sm bg-blue-950"
        >
          Previous
        </button>
        <span className="mx-4">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage >= totalPages}
          className="btn btn-sm bg-blue-950"
        >
          Next
        </button>
      </div>

      <div className="flex justify-center mt-4">
        <button
          className="btn bg-blue-950 ml-2 text-white mb-8"
          onClick={handleAssignBatch}
        >
          Assign Batch
        </button>
      </div>

      {/* Modal for student details */}
      <dialog id="studentModal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          {selectedStudent ? (
            <>
              <h3 className="font-bold text-lg">{selectedStudent.name}</h3>
              <img
                src={selectedStudent.image}
                alt="Student Avatar"
                className="w-24 h-24 rounded-full"
              />
              <p className="py-4">Email: {selectedStudent.email}</p>
              <p>Student ID: {selectedStudent.studentID}</p>
              <p>Session: {selectedStudent.session}</p>
              <p>Preferred Course: {selectedStudent.prefCourse}</p>
              <p>
                Assigned Batch:{" "}
                {assignedBatches[selectedStudent.enrolled_batch] || "Not Assigned"}
              </p>
              <div className="modal-action">
                <button
                  className="btn"
                  onClick={() => {
                    setSelectedStudent(null);
                    document.getElementById("studentModal").close();
                  }}
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </dialog>
    </div>
  );
};

export default CourseAssignment;