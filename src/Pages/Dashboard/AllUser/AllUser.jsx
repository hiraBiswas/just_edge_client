import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";

const AllUser = () => {
  const axiosSecure = useAxiosSecure();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [courseList, setCourseList] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
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
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
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

  return (
    <div>
      <div className="flex justify-evenly my-4">
        <h2 className="text-3xl font-bold mt-8 mb-5">All Students</h2>
        <h2 className="text-3xl font-bold mt-8 mb-5">
          Total Students: {filteredUsers.length}
        </h2>
      </div>

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

      {/* If no students prefer the selected course */}
      {filterCourse && filteredUsers.length === 0 ? (
        <div className="text-center text-2xl mt-32 min-h-screen font-semibold text-red-600">
          No students prefer the selected course.
        </div>
      ) : (
        <div className="overflow-x-auto min-h-screen">
          <table className="table table-zebra w-full">
            {/* Head */}
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
                <th className="text-lg font-semibold text-black">Preferable Course</th>
                <th className="text-lg font-semibold text-black">Assign Course</th>
                <th className="text-lg font-semibold text-black">Action</th>
              </tr>
            </thead>
            <tbody className="p-2">
              {currentUsers.map((user, index) => (
                <tr className="text-base text-black" key={user._id} style={{ height: '40px' }}>
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
                        className="select select-bordered"
                        value={user.assignedCourse || user.prefCourse || selectedCourse}
                        onChange={(e) => handleAssignCourse(user._id, e.target.value)}
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
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(prev + 1, Math.ceil(filteredUsers.length / itemsPerPage))
            )
          }
          disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AllUser;
