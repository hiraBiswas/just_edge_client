import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useAxiosSecure from "./../../../hooks/useAxiosSecure";
import CreateRoutine from "./CreateRoutine";
import UpdateRoutine from "./UpdateRoutine";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast";

const BatchDetails = () => {
  const { id: batchId } = useParams();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [batch, setBatch] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routines, setRoutines] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [instructorBatches, setInstructorBatches] = useState([]);
  const [routineLoading, setRoutineLoading] = useState(false);
  const axiosSecure = useAxiosSecure();

  // Custom order for days starting from Saturday
  const dayOrder = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  // Fetch data
  const fetchRoutines = async () => {
    setRoutineLoading(true);
    try {
      const routineResponse = await axiosSecure.get(`/routine/${batchId}`);
      console.log(routineResponse.data);
      if (routineResponse.data && Array.isArray(routineResponse.data.schedule)) {
        setRoutines(routineResponse.data.schedule);
        toast.success("Routine updated successfully");
      } else {
        console.error("Routine data not found");
        setRoutines([]); // Ensure it's always an array
      }
    } catch (error) {
      console.error("Error fetching routine:", error);
      toast.error("Failed to fetch routine");
      setRoutines([]); // Ensure it's always an array
    } finally {
      setRoutineLoading(false);
    }
  };
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          studentsResponse,
          usersResponse,
          batchResponse,
          routineResponse,
          instructorsResponse,
          instructorsBatchesResponse,
        ] = await Promise.all([
          axiosSecure.get("/students"),
          axiosSecure.get("/users"),
          axiosSecure.get(`/batches/${batchId}`),
          axiosSecure.get(`/routine`, { params: { batchId } }),
          axiosSecure.get("/instructors"),
          axiosSecure.get("/instructors-batches"),
        ]);

        setStudents(studentsResponse.data);
        setUsers(usersResponse.data);
        setBatch(batchResponse.data);
        setRoutines(routineResponse.data);
        setInstructorBatches(instructorsBatchesResponse.data);
        setInstructors(instructorsResponse.data);

        const filtered = studentsResponse.data.filter(
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

  // Function to get instructor's name based on instructorId
  const getInstructorNames = (instructorId) => {
    const instructor = instructors.find(
      (instructor) => instructor._id === instructorId
    );

    if (instructor) {
      const user = users.find((user) => user._id === instructor.userId);
      return user ? user.name : "Unknown Instructor";
    }
    return "Instructor Not Found";
  };

  // Filter instructorBatches for the current batchId
  const filteredInstructorBatches = instructorBatches.filter(
    (instructorBatch) => instructorBatch.batchId === batchId
  );

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
    const user = Array.isArray(users)
      ? users.find((user) => user._id === userId)
      : null;
    return user ? user.name : "N/A";
  };

  // Format the time in 12-hour format with AM/PM
  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Function to handle instructor removal from the batch
  const handleDeleteInstructor = async (instructorBatchId) => {
    try {
      await axiosSecure.delete(`/instructors-batches/${instructorBatchId}`);

      const updatedInstructorBatches = instructorBatches.filter(
        (batch) => batch._id !== instructorBatchId
      );
      setInstructorBatches(updatedInstructorBatches);

      toast.success("Instructor removed from batch successfully");
    } catch (error) {
      console.error("Error deleting instructor:", error);
      toast.error("Failed to remove instructor from batch");
    }
  };

  const handleRoutineUpdate = (updatedRoutines) => {
    if (!Array.isArray(updatedRoutines)) {
      console.error("Updated routines is not an array:", updatedRoutines);
      return;
    }
  
    const organizedRoutines = updatedRoutines.reduce((acc, routine) => {
      acc[routine.day] = routine;
      return acc;
    }, {});
  
    setRoutines(Object.values(organizedRoutines));
    toast.success("Routine updated successfully");
  };
  

  const sortedRoutines = Array.isArray(routines)
  ? Object.values(
      routines.reduce((acc, routine) => {
        if (routine.day && !acc[routine.day]) {
          acc[routine.day] = routine;
        }
        return acc;
      }, {})
    ).sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day))
  : [];



  return (
    <div className="w-[1100px] mx-auto p-6">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumbs text-sm mb-4">
        <ul className="flex space-x-2 text-gray-600">
          <li>
            <Link
              to="/dashboard"
              className="text-blue-900 text-xl font-medium hover:underline"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/batchManagement"
              className="text-blue-900 text-xl font-medium hover:underline"
            >
              Batch Management
            </Link>
          </li>
          <li className="text-gray-700 text-xl font-medium">Batch Details</li>
          <li className="text-gray-700 text-xl font-medium">
            {batch.batchName || "Batch Details"}
          </li>
        </ul>
      </div>

      {/* Section for Routine Display and Options */}

      <section className="mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-semibold">Current Routine</h3>
          {routineLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : sortedRoutines.length > 0 ? (
            <button
              onClick={() =>
                document.getElementById("update_routine_modal").showModal()
              }
              className="btn btn-sm bg-blue-950 text-white rounded-lg hover:bg-blue-900"
            >
              Update Routine
            </button>
          ) : (
            <button
              onClick={() =>
                document.getElementById("create_routine_modal").showModal()
              }
              className="btn btn-sm bg-blue-950 text-white rounded-lg hover:bg-blue-900"
            >
              Create Routine
            </button>
          )}
        </div>

        {routineLoading ? (
          <div className="flex justify-center items-center my-4">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : sortedRoutines.length > 0 ? (
          <div className="rounded-lg mt-2">
            <table className="table-auto w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">Day</th>
                  <th className="border border-gray-300 px-4 py-2">Time</th>
                </tr>
              </thead>
              <tbody>
               
                  {sortedRoutines.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.day}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {formatTime(item.startTime)} -{" "}
                        {formatTime(item.endTime)}
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

      {/* Assigned Instructors Section */}
      <section className="mb-6">
        <h2 className="text-md font-semibold mb-2">Assigned Instructor :</h2>
        {filteredInstructorBatches && filteredInstructorBatches.length > 0 ? (
          <table className="table-auto w-full border-collapse border border-gray-200 mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">
                  Instructor Name
                </th>
                <th className="border border-gray-300 px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstructorBatches.map((instructorBatch) => {
                const instructorName = getInstructorNames(
                  instructorBatch.instructorId
                );
                return (
                  <tr key={instructorBatch._id}>
                    <td className="border border-gray-300 px-4 py-2">
                      {instructorName}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex justify-center">
                        <button
                          className="bg-red-500 text-white btn btn-sm rounded"
                          onClick={() =>
                            handleDeleteInstructor(instructorBatch._id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="border rounded-lg p-4 mb-4 text-gray-500">
            No instructors assigned to this batch yet.
          </div>
        )}
      </section>

      {/* Section for Enrolled Students */}
      <section className="mt-5">
        <h2 className="text-md font-semibold mb-2">Enrolled Students:</h2>
        {batch.enrolledStudentNumber > 0 && (
          <p className="mb-2">
            Total Enrolled Students: {batch.enrolledStudentNumber}
          </p>
        )}
        {filteredStudents && filteredStudents.length > 0 ? (
          <table className="table-auto w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">#</th>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Student ID</th>
                <th className="border border-gray-300 px-4 py-2">Department</th>
                <th className="border border-gray-300 px-4 py-2">
                  Institution
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={student._id}>
                  <td className="border border-gray-300 px-4 py-2">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {getUserName(student.userId) || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.studentID}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.department}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.institution}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="border rounded-lg p-4 mb-4 text-gray-500">
            No students enrolled in this batch yet.
          </div>
        )}
      </section>

      {/* Create Routine Modal */}
      <dialog
        id="create_routine_modal"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box relative">
          {/* Close Button */}
          <button
            type="button"
            className="absolute top-2 right-2 text-xl"
            onClick={() =>
              document.getElementById("create_routine_modal").close()
            }
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
            fetchRoutines={fetchRoutines}
          />
        </div>
      </dialog>

      {/* Update Routine Modal */}
      <dialog
        id="update_routine_modal"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box relative">
          {/* Close Button */}
          <button
            type="button"
            className="absolute top-2 right-2 text-xl"
            onClick={() =>
              document.getElementById("update_routine_modal").close()
            }
          >
            <RxCross2 />
          </button>

          {/* UpdateRoutine Component */}
          <UpdateRoutine
  batchId={batchId}
  closeModal={() => {
    document.getElementById("update_routine_modal").close();
  }}
  onRoutineUpdate={(updatedRoutines) => {
    handleRoutineUpdate(updatedRoutines);
    fetchRoutines(); // Ensure fresh data is fetched after routine update
  }}
/>

        </div>
      </dialog>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default BatchDetails;
