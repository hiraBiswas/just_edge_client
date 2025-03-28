import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast";

const UpdateRoutine = ({ batchId, closeModal, onRoutineUpdate }) => {
  const [routines, setRoutines] = useState([]); 
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState(null);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchRoutine = async () => {
      setLoadingFetch(true);
      setError(null);
      try {
        const response = await axiosSecure.get(`/routine/${batchId}`);
        // Directly set the response data as routines
        setRoutines(response.data || []);
      } catch (err) {
        setError(err.message);
        toast.error("Failed to fetch routine data");
      } finally {
        setLoadingFetch(false);
      }
    };

    if (batchId) {
      fetchRoutine();
    }
  }, [batchId, axiosSecure]);

  // Handle individual routine entry change with validation
  const handleChange = (index, field, value) => {
    const updatedRoutines = [...routines];

    // Validate day uniqueness
    if (field === "day" && updatedRoutines.some((entry, i) => entry.day === value && i !== index)) {
      toast.error("A class already exists on this day.");
      return;
    }

    // Validate end time is after start time
    if (field === "endTime" && value < updatedRoutines[index].startTime) {
      toast.error("End time must be after the start time.");
      return;
    }

    updatedRoutines[index][field] = value;
    setRoutines(updatedRoutines);
  };

  // Add a new routine entry
  const handleAddRoutine = () => {
    setRoutines([...routines, { 
      batchId: batchId,
      day: "", 
      startTime: "", 
      endTime: "",
      createdAt: new Date().toISOString()
    }]);
  };

  // Delete a routine entry
  const handleDeleteRoutine = (index) => {
    const updatedRoutines = routines.filter((_, i) => i !== index);
    setRoutines(updatedRoutines);
  };

  // Submit updated routine data
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // More robust validation
    const isValid = routines.every(routine => 
      routine.day && routine.startTime && routine.endTime
    );
  
    if (!isValid) {
      toast.error("Please fill in all fields for each routine entry.");
      return;
    }
  
    try {
      setLoadingSubmit(true);
      
      // Prepare routines, ensuring all have necessary fields
      const preparedRoutines = routines.map(routine => ({
        ...(routine._id ? { _id: routine._id } : {}),
        batchId: batchId,
        day: routine.day,
        startTime: routine.startTime,
        endTime: routine.endTime,
        createdAt: routine.createdAt || new Date().toISOString()
      }));
  
      const response = await axiosSecure.put(`/routine/${batchId}`, preparedRoutines);
  
      if (response.status === 200) {
        // Use the callback to update parent component
        onRoutineUpdate(preparedRoutines);
        toast.success("Routine updated successfully!");
        closeModal();
      } else {
        toast.error("Failed to update routine.");
      }
    } catch (error) {
      toast.error("Error updating routine.");
      console.error(error);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const daysOfWeek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

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
        <h3 className="text-center font-semibold text-black text-xl">Update Batch Routine</h3>
        <button
          type="button"
          onClick={handleAddRoutine}
          className="btn btn-outline border-2 border-blue-950 text-black"
        >
          Add Another Day
        </button>
      </div>

      {routines.map((routine, index) => (
        <div key={routine._id || index} className="mb-4 flex items-center gap-4">
          <div className="grid grid-cols-3 gap-4 grow">
            <div>
              <label htmlFor={`day-${index}`} className="block text-sm font-medium">
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
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`startTime-${index}`} className="block text-sm font-medium">
                Start Time
              </label>
              <input
                type="time"
                id={`startTime-${index}`}
                value={routine.startTime}
                onChange={(e) => handleChange(index, "startTime", e.target.value)}
                className="mt-1 p-2 border border-gray-300 rounded-sm w-full"
                required
              />
            </div>

            <div>
              <label htmlFor={`endTime-${index}`} className="block text-sm font-medium">
                End Time
              </label>
              <input
                type="time"
                id={`endTime-${index}`}
                value={routine.endTime}
                onChange={(e) => handleChange(index, "endTime", e.target.value)}
                className="mt-1 p-2 border border-gray-300 rounded-sm w-full"
                required
              />
            </div>
          </div>

          {/* Delete button */}
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

      <div className="flex justify-center">
        <button
          type="submit"
          className={`btn flex items-center gap-2 bg-blue-950 text-white ${loadingSubmit ? "cursor-not-allowed opacity-70" : ""}`}
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