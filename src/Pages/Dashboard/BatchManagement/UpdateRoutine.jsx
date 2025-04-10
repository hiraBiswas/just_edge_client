import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast";

// Helper: Convert time string to minutes for easier comparison
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper: Check if two time ranges overlap
const hasTimeOverlap = (start1, end1, start2, end2) => {
  const start1Mins = timeToMinutes(start1);
  const end1Mins = timeToMinutes(end1);
  const start2Mins = timeToMinutes(start2);
  const end2Mins = timeToMinutes(end2);

  return (
    (start1Mins >= start2Mins && start1Mins < end2Mins) ||
    (end1Mins > start2Mins && end1Mins <= end2Mins) ||
    (start1Mins <= start2Mins && end1Mins >= end2Mins) ||
    (start2Mins <= start1Mins && end2Mins >= end1Mins)
  );
};

const UpdateRoutine = ({ batchId, closeModal, onRoutineUpdate }) => {
  const [routines, setRoutines] = useState([]);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState(null);
  const [batchData, setBatchData] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [users, setUsers] = useState([]);
  const axiosSecure = useAxiosSecure();

  // Function to get instructor name by userId
  const getInstructorName = (userId) => {
    const user = users.find((u) => u._id === userId);
    return user ? user.name : "Unknown Instructor";
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingFetch(true);
      setError(null);
      try {
        // Fetch routine data
        const routineResponse = await axiosSecure.get(`/routine/${batchId}`);
        setRoutines(routineResponse.data || []);

        // Fetch batch data to get assigned instructors
        const batchResponse = await axiosSecure.get(`/batches/${batchId}`);
        setBatchData(batchResponse.data);

        // Fetch all users first
        const usersResponse = await axiosSecure.get("/users");
        setUsers(usersResponse.data);

        // Then fetch instructor details if there are any
        if (batchResponse.data.instructorIds?.length > 0) {
          const instructorsResponse = await axiosSecure.get("/instructors", {
            params: { ids: batchResponse.data.instructorIds.join(",") },
          });

          // Map instructor data with user names
          const instructorsWithNames = instructorsResponse.data.map(
            (instructor) => ({
              ...instructor,
              name: getInstructorName(instructor.userId),
            })
          );

          setInstructors(instructorsWithNames);
        }
      } catch (err) {
        setError(err.message);
        toast.error("Failed to fetch data");
      } finally {
        setLoadingFetch(false);
      }
    };

    if (batchId) {
      fetchData();
    }
  }, [batchId, axiosSecure]);

  // Validate all conditions before allowing changes
  const validateRoutine = async (updatedRoutines) => {
    // 1. Check for duplicate days in the current batch
    const days = updatedRoutines.map((r) => r.day).filter(Boolean);
    const uniqueDays = new Set(days);
    if (uniqueDays.size !== days.length) {
      toast.error("A batch can only have one class per day");
      return false;
    }

    // Skip instructor checks if no instructors assigned
    if (instructors.length === 0) {
      return true;
    }

    try {
      for (const instructor of instructors) {
        const response = await axiosSecure.get(
          `/instructors/${instructor._id}/classes`
        );
        const instructorSchedule = response.data.schedule || {};
        const classCounts = response.data.classCounts || {};

        for (const routine of updatedRoutines) {
          if (!routine.day || !routine.startTime || !routine.endTime) continue;

          // Get existing classes excluding current batch's classes
          const existingClasses = (
            instructorSchedule[routine.day] || []
          ).filter((cls) => cls.batchId !== batchId);

          // Calculate current count excluding current batch's classes
          const currentCount = existingClasses.length;
          const newCount = updatedRoutines.filter(
            (r) => r.day === routine.day
          ).length;

          // Check if instructor would exceed 2 classes on this day
          if (currentCount + newCount > 2) {
            toast.error(
              `${getInstructorName(
                instructor.userId
              )} would have more than 2 classes on ${routine.day}`
            );
            return false;
          }

          // Check for time conflicts with other batches' classes
          for (const existingClass of existingClasses) {
            if (
              hasTimeOverlap(
                routine.startTime,
                routine.endTime,
                existingClass.startTime,
                existingClass.endTime
              )
            ) {
              toast.error(
                `${getInstructorName(
                  instructor.userId
                )} has a time conflict on ${routine.day}: ` +
                  `${existingClass.startTime}-${existingClass.endTime} ` +
                  `conflicts with ${routine.startTime}-${routine.endTime}`
              );
              return false;
            }
          }
        }
      }
      return true;
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Failed to validate schedule");
      return false;
    }
  };

  // Handle individual routine entry change with validation
  const handleChange = async (index, field, value) => {
    const updatedRoutines = [...routines];
    updatedRoutines[index][field] = value;

    // Immediate validation for day uniqueness within the batch
    if (field === "day") {
      const isDuplicate = updatedRoutines.some(
        (r, i) => i !== index && r.day === value && value !== ""
      );
      if (isDuplicate) {
        toast.error("This batch already has a class scheduled for this day");
        return;
      }
    }

    // Validate end time is after start time
    if (
      (field === "startTime" || field === "endTime") &&
      updatedRoutines[index].day &&
      updatedRoutines[index].startTime &&
      updatedRoutines[index].endTime
    ) {
      if (
        timeToMinutes(updatedRoutines[index].endTime) <=
        timeToMinutes(updatedRoutines[index].startTime)
      ) {
        toast.error("End time must be after start time");
        return;
      }
    }

    // Update state first for responsive UI
    setRoutines(updatedRoutines);

    // Perform full validation if all required fields are present
    if (
      updatedRoutines[index].day &&
      updatedRoutines[index].startTime &&
      updatedRoutines[index].endTime
    ) {
      await validateRoutine(updatedRoutines);
    }
  };

  // Add a new routine entry
  const handleAddRoutine = () => {
    setRoutines([
      ...routines,
      {
        batchId: batchId,
        day: "",
        startTime: "",
        endTime: "",
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  // Delete a routine entry
  const handleDeleteRoutine = (index) => {
    const updatedRoutines = routines.filter((_, i) => i !== index);
    setRoutines(updatedRoutines);
  };

  // Submit updated routine data
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    const isValid = routines.every(
      (routine) => routine.day && routine.startTime && routine.endTime
    );

    if (!isValid) {
      toast.error("Please fill in all fields for each routine entry");
      return;
    }

    // Full validation
    const isScheduleValid = await validateRoutine(routines);
    if (!isScheduleValid) {
      return;
    }

    try {
      setLoadingSubmit(true);

      // Prepare routines data
      const preparedRoutines = routines.map((routine) => ({
        ...(routine._id ? { _id: routine._id } : {}),
        batchId: batchId,
        day: routine.day,
        startTime: routine.startTime,
        endTime: routine.endTime,
        createdAt: routine.createdAt || new Date().toISOString(),
      }));

      const response = await axiosSecure.put(
        `/routine/${batchId}`,
        preparedRoutines
      );

      if (response.status === 200) {
        onRoutineUpdate(preparedRoutines);
        toast.success("Routine updated successfully!");
        closeModal();
      } else {
        toast.error("Failed to update routine");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating routine");
      console.error(error);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const daysOfWeek = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  if (loadingFetch) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <span className="loading loading-ring loading-lg text-white"></span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <form className="text-black p-5" onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-center font-semibold text-black text-xl">
          Update Batch Routine
        </h3>
        <button
          type="button"
          onClick={handleAddRoutine}
          className="btn btn-outline border-2 border-blue-950 text-black"
        >
          Add Another Day
        </button>
      </div>

      {routines.map((routine, index) => (
        <div
          key={routine._id || index}
          className="mb-4 flex items-center gap-4"
        >
          <div className="grid grid-cols-3 gap-4 grow">
            <div>
              <label
                htmlFor={`day-${index}`}
                className="block text-sm font-medium"
              >
                Day {index + 1}
              </label>
              <select
                id={`day-${index}`}
                value={routine.day}
                onChange={(e) => handleChange(index, "day", e.target.value)}
                className="mt-1 p-2 border border-gray-300 rounded-sm w-full"
                required
              >
                <option value="">Select a day</option>
                {daysOfWeek.map((day) => (
                  <option
                    key={day}
                    value={day}
                    disabled={routines.some(
                      (r, i) => i !== index && r.day === day
                    )}
                  >
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={`startTime-${index}`}
                className="block text-sm font-medium"
              >
                Start Time
              </label>
              <input
                type="time"
                id={`startTime-${index}`}
                value={routine.startTime}
                onChange={(e) =>
                  handleChange(index, "startTime", e.target.value)
                }
                className="mt-1 p-2 border border-gray-300 rounded-sm w-full"
                required
              />
            </div>

            <div>
              <label
                htmlFor={`endTime-${index}`}
                className="block text-sm font-medium"
              >
                End Time
              </label>
              <input
                type="time"
                id={`endTime-${index}`}
                value={routine.endTime}
                onChange={(e) => handleChange(index, "endTime", e.target.value)}
                className="mt-1 p-2 border border-gray-300 rounded-sm w-full"
                required
                min={routine.startTime}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleDeleteRoutine(index)}
            className="text-black font-medium pt-3 hover:text-red-800"
            title="Remove this schedule"
          >
            X
          </button>
        </div>
      ))}

      <div className="flex justify-center mt-6">
        <button
          type="submit"
          className={`btn flex items-center gap-2 bg-blue-950 text-white ${
            loadingSubmit ? "cursor-not-allowed opacity-70" : ""
          }`}
          disabled={loadingSubmit}
        >
          {loadingSubmit ? (
            <>
              <span>Updating</span>
              <span className="loading loading-ball loading-md"></span>
            </>
          ) : (
            "Update Routine"
          )}
        </button>
      </div>

      <Toaster position="top-center" reverseOrder={false} />
    </form>
  );
};

export default UpdateRoutine;
