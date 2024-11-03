import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { FaRegFileArchive, FaEye } from "react-icons/fa";
import Swal from "sweetalert2";
import "./courseAssignment.css";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import axios from "axios";

const CourseAssignment = () => {
  const axiosSecure = useAxiosSecure();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCourse, setFilterCourse] = useState("");
  const [courseList, setCourseList] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [assignedCourses, setAssignedCourses] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const itemsPerPage = 7;

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

  const getCourseNameById = (courseId) => {
    const course = courseList.find((course) => course._id === courseId);
    return course ? course.courseName : "Unknown Course";
  };

  const combinedData = React.useMemo(() => {
    return students
      .map((student) => {
        const userInfo = users.find((user) => user._id === student.userId);
        console.log("User Info:", userInfo);
        if (!userInfo) return null;

        return {
          _id: userInfo._id,
          name: userInfo.name,
          email: userInfo.email,
          image: userInfo.image,
          type: userInfo.type,
          studentID: student.studentID,
          session: student.session,
          prefCourse: getCourseNameById(student.prefCourse),
          assignedCourse: student.assigned_course || "",
        };
      })

      .filter(
        (item) =>
          item !== null &&
          item.assignedCourse === "" &&
          (filterCourse ? item.prefCourse === filterCourse : true)
      );
  }, [students, users, filterCourse, courseList]);

  useEffect(() => {
    const initialAssignedCourses = {};
    combinedData.forEach((student) => {
      if (!assignedCourses[student._id]) {
        initialAssignedCourses[student._id] = student.prefCourse;
      }
    });

    if (Object.keys(initialAssignedCourses).length > 0) {
      setAssignedCourses((prev) => ({
        ...prev,
        ...initialAssignedCourses,
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

  const handleSelectAll = () => {
    setSelectAll((prev) => !prev);
    setSelectedUsers((prev) =>
      !prev ? currentUsers.map((user) => user._id) : []
    );
  };

  const handleMakeBatch = () => {
    if (selectedBatch) {
      const selectedUserDetails = selectedUsers.map((userId) => {
        const assignedCourseName =
          assignedCourses[userId] ||
          students.find((student) => student.userId === userId)?.prefCourse;
        const assignedCourse = courseList.find(
          (course) => course.courseName === assignedCourseName
        );

        return {
          id: userId,
          assignedCourse: assignedCourseName || "Not Assigned",
          courseId: assignedCourse ? assignedCourse._id : null,
        };
      });

      console.log(
        "Batch:",
        selectedBatch,
        "Selected Users:",
        selectedUserDetails
      );

      Swal.fire({
        title: "Batch Created!",
        text: `Assigned selected students to Batch ${selectedBatch}`,
        icon: "success",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "No Batch Selected",
        text: "Please select a batch before proceeding.",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between mx-8 items-center">
        <h2 className="text-3xl font-bold mt-8 mb-10">
          Total Students: {combinedData.length}
        </h2>

        <div className="mb-4 flex justify-center">
          <select
            className="select select-bordered"
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
        </div>
      </div>

      {filterCourse && combinedData.length === 0 ? (
        <div className="text-center text-2xl mt-32 min-h-screen font-semibold text-red-600">
          No students prefer the selected course.
        </div>
      ) : (
        <div className="overflow-x-auto min-h-screen">
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
                <th className="text-lg font-semibold text-white">
                  Preferable Course
                </th>
                <th className="text-lg font-semibold text-white">
                  Assign Course
                </th>
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
                    <select
                      className="select select-bordered select-sm"
                      value={assignedCourses[user._id] || user.prefCourse}
                      onChange={(e) => {
                        setAssignedCourses((prev) => ({
                          ...prev,
                          [user._id]: e.target.value,
                        }));
                      }}
                    >
                      <option disabled value="">
                        Select Course
                      </option>
                      {courseList.map((course) => (
                        <option key={course._id} value={course.courseName}>
                          {course.courseName}
                        </option>
                      ))}
                    </select>
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

                    <button className="ml-5">
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
        <select
          className="select select-bordered w-full max-w-xs"
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
        >
          <option value="">Select Batch</option>
          <option value="Batch 1">Batch 1</option>
          <option value="Batch 2">Batch 2</option>
          <option value="Batch 3">Batch 3</option>
          <option value="Batch 4">Batch 4</option>
        </select>
        <button
          className="btn bg-blue-950 ml-2 text-white mb-8"
          onClick={handleMakeBatch}
          disabled={selectedUsers.length === 0 || !selectedBatch}
        >
          Create Batch
        </button>
      </div>

      {/* Modal for student details */}
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
                Assigned Course:{" "}
                {assignedCourses[selectedStudent._id] || "Not Assigned"}
              </p>
              <div className="modal-action">
                <button
                  className="btn"
                  onClick={() => {
                    setSelectedStudent(null);
                    document.getElementById("studentModal").close(); // Close the modal
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
