import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useAxiosSecure from "./../../../hooks/useAxiosSecure"; // Import your custom hook for axios
import CreateRoutine from './CreateRoutine'; // Import your CreateRoutine component
import UpdateRoutine from './UpdateRoutine'; // Import your UpdateRoutine component
import { RxCross2 } from "react-icons/rx"; // Import the cross icon

const BatchDetails = () => {
  const { id: batchId } = useParams(); // Get batch ID from URL params
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [batch, setBatch] = useState(null); // Store batch data
  const [users, setUsers] = useState([]); // Store users data
  const [loading, setLoading] = useState(true);
  const [routine, setRoutine] = useState(null); // Store routine data for the batch

  const axiosSecure = useAxiosSecure(); // Get the axios instance with secure headers

  // Custom order for days starting from Saturday
  const dayOrder = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Fetch data
  const fetchRoutines = async () => {
    try {
      const routineResponse = await axiosSecure.get(`/routine/${batchId}`);
      console.log(routineResponse.data);  // Log response to ensure it's correct
      if (routineResponse.data && routineResponse.data.schedule) {
        setRoutine(routineResponse.data);  // Set state with the routine data
      } else {
        console.error('Routine data not found');
        setRoutine(null);
      }
    } catch (error) {
      console.error('Error fetching routine:', error);
      setRoutine(null);
    }
    
  };
  

  useEffect(() => {
    const fetchData = async () => {
      if (batch && users.length > 0 && routine) return;  // Prevent refetch if data already exists
  
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
  
        // Check if routine exists
        await fetchRoutines(); // Call fetchRoutines to fetch routine data
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Stop loading spinner
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

  // Format the time in 12-hour format with AM/PM
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Sort the routine schedule based on the custom day order
  const sortedSchedule = routine ? routine.schedule.sort((a, b) => {
    return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
  }) : [];

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
            Batch Details
          </li>
          <li className="text-gray-700 text-xl font-medium">
            {batch.batchName || "Batch Details"}
          </li>
        </ul>
      </div>
  

      {/* Section for Routine Display and Options */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-xl">Current Routine</h3>
          {/* Update Routine Button or Create Routine Button */}
          {routine ? (
            <button
              onClick={() => document.getElementById("update_routine_modal").showModal()}
              className="px-4 py-2 bg-blue-950 text-white rounded-lg hover:bg-blue-900"
            >
              Update Routine
            </button>
          ) : (
            <button
              onClick={() => document.getElementById("create_routine_modal").showModal()}
              className="px-4 py-2 bg-blue-950 text-white rounded-lg hover:bg-blue-900"
            >
              Create Routine
            </button>
          )}
        </div>
        {routine ? (
          <div className="rounded-lg p-4 mb-4">
            <table className="table-auto w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">Day</th>
                  <th className="border border-gray-300 px-4 py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {sortedSchedule.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">{item.day}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {formatTime(item.startTime)} - {formatTime(item.endTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border rounded-lg p-4 mb-4 text-gray-500">
            No routine has been created for this batch yet.
          </div>
        )}
      </section>

      {/* Section for Enrolled Students */}
      <section>
      {batch.enrolledStudentNumber > 0 && (
        <p className="text-xl mb-4">
          <strong>Total Enrolled Students:</strong> {batch.enrolledStudentNumber}
        </p>
      )}
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
      </section>

      {/* Create Routine Modal */}
      <dialog id="create_routine_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box relative">
          {/* Close Button */}
          <button
            type="button"
            className="absolute top-2 right-2 text-xl"
            onClick={() => document.getElementById("create_routine_modal").close()} // Close modal on click
          >
            <RxCross2 />
          </button>
          
          {/* CreateRoutine Component */}
          <CreateRoutine
            batchId={batchId}
            closeModal={() => {
              document.getElementById("create_routine_modal").close();
              fetchRoutines(); // Refresh routine after creating
            }}
            fetchRoutines={fetchRoutines} // Pass down fetchRoutines
          />
        </div>
      </dialog>

      {/* Update Routine Modal */}
      <dialog id="update_routine_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box relative">
          {/* Close Button */}
          <button
            type="button"
            className="absolute top-2 right-2 text-xl"
            onClick={() => document.getElementById("update_routine_modal").close()} // Close modal on click
          >
            <RxCross2 />
          </button>
          
          {/* UpdateRoutine Component */}
          <UpdateRoutine 
            batchId={batchId} 
            closeModal={() => document.getElementById("update_routine_modal").close()} 
            fetchRoutines={fetchRoutines}  
          />
        </div>
      </dialog>
    </div>
  );
};

export default BatchDetails;