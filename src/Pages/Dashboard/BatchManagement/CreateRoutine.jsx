import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { toast as parentToast } from "react-toastify"; // Parent toast for success message
import { Toaster, toast } from "react-hot-toast"; 

const CreateRoutine = ({ batchId, closeModal, fetchRoutines }) => {
  const [batchName, setBatchName] = useState("");
  const [numDays, setNumDays] = useState(2);
  const [schedule, setSchedule] = useState(
    Array.from({ length: numDays }, () => ({ day: "", startTime: "", endTime: "" }))
  );
  const [loading, setLoading] = useState(false);
  const [instructorIds, setInstructorIds] = useState([]);
  const axiosSecure = useAxiosSecure();

  // Fetch batch data and instructor IDs
  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        const response = await axiosSecure.get(`/batches/${batchId}`);
        const batchData = response.data;
        setBatchName(batchData.batchName);
        setInstructorIds(batchData.instructorIds); // Get instructor IDs from batch data
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
  // const handleChange = async (index, field, value) => {
  //   const updatedSchedule = [...schedule];
  //   updatedSchedule[index][field] = value;

  //   if (field === "day" && isDuplicateDay(value, index)) {
  //     toast.error("Already has class on this day.");
  //     return;
  //   }

  //   if (field === "endTime" && updatedSchedule[index].startTime) {
  //     const startTime = updatedSchedule[index].startTime;
  //     if (value < startTime) {
  //       toast.error("End time must be after the start time.");
  //       return;
  //     }
  //   }

  //   if (field === "day" || field === "startTime" || field === "endTime") {
  //     const conflicts = await validateSchedule(updatedSchedule);
  //     if (conflicts && conflicts.length > 0) {
  //       conflicts.forEach((conflict) => {
  //         toast.error(conflict.message);
  //       });
  //       return;
  //     }
  //   }

  //   setSchedule(updatedSchedule);
  // };

  // Validate schedule for conflicts
  const validateSchedule = async (currentSchedule = schedule) => {
    try {
      const response = await axiosSecure.get(`/instructors/${instructorIds[0]}/classes`);
      const instructorSchedule = response.data.schedule;
      const conflicts = [];

      currentSchedule.forEach((newClass) => {
        const { day: newDay, startTime: newStartTime, endTime: newEndTime } = newClass;

        if (!newDay || !newStartTime || !newEndTime) return;

        const existingClassesOnDay = Object.entries(instructorSchedule).filter(([key]) =>
          key.startsWith(newDay)
        );

        if (existingClassesOnDay.length >= 2) {
          conflicts.push({
            message: `Maximum of 2 classes allowed on ${newDay}.`,
            day: newDay,
          });
        } else {
          existingClassesOnDay.forEach(([timeKey]) => {
            const [existingStartTime, existingEndTime] = timeKey.split(" - ");
            if (
              (newStartTime >= existingStartTime && newStartTime < existingEndTime) || // Overlap start
              (newEndTime > existingStartTime && newEndTime <= existingEndTime) || // Overlap end
              (newStartTime <= existingStartTime && newEndTime >= existingEndTime) // Full overlap
            ) {
              conflicts.push({
                message: `Time conflict on ${newDay} between ${newStartTime}-${newEndTime} and ${existingStartTime}-${existingEndTime}.`,
                day: newDay,
              });
            }
          });
        }
      });

      return conflicts;
    } catch (error) {
      console.error("Error validating schedule:", error);
      toast.error("Error validating schedule.");
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const scheduleData = { batchId, schedule };
    console.log("Submitting routine with data:", scheduleData); // Log the data being submitted
  
    // Validate schedule before submitting
    const conflicts = await validateSchedule();
    console.log("Schedule validation conflicts:", conflicts); // Log validation result
    if (conflicts && conflicts.length > 0) {
      toast.error("Schedule conflicts detected. Please review and adjust.");
      console.table(conflicts); // Log conflicts for debugging
      setLoading(false);
      return;
    }
  
    try {
      console.log("Sending data to backend...");
      const response = await axiosSecure.post("/routine", scheduleData);
      console.log("Backend response:", response); // Log the backend response
  
      if (response.status === 201 || response.status === 200) {
        parentToast.success("Routine created successfully!");
        closeModal(); // Close the modal
        fetchRoutines(); // Refresh routines
      } else {
        console.error("Failed to create routine, unexpected response status:", response.status);
        toast.error("Failed to create routine. Please try again.");
      }
    } catch (error) {
      console.error("Error creating routine:", error.message); // Log the error message
      console.log("Error details:", error); // Log the full error object for more context
  
      // Check if the error is from the backend and handle it
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        console.log("Backend error response:", errorData); // Log the full backend error response
  
        if (errorData.conflicts && errorData.conflicts.length > 0) {
          errorData.conflicts.forEach((conflict) => {
            const { day, newSession, existingSession } = conflict;
            toast.error(`Conflict detected on ${day}: 
              New class time (${newSession.startTime}-${newSession.endTime}) 
              conflicts with existing class (${existingSession.startTime}-${existingSession.endTime}).`);
          });
        } else {
          toast.error(errorData.message || "An error occurred while creating the routine.");
        }
      } else {
        toast.error("Error creating routine. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Inside handleChange
  const handleChange = async (index, field, value) => {
    console.log(`Changing field ${field} for index ${index} to value:`, value); // Log field changes
    const updatedSchedule = [...schedule];
    updatedSchedule[index][field] = value;
  
    if (field === "day" && isDuplicateDay(value, index)) {
      toast.error("Already has class on this day.");
      console.log("Duplicate day detected:", value); // Log duplicate day detection
      return;
    }
  
    if (field === "endTime" && updatedSchedule[index].startTime) {
      const startTime = updatedSchedule[index].startTime;
      if (value < startTime) {
        toast.error("End time must be after the start time.");
        console.log("Invalid end time:", value, "is before start time:", startTime); // Log invalid end time
        return;
      }
    }
  
    if (field === "day" || field === "startTime" || field === "endTime") {
      console.log("Validating schedule...");
      const conflicts = await validateSchedule(updatedSchedule);
      if (conflicts && conflicts.length > 0) {
        conflicts.forEach((conflict) => {
          console.log("Conflict detected during validation:", conflict); // Log each conflict
          toast.error(conflict.message);
        });
        return;
      }
    }
  
    setSchedule(updatedSchedule);
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
    setNumDays(2);
    setSchedule(
      Array.from({ length: 2 }, () => ({ day: "", startTime: "", endTime: "" }))
    );
  };

  useEffect(() => {
    return () => {
      resetForm();
    };
  }, []);

  return (
    <form className="text-black p-5" onSubmit={handleSubmit}>
      <h3 className="text-center font-semibold text-black text-xl">Create Routine</h3>

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
