import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";

const AllUser = () => {
  const axiosSecure = useAxiosSecure();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState("");
  const itemsPerPage = 7;

  const { data: users = [], refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axiosSecure.get('/users');
      const filteredUsers = res.data.filter(user => user.type === 'student');
      return filteredUsers;
    }
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  const handleAssignCourse = async (userId, course) => {
    try {
      const updatedUser = {
        assignedCourse: course,
      };
  
      await axiosSecure.patch(`/users/${userId}`, updatedUser);
      refetch();
  
      Swal.fire({
        title: "Assigned!",
        text: "Course assigned successfully.",
        icon: "success",
      });
    } catch (error) {
      console.error('Error assigning course:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
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

  return (
    <div>
      <div className="flex justify-evenly my-4">
        <h2 className="text-3xl font-bold mt-8 mb-5">All Students</h2>
        <h2 className="text-3xl font-bold mt-8 mb-5">Total Students: {users.length}</h2>
      </div>
      <div className="overflow-x-auto min-h-[600px]">
        <table className="table table-zebra w-full">
          {/* head */}
          <thead>
            <tr>
              <th className='text-lg font-semibold text-black '>#</th>
              <th className='text-lg font-semibold text-black '>Image</th>
              <th className='text-lg font-semibold text-black '>Name</th>
              <th className='text-lg font-semibold text-black '>Roll</th>
              <th className='text-lg font-semibold text-black '>Year</th>
              <th className='text-lg font-semibold text-black '>Preferable Course</th>
              <th className='text-lg font-semibold text-black '>Assign Course</th>
              <th className='text-lg font-semibold text-black '>Action</th>
            </tr>
          </thead>
          <tbody className="p-2">
            {currentUsers.map((user, index) => (
              <tr className='text-base text-black ' key={user._id}>
                <td>{index + 1}</td>
                <td className="text-right text-base text-black ">
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-12 h-12">
                                                <img src={user.image} alt="Avatar Tailwind CSS Component" />
                                            </div>
                                        </div>
                                    </div>
                                </td>
                <td>{user.name}</td>
                <td>{user.roll}</td>
                <td>{user.year}</td>
                <td>{user.prefCourse}</td>
                <td>
                  {user.assignedCourse ? (
                    user.assignedCourse 
                  ) : (
                    <div className="join">
                      <select 
                        className="select select-bordered join-item" 
                        value={selectedCourse} 
                        onChange={(e) => setSelectedCourse(e.target.value)}
                      >
                        <option disabled value="">Course</option>
                        <option>Basic Programming with Python</option>
                        <option>Database</option>
                        <option>Front End Development</option>
                        <option>Data Visualization with Python</option>
                      </select>
                      <div className="indicator">
                        <button 
                          className="btn join-item bg-blue-950 text-white"
                          onClick={() => handleAssignCourse(user._id, selectedCourse)}
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="btn btn-ghost btn-lg"
                  >
                    <FaTrashAlt className="text-red-600"></FaTrashAlt>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-4 text-lg font-semibold text-black ">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="mx-4">
          Page {currentPage} of {Math.ceil(users.length / itemsPerPage)}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(users.length / itemsPerPage)))}
          disabled={currentPage === Math.ceil(users.length / itemsPerPage)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AllUser;
