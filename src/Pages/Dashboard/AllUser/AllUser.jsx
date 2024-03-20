import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { FaTrashAlt, FaUsers } from "react-icons/fa";
// import Swal from "sweetalert2";

const AllUser = () => {
  const axiosSecure = useAxiosSecure();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const { data: users = [], refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axiosSecure.get('/users');
      // Filter users by type === 'user'
      const filteredUsers = res.data.filter(user => user.type === 'user');
      return filteredUsers;
    }
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

//   const handleMakeAdmin = (user) => {
//     axiosSecure.patch(`/users/admin/${user._id}`).then((res) => {
//       console.log(res.data);
//       if (res.data.modifiedCount > 0) {
//         refetch();
//         Swal.fire({
//           position: "top-end",
//           icon: "success",
//           title: `${user.name} is an Admin Now!`,
//           showConfirmButton: false,
//           timer: 1500,
//         });
//       }
//     });
//   };

//   const handleDeleteUser = (user) => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "You won't be able to revert this!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Yes, delete it!",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         axiosSecure.delete(`/users/${user._id}`).then((res) => {
//           if (res.data.deletedCount > 0) {
//             refetch();
//             Swal.fire({
//               title: "Deleted!",
//               text: "Your file has been deleted.",
//               icon: "success",
//             });
//           }
//         });
//       }
//     });
//   };

  return (
    <div>
      <div className="flex justify-evenly my-4">
        <h2 className="text-3xl font-bold mt-8 mb-5">All Users</h2>
        <h2 className="text-3xl font-bold mt-8 mb-5">Total Users: {users.length}</h2>
      </div>
      <div className="overflow-x-auto min-h-[600px]">
        <table className="table table-zebra w-full">
          {/* head */}
          <thead>
            <tr>
              <th className='text-lg font-semibold text-black '>#</th>
              <th className='text-lg font-semibold text-black '>Name</th>
              <th className='text-lg font-semibold text-black '>Email</th>
              <th className='text-lg font-semibold text-black '>Role</th>
              <th className='text-lg font-semibold text-black '>Action</th>
            </tr>
          </thead>
          <tbody className="p-2">
            {currentUsers.map((user, index) => (
              <tr className='text-base text-black ' key={user._id}>
                <td>{index + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td className="p-2">
                  {user.type === "admin" ? (
                    'Admin'
                  ) : (
                    <button
                    //   onClick={() => handleMakeAdmin(user)}
                      className="bg-none flex gap-2 justify-center items-center"
                    >
                      User
                      <FaUsers
                        className="text-orange-500 text-lg"
                      ></FaUsers>
                    </button>
                  )}
                </td>
                <td>
                  <button
                    // onClick={() => handleDeleteUser(user)}
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
