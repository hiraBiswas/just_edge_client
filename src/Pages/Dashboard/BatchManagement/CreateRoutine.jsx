import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure"; // Import custom hook for secure axios instance

const CreateRoutine = ({ batchId }) => {
  const [batchName, setBatchName] = useState(""); // State to store the batch name
  const [numDays, setNumDays] = useState(3); // Default to 3 days
  const [schedule, setSchedule] = useState(
    Array.from({ length: numDays }, () => ({ day: "", startTime: "", endTime: "" }))
  );
  const axiosSecure = useAxiosSecure(); // Get the axios instance with secure headers

  // Fetch batch data
  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        const response = await axiosSecure.get(`/batches/${batchId}`);
        const batchData = response.data;
        setBatchName(batchData.batchName); // Set the batch name
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

  // Handle individual input change
  const handleChange = (index, field, value) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index][field] = value;
    setSchedule(updatedSchedule);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Send the schedule data to the server
    console.log("Submitted Schedule", schedule);
    // Example POST request
    // axiosSecure.post(`/batches/${batchId}/routine`, { schedule });
  };

  // Days for dropdown selection
  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  return (
    <form className="text-black" onSubmit={handleSubmit}>
      <h3 className="text-center font-semibold text-black text-xl">Create Routine for Batch: <br /> {batchName || "Loading..."}</h3> 

      {/* Number of days selection */}
      <div className="mb-4 mt-4 flex items-center gap-3">
        <label htmlFor="numDays" className="block text-sm font-medium">Number of Days 
            :
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
                  <option key={day} value={day}>
                    {day}
                  </option>
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
    
<button type="submit" className="btn bg-blue-950 text-white ">Save Routine</button>
</div>
    </form>
  );
};

export default CreateRoutine;
