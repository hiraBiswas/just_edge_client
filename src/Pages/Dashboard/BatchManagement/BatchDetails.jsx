import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useAxiosSecure from "./../../../hooks/useAxiosSecure";
import CreateRoutine from "./CreateRoutine";
import UpdateRoutine from "./UpdateRoutine";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-hot-toast";

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
  const [onlineProfiles, setOnlineProfiles] = useState([]);
  const axiosSecure = useAxiosSecure();

  const dayOrder = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  const fetchRoutines = async () => {
    setRoutineLoading(true);
    try {
      const routineResponse = await axiosSecure.get(`/routine/${batchId}`);
      if (routineResponse.data) {
        const routinesData =
          routineResponse.data.schedule || routineResponse.data;
        setRoutines(Array.isArray(routinesData) ? routinesData : []);
      } else {
        setRoutines([]);
      }
    } catch (error) {
      console.error("Error fetching routine:", error);
      setRoutines([]);
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
          onlineProfilesResponse,
        ] = await Promise.all([
          axiosSecure.get("/students"),
          axiosSecure.get("/users"),
          axiosSecure.get(`/batches/${batchId}`),
          axiosSecure.get(`/routine/${batchId}`),
          axiosSecure.get("/instructors"),
          axiosSecure.get("/instructors-batches"),
          axiosSecure.get("/onlineProfile"),
        ]);

        setStudents(studentsResponse.data);
        setUsers(usersResponse.data);
        setBatch(batchResponse.data);
        setRoutines(routineResponse.data);
        setInstructorBatches(instructorsBatchesResponse.data);
        setInstructors(instructorsResponse.data);
        setOnlineProfiles(onlineProfilesResponse.data); 

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

    // Add this helper function to check if student has online profile
    const hasOnlineProfile = (studentId) => {
      return onlineProfiles.some(profile => profile.studentId === studentId);
    };
  
    // Add this helper function to check if student has passport photo
    const hasPassportPhoto = (student) => {
      return student.passportPhoto && student.passportPhoto !== "";
    };
  
  

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

  const filteredInstructorBatches = instructorBatches.filter(
    (instructorBatch) => instructorBatch.batchId === batchId
  );

  const getUserName = (userId) => {
    const user = Array.isArray(users)
      ? users.find((user) => user._id === userId)
      : null;
    return user ? user.name : "N/A";
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

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

  const handleAssignInstructor = async (instructorId) => {
    try {
      const response = await axiosSecure.post("/instructors-batches", {
        instructorId,
        batchId,
      });

      if (response.data) {
        // Refresh the instructor list
        const instructorsBatchesResponse = await axiosSecure.get(
          "/instructors-batches"
        );
        setInstructorBatches(instructorsBatchesResponse.data);
        toast.success("Instructor assigned successfully");
        document.getElementById("assign_instructor_modal").close();
      }
    } catch (error) {
      console.error("Error assigning instructor:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to assign instructor to batch"
      );
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

  // Get available instructors (not already assigned to this batch)
  const availableInstructors = instructors.filter((instructor) => {
    return !instructorBatches.some(
      (ib) =>
        ib.instructorId === instructor._id && ib.batchId === batchId
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-ring loading-lg"></span>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="text-center text-gray-500 py-10">
        Batch not found or data unavailable.
      </div>
    );
  }

  return (
    <div className="w-[1100px] mx-auto p-4">
      {/* Breadcrumb Navigation */}
      <nav className="mb-3">
        <ol className="flex items-center space-x-2 font-semibold text-lg">
          <li>
            <Link to="/dashboard" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              to="/dashboard/batchManagement"
              className="text-blue-600 hover:underline"
            >
              Batch Management
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-600">{batch.batchName || "Batch Details"}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {batch.batchName}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Total Seats:</span> {batch.seat}
          </div>
          <div>
            <span className="font-medium">Enrolled:</span> {batch.occupiedSeat}
          </div>
          <div>
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                batch.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {batch.status}
            </span>
          </div>
        </div>
      </div>

      {/* Instructors Section */}
      <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Assigned Instructors
            </h2>
            <button
              onClick={() =>
                document.getElementById("assign_instructor_modal").showModal()
              }
              className="btn btn-sm btn-primary"
              disabled={availableInstructors.length === 0}
              title={
                availableInstructors.length === 0
                  ? "No available instructors to assign"
                  : "Assign Instructor"
              }
            >
              Assign Instructor
            </button>
          </div>
          {filteredInstructorBatches && filteredInstructorBatches.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-3 px-4 font-medium text-md text-black text-left">
                      Instructor
                    </th>
                    <th className="py-3 px-4 font-medium text-black text-md  text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInstructorBatches.map((instructorBatch) => {
                    const instructorName = getInstructorNames(
                      instructorBatch.instructorId
                    );
                    return (
                      <tr
                        key={instructorBatch._id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 text-md text-black px-4">
                          {instructorName}
                        </td>
                        <td className="py-3 text-md text-black  px-4 text-right">
                          <button
                            className="btn btn-sm btn-error text-white"
                            onClick={() =>
                              handleDeleteInstructor(instructorBatch._id)
                            }
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-600">
              No instructors assigned to this batch yet.
            </div>
          )}
        </div>
      </section>

      {/* Assign Instructor Modal */}
      <dialog id="assign_instructor_modal" className="modal">
        <div className="modal-box">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Assign Instructor</h3>
            <button
              onClick={() =>
                document.getElementById("assign_instructor_modal").close()
              }
              className="btn btn-sm btn-circle"
            >
              <RxCross2 />
            </button>
          </div>
          {availableInstructors.length > 0 ? (
            <div>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Select Instructor</span>
                </label>
                <select
                  id="instructorSelect"
                  className="select select-bordered w-full"
                >
                  {availableInstructors.map((instructor) => {
                    const user = users.find(
                      (u) => u._id === instructor.userId
                    );
                    return (
                      <option
                        key={instructor._id}
                        value={instructor._id}
                      >
                        {user ? user.name : "Unknown Instructor"}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="modal-action">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const select = document.getElementById("instructorSelect");
                    const instructorId = select.value;
                    handleAssignInstructor(instructorId);
                  }}
                >
                  Assign
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p>No available instructors to assign.</p>
            </div>
          )}
        </div>
      </dialog>

      {/* Routine Section */}
      <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center p-6 pb-0">
          <h2 className="text-lg font-semibold text-black">Class Routine</h2>
          {routineLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : sortedRoutines.length > 0 ? (
            <button
              onClick={() =>
                document.getElementById("update_routine_modal").showModal()
              }
              className="btn btn-sm btn-primary"
            >
              Update Routine
            </button>
          ) : (
            <button
              onClick={() =>
                document.getElementById("create_routine_modal").showModal()
              }
              className={`btn btn-sm btn-primary ${
                filteredInstructorBatches.length === 0
                  ? "btn-disabled cursor-not-allowed"
                  : ""
              }`}
              disabled={filteredInstructorBatches.length === 0}
              title={
                filteredInstructorBatches.length === 0
                  ? "Please assign an instructor first"
                  : "Create Routine"
              }
            >
              Create Routine
            </button>
          )}
        </div>

        {routineLoading ? (
          <div className="flex justify-center items-center p-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : sortedRoutines.length > 0 ? (
          <div className="overflow-x-auto p-6 pt-2">
            <table className="table w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 font-medium text-black text-left">
                    Day
                  </th>
                  <th className="py-3 px-4 font-medium text-black text-left">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRoutines.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-black">{item.day}</td>
                    <td className="py-3 text-black px-4">
                      {formatTime(item.startTime)} - {formatTime(item.endTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-6 text-gray-500">
            No schedule has been created for this batch yet.
          </div>
        )}
      </section>

    {/* Students Section */}
    <section className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Enrolled Students
            </h2>
            {batch.occupiedSeat > 0 && (
              <span className="text-sm text-gray-600">
                Total: {batch.occupiedSeat}
              </span>
            )}
          </div>
          {filteredStudents && filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="max-h-[500px] overflow-y-auto relative">
                <table className="table w-full">
                  <thead className="sticky top-0 bg-gray-50 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 font-medium text-black text-center w-12">
                        #
                      </th>
                      <th className="py-3 px-4 font-medium text-black text-left min-w-[150px]">
                        Name
                      </th>
                      <th className="py-3 px-4 font-medium text-black text-left min-w-[120px]">
                        Student ID
                      </th>
                      <th className="py-3 px-4 font-medium text-black text-left min-w-[180px]">
                        Department
                      </th>
                      <th className="py-3 px-4 font-medium text-black text-center min-w-[120px]">
                        Online Profile
                      </th>
                      <th className="py-3 px-4 font-medium text-black text-center min-w-[120px]">
                        Document
                      </th>
                   
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <tr
                        key={student._id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-center">{index + 1}</td>
                        <td className="py-3 px-4">
                          {getUserName(student.userId)}
                        </td>
                        <td className="py-3 px-4">{student.studentID}</td>
                        <td className="py-3 px-4">{student.department}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              hasOnlineProfile(student._id)
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {hasOnlineProfile(student._id) ? "Uploaded" : "Not Uploaded"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              hasPassportPhoto(student)
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {hasPassportPhoto(student) ? "Uploaded" : "Not Uploaded"}
                          </span>
                        </td>
                        
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No students enrolled in this batch yet.
            </div>
          )}
        </div>
      </section>


      {/* Create Routine Modal */}
      <dialog
        id="create_routine_modal"
        className="modal"
        style={{ zIndex: 9999 }}
      >
        <div className="modal-box relative">
          <button
            onClick={() =>
              document.getElementById("create_routine_modal").close()
            }
            className="absolute top-2 right-2"
          >
            <RxCross2 />
          </button>
          <CreateRoutine
            batchId={batchId}
            closeModal={() => {
              document.getElementById("create_routine_modal").close();
            }}
            onSuccess={() => {
              fetchRoutines(); // Explicitly refresh after success
            }}
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
            routines={sortedRoutines} 
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
    </div>
  );
};

export default BatchDetails;