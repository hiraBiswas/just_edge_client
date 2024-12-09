import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdateRoutine = ({ batchId, closeModal, fetchRoutines }) => {
  const [schedule, setSchedule] = useState([]);
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

  const handleChange = (index, field, value) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index][field] = value;
    setSchedule(updatedSchedule);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedRoutineData = { schedule };

    try {
      setLoadingSubmit(true); // Show loader on submit button
      const response = await axiosSecure.patch(`/routine/${batchId}`, updatedRoutineData);

      if (response.status === 200) {
        toast.success("Routine updated successfully!");
        closeModal(); // Close modal
        fetchRoutines(); // Refresh routine data
      } else {
        toast.error("Failed to update routine");
      }
    } catch (error) {
      toast.error("Error updating routine");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const daysOfWeek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Show loader over the entire modal when fetching data
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
      <h3 className="text-center font-semibold text-black text-xl">Update Routine</h3>

      {schedule.map((daySchedule, index) => (
        <div key={index} className="mb-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor={`day-${index}`} className="block text-sm font-medium">Day {index + 1}</label>
              <select
                id={`day-${index}`}
                value={daySchedule.day}
                onChange={(e) => handleChange(index, "day", e.target.value)}
                className="mt-1 p-2 border border-gray-300 rounded"
                required
              >
                <option value="">Select a day</option>
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`startTime-${index}`} className="block text-sm font-medium">Start Time</label>
              <input
                type="time"
                id={`startTime-${index}`}
                value={daySchedule.startTime}
                onChange={(e) => handleChange(index, "startTime", e.target.value)}
                className="mt-1 p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div>
              <label htmlFor={`endTime-${index}`} className="block text-sm font-medium">End Time</label>
              <input
                type="time"
                id={`endTime-${index}`}
                value={daySchedule.endTime}
                onChange={(e) => handleChange(index, "endTime", e.target.value)}
                className="mt-1 p-2 border border-gray-300 rounded"
                required
              />
            </div>
          </div>
        </div>
      ))}
<div className="flex justify-center">
  <button
    type="submit"
    className={`btn flex items-center gap-2 bg-blue-950 text-white ${
      loadingSubmit ? "cursor-not-allowed opacity-70" : ""
    }`}
    onClick={!loadingSubmit ? handleSubmit : null}
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
