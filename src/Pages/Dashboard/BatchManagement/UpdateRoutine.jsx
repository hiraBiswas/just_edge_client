import React, { useState, useEffect, useCallback } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

// Helper: Convert time string to minutes for easier comparison
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr?.split(":")?.map(Number) || [0, 0];
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

const UpdateRoutine = ({
  batchId,
  closeModal,
  routines: propRoutines,
  onRoutineUpdate,
}) => {
  const [routines, setRoutines] = useState([]);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [batchData, setBatchData] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [users, setUsers] = useState([]);
  const [validationMessages, setValidationMessages] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  
  const axiosSecure = useAxiosSecure();

  const daysOfWeek = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  // Get instructor name by userId
  const getInstructorName = (userId) => {
    const user = users.find((u) => u._id === userId);
    return user ? user.name : "Unknown Instructor";
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoadingFetch(true);
      try {
        // Fetch routine data
        const routineResponse = await axiosSecure.get(`/routine/${batchId}`);
        let routinesData = Array.isArray(routineResponse.data) 
          ? routineResponse.data 
          : routineResponse.data?.schedule || [];
        
        if (routinesData.length === 0) {
          routinesData = [{ day: "", startTime: "", endTime: "" }];
        }
  
        // Fetch batch data
        const batchResponse = await axiosSecure.get(`/batches/${batchId}`);
        setBatchData(batchResponse.data);
  
        // Fetch users data
        const usersResponse = await axiosSecure.get("/users");
        setUsers(usersResponse.data);
  
        // Fetch instructors if any
        if (batchResponse.data.instructorIds?.length > 0) {
          const instructorPromises = batchResponse.data.instructorIds.map(id => 
            axiosSecure.get(`/instructors/${id}`)
              .then(res => res.data)
              .catch(err => {
                console.error(`Error fetching instructor ${id}:`, err);
                return null;
              })
          );
  
          const instructorsData = await Promise.all(instructorPromises);
          const instructorsWithNames = instructorsData
            .filter(instructor => instructor !== null)
            .map(instructor => ({
              ...instructor,
              name: getInstructorName(instructor.userId),
            }));
  
          setInstructors(instructorsWithNames);
        }
  
        setRoutines(routinesData);
      } catch (error) {
        setValidationMessages(["Failed to fetch initial data"]);
      } finally {
        setLoadingFetch(false);
      }
    };
  
    if (batchId) fetchData();
  }, [batchId, axiosSecure]);

  // Validate all routines and instructor availability
  const validateAll = useCallback(async () => {
    const newFieldErrors = {};
    const messages = [];
    let hasErrors = false;

    // 1. Validate each routine's fields
    routines.forEach((routine, index) => {
      const fieldKey = `routine-${index}`;
      newFieldErrors[fieldKey] = {};

      if (!routine.day) {
        newFieldErrors[fieldKey].day = "Day is required";
        messages.push(`Day ${index + 1}: Day is required`);
        hasErrors = true;
      }

      if (!routine.startTime) {
        newFieldErrors[fieldKey].startTime = "Start time is required";
        messages.push(`Day ${index + 1}: Start time is required`);
        hasErrors = true;
      }

      if (!routine.endTime) {
        newFieldErrors[fieldKey].endTime = "End time is required";
        messages.push(`Day ${index + 1}: End time is required`);
        hasErrors = true;
      }

      if (routine.startTime && routine.endTime && 
          timeToMinutes(routine.endTime) <= timeToMinutes(routine.startTime)) {
        newFieldErrors[fieldKey].endTime = "End time must be after start time";
        messages.push(`Day ${index + 1}: End time must be after start time`);
        hasErrors = true;
      }
    });

    // 2. Check for duplicate days
    const days = routines.map((r) => r.day).filter(Boolean);
    const uniqueDays = new Set(days);
    if (uniqueDays.size !== days.length) {
      messages.push("Cannot have multiple classes on the same day");
      hasErrors = true;
    }

    setFieldErrors(newFieldErrors);

    // 3. Only check instructor conflicts if basic validation passes
    if (!hasErrors && instructors.length > 0) {
      try {
        for (const instructor of instructors) {
          const response = await axiosSecure.get(`/instructors/${instructor._id}/classes`);
          const instructorSchedule = response.data.schedule || {};
          const classCounts = response.data.classCounts || {};

          for (const routine of routines) {
            if (!routine.day || !routine.startTime || !routine.endTime) continue;

            // Check max classes per day (2)
            const currentCount = (instructorSchedule[routine.day] || [])
              .filter(cls => cls.batchId !== batchId).length;
            const newCount = routines.filter(r => r.day === routine.day).length;
            
            if (currentCount + newCount > 2) {
              messages.push(
                `${instructor.name} already has maximum classes (2) on ${routine.day}`
              );
              hasErrors = true;
            }

            // Check time conflicts
            const existingClasses = (instructorSchedule[routine.day] || [])
              .filter(cls => cls.batchId !== batchId);

            for (const existingClass of existingClasses) {
              if (hasTimeOverlap(
                routine.startTime,
                routine.endTime,
                existingClass.startTime,
                existingClass.endTime
              )) {
                messages.push(
                  `${instructor.name} has time conflict on ${routine.day}: ` +
                  `Existing class at ${existingClass.startTime}-${existingClass.endTime} ` +
                  `conflicts with ${routine.startTime}-${routine.endTime}`
                );
                hasErrors = true;
              }
            }
          }
        }
      } catch (error) {
        messages.push("Failed to validate instructor availability");
        hasErrors = true;
      }
    }

    setValidationMessages(messages);
    return !hasErrors;
  }, [routines, instructors, batchId, axiosSecure]);

  // Real-time validation effect
  useEffect(() => {
    if (routines.length > 0) {
      const timer = setTimeout(() => {
        validateAll();
      }, 500); // Debounce validation

      return () => clearTimeout(timer);
    }
  }, [routines, instructors, validateAll]);

  // Handle field changes
  const handleChange = (index, field, value) => {
    const updatedRoutines = [...routines];
    updatedRoutines[index][field] = value;
    setRoutines(updatedRoutines);

    // Clear specific field error immediately
    setFieldErrors(prev => ({
      ...prev,
      [`routine-${index}`]: {
        ...prev[`routine-${index}`],
        [field]: ''
      }
    }));
  };

  // Add new routine
  const handleAddRoutine = () => {
    setRoutines([...routines, { day: "", startTime: "", endTime: "" }]);
  };

  // Delete routine
  const handleDeleteRoutine = async (index) => {
    const routineToDelete = routines[index];
    
    if (!routineToDelete._id) {
      const updatedRoutines = [...routines];
      updatedRoutines.splice(index, 1);
      setRoutines(updatedRoutines);
      return;
    }
  
    try {
      setLoadingSubmit(true);
      await axiosSecure.delete(`/routine/${routineToDelete._id}`);
      const updatedRoutines = [...routines];
      updatedRoutines.splice(index, 1);
      setRoutines(updatedRoutines);
    } catch (error) {
      setValidationMessages(["Failed to delete routine"]);
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      const isValid = await validateAll();
      if (!isValid) {
        setLoadingSubmit(false);
        return;
      }

      const preparedRoutines = routines.map((routine) => ({
        ...(routine._id && { _id: routine._id }),
        batchId,
        day: routine.day,
        startTime: routine.startTime,
        endTime: routine.endTime,
      }));

      const response = await axiosSecure.put(
        `/routine/${batchId}`,
        preparedRoutines
      );

      if (response.status === 200) {
        onRoutineUpdate(preparedRoutines);
        closeModal();
      } else {
        setValidationMessages(["Failed to update routine"]);
      }
    } catch (error) {
      setValidationMessages([
        error.response?.data?.message || "Error updating routine"
      ]);
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingFetch) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <span className="loading loading-ring loading-lg text-white"></span>
      </div>
    );
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

      {/* Combined error display */}
      {validationMessages.length > 0 && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
       
          <ul className="list-disc pl-5">
            {validationMessages.map((message, index) => (
              <li key={index} className="text-sm mb-1 last:mb-0">
                {message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Routine entries */}
      {routines.map((routine, index) => {
        const fieldKey = `routine-${index}`;
        const errors = fieldErrors[fieldKey] || {};

        return (
          <div key={routine._id || index} className="mb-4 flex items-center gap-4">
            <div className="grid grid-cols-3 gap-4 grow">
              {/* Day selection */}
              <div>
                <label htmlFor={`day-${index}`} className="block text-sm font-medium">
                  Day {index + 1}
                </label>
                <select
                  id={`day-${index}`}
                  value={routine.day}
                  onChange={(e) => handleChange(index, "day", e.target.value)}
                  className={`mt-1 p-2 border rounded-sm w-full ${
                    errors.day ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select a day</option>
                  {daysOfWeek.map((day) => (
                    <option
                      key={day}
                      value={day}
                      disabled={routines.some((r, i) => i !== index && r.day === day)}
                    >
                      {day}
                    </option>
                  ))}
                </select>
         
              </div>

              {/* Start time */}
              <div>
                <label htmlFor={`startTime-${index}`} className="block text-sm font-medium">
                  Start Time
                </label>
                <input
                  type="time"
                  id={`startTime-${index}`}
                  value={routine.startTime}
                  onChange={(e) => handleChange(index, "startTime", e.target.value)}
                  className={`mt-1 p-2 border rounded-sm w-full ${
                    errors.startTime ? "border-red-500" : "border-gray-300"
                  }`}
                />
            
              </div>

              {/* End time */}
              <div>
                <label htmlFor={`endTime-${index}`} className="block text-sm font-medium">
                  End Time
                </label>
                <input
                  type="time"
                  id={`endTime-${index}`}
                  value={routine.endTime}
                  onChange={(e) => handleChange(index, "endTime", e.target.value)}
                  className={`mt-1 p-2 border rounded-sm w-full ${
                    errors.endTime ? "border-red-500" : "border-gray-300"
                  }`}
                  min={routine.startTime}
                />
            
              </div>
            </div>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => handleDeleteRoutine(index)}
              className="text-black font-medium pt-3 hover:text-red-800"
              title="Remove this schedule"
              disabled={loadingSubmit}
            >
              X
            </button>
          </div>
        );
      })}

      {/* Submit button */}
      <div className="flex justify-center mt-6">
        <button
          type="submit"
          className={`btn flex items-center gap-2 bg-blue-950 text-white ${
            loadingSubmit ? "cursor-not-allowed opacity-70" : ""
          }`}
          disabled={loadingSubmit || validationMessages.length > 0}
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
    </form>
  );
};

export default UpdateRoutine;