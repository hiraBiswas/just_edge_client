import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useAxiosSecure from "./../../../hooks/useAxiosSecure"; // Import your custom hook for axios
import CreateRoutine from './CreateRoutine'; // Import your CreateRoutine component
import { RxCross2 } from "react-icons/rx"; // Import the cross icon

const BatchDetails = () => {
  const { id: batchId } = useParams(); // Get batch ID from URL params
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [batch, setBatch] = useState(null); // Store batch data
  const [users, setUsers] = useState([]); // Store users data
  const [loading, setLoading] = useState(true);

  const axiosSecure = useAxiosSecure(); // Get the axios instance with secure headers

  // Fetch students, batch, and users data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsResponse = await axiosSecure.get("/students");
        const studentsData = studentsResponse.data;
        setStudents(studentsData);

        const usersResponse = await axiosSecure.get("/users");
        const usersData = usersResponse.data;
        setUsers(Array.isArray(usersData) ? usersData : []);

        const batchResponse = await axiosSecure.get(`/batches/${batchId}`);
        const batchData = batchResponse.data;
        setBatch(batchData);

        const filtered = studentsData.filter(
          (student) => student.enrolled_batch === batchId
        );
        setFilteredStudents(filtered);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [batchId, axiosSecure]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-ring loading-lg"></span>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="text-center text-gray-500">
        Batch not found or data unavailable.
      </div>
    );
  }

  // Function to get user's name based on userId
  const getUserName = (userId) => {
    const user = Array.isArray(users) ? users.find((user) => user._id === userId) : null;
    return user ? user.name : "N/A";
  };

  return (
    <div className="w-[1100px] mx-auto p-6">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumbs text-sm mb-4">
        <ul className="flex space-x-2 text-gray-600">
          <li>
            <Link to="/dashboard" className="text-blue-900 text-xl font-medium hover:underline">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/dashboard/batchManagement" className="text-blue-900 text-xl font-medium hover:underline">
              Batch Management
            </Link>
          </li>
          <li className="text-gray-700 text-xl font-medium">
            Course Details
          </li>
          <li className="text-gray-700 text-xl font-medium">
            {batch.batchName || "Batch Details"}
          </li>
        </ul>
      </div>
  
      {/* Show total enrolled students only if greater than 0 */}
      {batch.enrolledStudentNumber > 0 && (
        <p className="text-xl mb-4">
          <strong>Total Enrolled Students:</strong> {batch.enrolledStudentNumber}
        </p>
      )}

      {/* Button for creating routine */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => document.getElementById("my_modal_5").showModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Routine
        </button>
      </div>

      {filteredStudents.length > 0 ? (
        <table className="table-auto w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">#</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Student ID</th>
              <th className="border border-gray-300 px-4 py-2">Department</th>
              <th className="border border-gray-300 px-4 py-2">Institution</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, index) => (
              <tr key={student._id}>
                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2">{getUserName(student.userId) || "N/A"}</td>
                <td className="border border-gray-300 px-4 py-2">{student.studentID}</td>
                <td className="border border-gray-300 px-4 py-2">{student.department}</td>
                <td className="border border-gray-300 px-4 py-2">{student.institution}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center mt-10 text-xl font-semibold text-gray-500">
          No students enrolled in this batch.
        </div>
      )}

      {/* Create Routine Modal using <dialog> */}
      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box relative">
          {/* Close Button */}
          <button
            type="button"
            className="absolute top-2 right-2 text-xl"
            onClick={() => document.getElementById("my_modal_5").close()} // Close modal on click
          >
            <RxCross2 />
          </button>


          
          {/* Pass batchId to CreateRoutine component */}
          <CreateRoutine batchId={batchId} />
          
          <div className="modal-action">
         
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default BatchDetails;
