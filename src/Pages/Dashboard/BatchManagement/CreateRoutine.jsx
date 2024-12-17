import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { toast as parentToast } from "react-toastify"; // Parent toast for success message
import { Toaster, toast } from "react-hot-toast"; // Modal toast for validation messages

const CreateRoutine = ({ batchId, closeModal, fetchRoutines }) => {
  const [batchName, setBatchName] = useState("");
  const [numDays, setNumDays] = useState(2);
  const [schedule, setSchedule] = useState(
    Array.from({ length: numDays }, () => ({ day: "", startTime: "", endTime: "" }))
  );
  const [loading, setLoading] = useState(false);
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
      Array.from({ length: value }, () => ({ day: "", startTime: "", endTime: "" }))
    );
  };

  // Check for duplicate days
  const isDuplicateDay = (day, index) => {
    return schedule.some((entry, i) => entry.day === day && i !== index);
  };

  // Handle individual field change
  const handleChange = (index, field, value) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index][field] = value;

    if (field === "day" && isDuplicateDay(value, index)) {
      toast.error("Already has class on this day.");
      return;
    }

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
    setLoading(true);

    const scheduleData = { batchId, schedule };

    try {
      const response = await axiosSecure.post("/routine", scheduleData);

      if (response.status === 201 || response.status === 200) {
        parentToast.success("Routine created successfully!");
        closeModal(); // Close the modal
        fetchRoutines(); // Refresh routines
      } else {
        toast.error("Failed to create routine. Please try again.");
      }
    } catch (error) {
      toast.error("Error creating routine");
    } finally {
      setLoading(false);
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

  const resetForm = () => {
    setBatchName("");
    setNumDays(3);
    setSchedule(
      Array.from({ length: 2 }, () => ({ day: "", startTime: "", endTime: "" }))
    );
  };

  useEffect(() => {
    return () => {
      resetForm(); // Clean up when modal is closed
    };
  }, []);

  return (
    <form className="text-black p-5" onSubmit={handleSubmit}>
      <h3 className="text-center font-semibold text-black text-xl">
        Create Routine
      </h3>

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
          <option value="2">2 Days</option>
          <option value="3">3 Days</option>
          <option value="4">4 Days</option>
          
        </select>
      </div>

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
        <button type="submit" className="btn bg-blue-950 text-white" disabled={loading}>
          {loading ? (
            <>Saving <span className="loading loading-dots loading-md"></span></>
          ) : (
            "Save Routine"
          )}
        </button>
      </div>

      <Toaster position="top-center" reverseOrder={false} />
    </form>
  );
};

export default CreateRoutine;
