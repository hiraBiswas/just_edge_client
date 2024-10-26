import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import "./courseAssignment.css";

const CourseAssignment = () => {
  const axiosSecure = useAxiosSecure();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState("");
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

  const { data: users = [], refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users");
      const filteredUsers = res.data.filter(
        (user) => user.type === "student" && !user.assignedCourse
      );
      return filteredUsers;
    },
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const filteredUsers = filterCourse
    ? users.filter((user) => user.prefCourse === filterCourse)
    : users;

  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

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

      console.log("Selected User IDs:", updatedSelection);
      return updatedSelection;
    });
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      const allUserIds = currentUsers.map((user) => user._id);
      setSelectedUsers(allUserIds);
      console.log("Selected All User IDs:", allUserIds);
    } else {
      setSelectedUsers([]);
      console.log("Selected User IDs: []"); 
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
      <div className="flex justify-between mx-8 items-center ">
        <h2 className="text-3xl font-bold mt-8 mb-5">All Students</h2>
        <h2 className="text-3xl font-bold mt-8 mb-5">
          Total Students: {filteredUsers.length}
        </h2>

        {/* Course Filter */}
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

      {/* If no students prefer the selected course */}
      {filterCourse && filteredUsers.length === 0 ? (
        <div className="text-center text-2xl mt-32 min-h-screen font-semibold text-red-600">
          No students prefer the selected course.
        </div>
      ) : (
        <div className="overflow-x-auto min-h-screen">
          <table className="table w-full">
            <thead>
              <tr>
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
            <tbody className="">
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
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-8 h-8">
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
                        value={
                          user.assignedCourse ||
                          user.prefCourse ||
                          selectedCourse
                        }
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
                      className="btn btn-ghost btn-lg"
                    >
                      <FaTrashAlt className="text-blue-950"></FaTrashAlt>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-center mt-4 text-lg font-semibold text-black">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="mx-4">
          Page {currentPage} of {Math.ceil(filteredUsers.length / itemsPerPage)}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={indexOfLastItem >= filteredUsers.length}
        >
          Next
        </button>
      </div>

      {/* Batch Selection */}
      <div className="flex justify-center items-center ">
  <div className="my-4 mb-5 text-center">
    <label htmlFor="batch-select" className="font-semibold">
      Select Batch:
    </label>
    <select
      id="batch-select"
      className="select select-bordered ml-2"
      value={selectedBatch}
      onChange={(e) => setSelectedBatch(e.target.value)}
    >
      <option value="">Choose a Batch</option>
      <option value="Batch A">Batch A</option>
      <option value="Batch B">Batch B</option>
    </select>
    <button
      className="btn bg-blue-950 ml-4"
      onClick={handleMakeBatch}
      disabled={!selectedBatch || selectedUsers.length === 0}
    >
      Make Batch
    </button>
  </div>
</div>

    </div>
  );
};

export default CourseAssignment;
