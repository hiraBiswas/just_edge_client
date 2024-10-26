import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import "./courseAssignment.css";

const CourseAssignment = () => {
  const axiosSecure = useAxiosSecure();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCourse, setFilterCourse] = useState("");
  const [courseList, setCourseList] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("");
  const itemsPerPage = 7;

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

  // Fetch users data
  const { data: users = [], refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users");
      return res.data.filter((user) => user.type === "student");
    },
  });

  // Fetch students data
  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await axiosSecure.get("/students");
      return res.data;
    },
  });

  // Combine user and student data
  const combinedData = students
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
        prefCourse: student.prefCourse,
        assignedCourse: student.assigned_course || "",
      };
    })
    .filter(
      (item) =>
        item !== null &&
        item.assignedCourse === "" &&
        (filterCourse ? item.prefCourse === filterCourse : true)
    );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = combinedData.slice(indexOfFirstItem, indexOfLastItem);

  // Define filteredUsers for pagination
  const filteredUsers = combinedData.filter(
    (user) =>
      user.assignedCourse === "" &&
      (filterCourse ? user.prefCourse === filterCourse : true)
  );

  const handleAssignCourse = async (userId, course) => {
    try {
      const updatedUser = { assignedCourse: course };
      await axiosSecure.patch(`/users/${userId}`, updatedUser);
      refetch();

      Swal.fire({
        title: "Assigned!",
        text: "Course assigned successfully.",
        icon: "success",
      });
    } catch (error) {
      console.error("Error assigning course:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
    }
  };

  const handleDeleteUser = (user) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure.delete(`/users/${user._id}`).then((res) => {
          if (res.data.deletedCount > 0) {
            refetch();
            Swal.fire({
              title: "Deleted!",
              text: "Your file has been deleted.",
              icon: "success",
            });
          }
        });
      }
    });
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prevSelected) => {
      const updatedSelection = prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId];
      return updatedSelection;
    });
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      const allUserIds = currentUsers.map((user) => user._id);
      setSelectedUsers(allUserIds);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleMakeBatch = () => {
    if (selectedBatch) {
      console.log("Batch:", selectedBatch, "Users:", selectedUsers);
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
        <h2 className="text-3xl font-bold mt-8 mb-5">
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
            <thead>
              <tr className="">
                <th>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="text-lg font-semibold text-black">#</th>
                <th className="text-lg font-semibold text-black">Image</th>
                <th className="text-lg font-semibold text-black">Name</th>
                <th className="text-lg font-semibold text-black">Student ID</th>
                <th className="text-lg font-semibold text-black">Session</th>
                <th className="text-lg font-semibold text-black">
                  Preferable Course
                </th>
                <th className="text-lg font-semibold text-black">
                  Assign Course
                </th>
                <th className="text-lg font-semibold text-black">Action</th>
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
                    {user.assignedCourse ? (
                      user.assignedCourse
                    ) : (
                      <select
                        className="select select-bordered select-sm"
                        value={user.assignedCourse || user.prefCourse} // Set prefCourse as default
                        onChange={(e) =>
                          handleAssignCourse(user._id, e.target.value)
                        }
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
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="btn btn-ghost btn-xs"
                    >
                      <FaTrashAlt />
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
          Page {currentPage} of {Math.ceil(filteredUsers.length / itemsPerPage)}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={indexOfLastItem >= filteredUsers.length}
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
        <button className="btn bg-blue-950 ml-2" onClick={handleMakeBatch}>
          Create Batch
        </button>
      </div>
    </div>
  );
};

export default CourseAssignment;
