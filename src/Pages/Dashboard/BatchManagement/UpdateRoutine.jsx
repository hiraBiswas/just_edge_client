import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure"; // Import custom hook for secure axios instance
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdateRoutine = ({ batchId, closeModal, fetchRoutines }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false); // Local loader for the update button
  const [error, setError] = useState(null);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchRoutine = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosSecure.get(`/routine/${batchId}`);
        setSchedule(response.data.schedule || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
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
      setLoading(true); // Show loading spinner on the form submit
      const response = await axiosSecure.patch(`/routine/${batchId}`, updatedRoutineData);

      if (response.status === 200) {
        toast.success("Routine updated successfully!");
        closeModal(); // Close modal
        fetchRoutines(); // Refresh routine data after update
      } else {
        toast.error("Failed to update routine");
      }
    } catch (error) {
      toast.error("Error updating routine");
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

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
        <button type="submit" className="btn bg-blue-950 text-white" disabled={loading}>
          {loading ? "Updating..." : "Update Routine"}
        </button>
      </div>

      {/* <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ width: '300px', height: 'auto', margin: '3px' }}
      /> */}
    </form>
  );
};

export default UpdateRoutine;

