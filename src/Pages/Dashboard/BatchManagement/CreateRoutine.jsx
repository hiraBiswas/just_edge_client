import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure"; // Import custom hook for secure axios instance
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateRoutine = ({ batchId, closeModal }) => {
  const [batchName, setBatchName] = useState("");
  const [numDays, setNumDays] = useState(3);
  const [schedule, setSchedule] = useState(
    Array.from({ length: numDays }, () => ({ day: "", startTime: "", endTime: "" }))
  );
  const axiosSecure = useAxiosSecure();

  // Fetch batch data
  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        const response = await axiosSecure.get(`/batches/${batchId}`);
        const batchData = response.data;
        setBatchName(batchData.batchName);
      } catch (error) {
        console.error("Error fetching batch data:", error);
      }
    };

    fetchBatchData();
  }, [batchId, axiosSecure]);

  // Handle change in the number of days
  const handleDaysChange = (event) => {
    const value = parseInt(event.target.value, 10);
    setNumDays(value);
    setSchedule(
      Array.from({ length: value }, () => ({ day: "", startTime: "", endTime: "" })) // Reset the schedule
    );
  };

  // Function to check if the same day is selected in multiple fields
  const isDuplicateDay = (day, index) => {
    return schedule.some((entry, i) => entry.day === day && i !== index);
  };

  //individual input change
  const handleChange = (index, field, value) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index][field] = value;

    // Preventing selecting the same day for more than one input field
    if (field === "day" && isDuplicateDay(value, index)) {
      toast.error("Already has class on this day.");
      return; 
    }

    // Validate end time is not earlier than start time
    if (field === "endTime" && updatedSchedule[index].startTime) {
      const startTime = updatedSchedule[index].startTime;
      if (value < startTime) {
        toast.error("End time must be after the start time.");

        return; 
      }
    }

    setSchedule(updatedSchedule);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const scheduleData = {
      batchId: batchId,
      schedule: schedule,
    };

    try {
      // Sending the data to the backend
      const response = await axiosSecure.post("/routine", scheduleData);

      if (response.status === 201) {
        e.target.reset(); // Clear the form fields after successful submission
        toast.success("Routine saved successfully!"); // Show success toast

        // Close the modal after saving the routine
        closeModal();
      } else {
        // Show error toast if the response status is not 201
        toast.error("Failed to create routine");
      }
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);

      // No modal closing and no toast for errors
      // Just log the error and keep the modal open
    }
  };

  // Days for dropdown selection
  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  return (
    <form className="text-black p-5" onSubmit={handleSubmit}>
      <h3 className="text-center font-semibold text-black text-xl">
        Create Routine 
      </h3>

      {/* Number of days selection */}
      <div className="mb-4 mt-4 flex items-center gap-3">
        <label htmlFor="numDays" className="block text-sm font-medium">
          Number of Days:
        </label>
        <select
          id="numDays"
          value={numDays}
          onChange={handleDaysChange}
          className="mt-1 px-4 py-2 border border-gray-300 rounded"
        >
          <option value="3">3 Days</option>
          <option value="4">4 Days</option>
          <option value="5">5 Days</option>
        </select>
      </div>

      {/* Dynamically Render Input Fields for Each Day */}
      {schedule.map((daySchedule, index) => (
        <div key={index} className="mb-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor={`day-${index}`} className="block text-sm font-medium">
                Day {index + 1}
              </label>
              <select
                id={`day-${index}`}
                value={daySchedule.day}
                onChange={(e) => handleChange(index, "day", e.target.value)}
                className="mt-1 p-2 border border-gray-300 rounded"
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
                className="mt-1 p-2 border border-gray-300 rounded"
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
                className="mt-1 p-2 border border-gray-300 rounded"
                required
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-center">
        <button type="submit" className="btn bg-blue-950 text-white">
          Save Routine
        </button>
      </div>
      <ToastContainer
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
/>

    </form>
  );
};

export default CreateRoutine;
