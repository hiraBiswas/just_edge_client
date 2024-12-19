import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { toast } from "react-hot-toast"; // Importing toast from react-hot-toast
import { Toaster } from "react-hot-toast"; // Import Toaster to show the toasts
import { toast as parentToast } from "react-toastify";

const UpdateRoutine = ({ batchId, closeModal, fetchRoutines }) => {
  const [schedule, setSchedule] = useState([]); // The schedule list
  const [loadingFetch, setLoadingFetch] = useState(false); // Loader for fetching routine
  const [loadingSubmit, setLoadingSubmit] = useState(false); // Loader for submitting update
  const [error, setError] = useState(null);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchRoutine = async () => {
      setLoadingFetch(true);
      setError(null);
      try {
        const response = await axiosSecure.get(`/routine/${batchId}`);
        setSchedule(response.data.schedule || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingFetch(false);
      }
    };

    if (batchId) {
      fetchRoutine();
    }
  }, [batchId, axiosSecure]);

  // Handle individual field change with validation
  const handleChange = (index, field, value) => {
    const updatedSchedule = [...schedule];

    // If the day is being changed, check for duplicates
    if (field === "day" && updatedSchedule.some((entry, i) => entry.day === value && i !== index)) {
      toast.error("Already has class on this day.");
      return;
    }

    // Check if end time is after start time
    if (field === "endTime" && updatedSchedule[index].startTime && value < updatedSchedule[index].startTime) {
      toast.error("End time must be after the start time.");
      return;
    }

    updatedSchedule[index][field] = value;
    setSchedule(updatedSchedule);
  };

  // Handle adding a new schedule field
  const handleAddSchedule = () => {
    setSchedule([...schedule, { day: "", startTime: "", endTime: "" }]);
  };

  // Handle deleting a specific schedule row
  const handleDeleteSchedule = (index) => {
    const updatedSchedule = schedule.filter((_, i) => i !== index);
    setSchedule(updatedSchedule);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedRoutineData = { schedule };

    try {
      setLoadingSubmit(true);
      const response = await axiosSecure.patch(`/routine/${batchId}`, updatedRoutineData);

      if (response.status === 200) {
        parentToast.success("Routine updated successfully!");
        closeModal();
        fetchRoutines();
      } else {
        toast.error("Failed to update routine.");
      }
    } catch (error) {
      toast.error("Error updating routine.");
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
      <div className="flex justify-between items-center">
        <h3 className="text-center font-semibold text-black text-xl">Update Routine</h3>
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={handleAddSchedule}
            className="btn btn-outline border-2 border-blue-950 text-black"
          >
            Add Another Day
          </button>
        </div>
      </div>

      {schedule.map((daySchedule, index) => (
        <div key={index} className="mb-4 flex items-center  gap-4">
          <div className="grid grid-cols-3 gap-4 flex-grow">
            <div>
              <label htmlFor={`day-${index}`} className="block text-sm font-medium">
                Day {index + 1}
              </label>
              <select
                id={`day-${index}`}
                value={daySchedule.day}
                onChange={(e) => handleChange(index, "day", e.target.value)}
                className="mt-1 p-2 border border-gray-300 rounded w-full"
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
                value={daySchedule.startTime}
                onChange={(e) => handleChange(index, "startTime", e.target.value)}
                className="mt-1 p-2 border border-gray-300 rounded w-full"
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
                value={daySchedule.endTime}
                onChange={(e) => handleChange(index, "endTime", e.target.value)}
                className="mt-1 p-2 border border-gray-300 rounded w-full"
                required
              />
            </div>
          </div>

          {/* Delete button */}
          <button
            type="button"
            onClick={() => handleDeleteSchedule(index)}
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
