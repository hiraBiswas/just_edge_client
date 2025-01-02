import React, { useContext, useEffect, useState, useMemo } from "react";
import { AuthContext } from "../../../../Providers/AuthProvider";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";

const Classes = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();
  const [batches, setBatches] = useState([]);
  const [scheduleData, setScheduleData] = useState({});
  const [error, setError] = useState(null);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [classesData, setClassesData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [timeTracker, setTimeTracker] = useState({});

  useEffect(() => {
    if (!user || !user._id) {
      setError("User ID not found.");
      return;
    }

    const fetchInstructorsAndData = async () => {
      try {
        // Fetch instructors and find the current user
        const instructorsResponse = await axiosSecure.get(`/instructors`);
        const instructors = instructorsResponse.data;
        const matchedInstructor = instructors.find(
          (instructor) => instructor.userId === user._id
        );

        if (!matchedInstructor) {
          setError("Instructor not found for the current user.");
          return;
        }

        setInstructorId(matchedInstructor._id);

        // Fetch the instructor's schedule
        const scheduleResponse = await axiosSecure.get(
          `/instructors/${matchedInstructor._id}/classes`
        );
        setScheduleData(scheduleResponse.data.schedule || {});

        // Fetch available batches
        const batchesResponse = await axiosSecure.get(`/batches`);
        setBatches(batchesResponse.data || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchInstructorsAndData();
  }, [user, axiosSecure]);

  const uniqueBatchIds = useMemo(() => {
    return [
      ...new Set(
        Object.values(scheduleData)
          .flat()
          .map((entry) => entry.batchId)
      ),
    ];
  }, [scheduleData]);

  const fetchClasses = async () => {
    try {
      console.log("Starting fetchClasses...");
  
      // Step 1: Make the API call
      const response = await axiosSecure.get(`/classes`);
      console.log("API Response:", response);
  
      // Step 2: Extract classes data
      const allClasses = response.data || [];
      console.log("All Classes:", allClasses);
  
      // Step 3: Log uniqueBatchIds to ensure they are correct
      console.log("Unique Batch IDs:", uniqueBatchIds);
  
      // Step 4: Filter classes based on uniqueBatchIds
      const filteredClasses = allClasses.filter((classItem) =>
        uniqueBatchIds.includes(classItem.batchId)
      );
      console.log("Filtered Classes:", filteredClasses);
  
      // Step 5: Update state
      setClassesData(filteredClasses);
    } catch (err) {
      console.error("Error fetching classes:", err.message);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (uniqueBatchIds.length > 0) {
      console.log("Unique Batch IDs exist, calling fetchClasses...");
      fetchClasses();
    } else {
      console.log("No uniqueBatchIds found, fetchClasses will not be called.");
    }
  }, [uniqueBatchIds, axiosSecure]);
  
  
  
  // const handleToggleChange = (classId) => {
  //   const currentTime = new Date().toLocaleTimeString();
  
  //   // Update timeTracker state
  //   setTimeTracker((prev) => {
  //     const updated = { ...prev };
  //     if (!updated[classId]?.startTime) {
  //       // Set startTime on the first click
  //       updated[classId] = { startTime: currentTime };
  //     } else if (!updated[classId]?.endTime) {
  //       // Set endTime on the second click
  //       updated[classId].endTime = currentTime;
  //     }
  //     return updated;
  //   });
  
  //   // Extract updated tracker after state update
  //   setTimeout(async () => {
  //     const updatedTracker = {
  //       ...timeTracker,
  //       [classId]: {
  //         ...(timeTracker[classId] || {}),
  //         ...(timeTracker[classId]?.startTime
  //           ? { endTime: currentTime }
  //           : { startTime: currentTime }),
  //       },
  //     };
  
  //     const updateData = {
  //       startTime: updatedTracker[classId]?.startTime,
  //       endTime: updatedTracker[classId]?.endTime,
  //     };
  
  //     // Send PATCH request only if both startTime and endTime are present
  //     if (updateData.startTime && updateData.endTime) {
  //       try {
  //         const response = await axiosSecure.patch(`/classes/${classId}`, updateData);
  //         console.log("Updated successfully:", response.data);
  
  //         // Refetch classes after successful PATCH
  //         fetchClasses();
  //       } catch (err) {
  //         console.error("Error updating class:", err.message);
  //       }
  //     } else {
  //       console.log("Incomplete data: PATCH request not sent");
  //     }
  //   }, 0);
  // };
  
  

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBatchId || !instructorId || !selectedDate) {
      console.error("Batch ID, Instructor ID, and Date are required.");
      return;
    }

    const newClass = {
      batchId: selectedBatchId,
      instructorId,
      date: selectedDate,
    };

    try {
      const response = await axiosSecure.post("/classes", newClass);
      if (response.data.success) {
        console.log("Class added successfully:", response.data);
        fetchClasses();
        document.getElementById("my_modal_5").close();
      } else {
        console.error("Failed to add class:", response.data.message);
      }
    } catch (err) {
      console.error("Error saving class:", err);
    }
  };


  // const handleToggleChange = (classId) => {
  //   const currentTime = new Date().toLocaleTimeString();
  
  //   setTimeTracker((prev) => {
  //     const updated = { ...prev };
  //     if (!updated[classId]?.startTime) {
  //       // Set startTime if it doesn't exist
  //       updated[classId] = { startTime: currentTime };
  //     } else if (!updated[classId]?.endTime) {
  //       // Set endTime if startTime already exists
  //       updated[classId].endTime = currentTime;
  //     }
  //     return updated;
  //   });
  
  //   // Send the updated data to the database
  //   const updatedTracker = {
  //     ...timeTracker,
  //     [classId]: {
  //       ...(timeTracker[classId] || {}),
  //       ...(timeTracker[classId]?.startTime
  //         ? { endTime: currentTime }
  //         : { startTime: currentTime }),
  //     },
  //   };
  
  //   const updateData = {
  //     startTime: updatedTracker[classId]?.startTime,
  //     endTime: updatedTracker[classId]?.endTime,
  //   };
  
  //   // Only send the PATCH request if data is complete
  //   setTimeout(async () => {
  //     try {
  //       const response = await axiosSecure.patch(`/classes/${classId}`, updateData);
  //       console.log("Successfully updated class:", response.data);
  
  //       // Refetch classes to ensure the latest data is shown
  //       fetchClasses();
  //     } catch (err) {
  //       console.error("Error updating class:", err.message);
  //     }
  //   }, 0);
  // };
  

  const handleToggleChange = (classId) => {
    const currentTime = new Date().toLocaleTimeString();
  
    // Optimistically update timeTracker state
    setTimeTracker((prev) => {
      const updated = { ...prev };
      if (!updated[classId]?.startTime) {
        updated[classId] = { startTime: currentTime };
      } else if (!updated[classId]?.endTime) {
        updated[classId].endTime = currentTime;
      }
      return updated;
    });
  
    // Prepare the data for the PATCH request
    const updateData = {
      startTime: timeTracker[classId]?.startTime || currentTime,
      endTime: timeTracker[classId]?.endTime || currentTime,
    };
  
    // Send the PATCH request to update the times
    setTimeout(async () => {
      try {
        const response = await axiosSecure.patch(`/classes/${classId}`, updateData);
        console.log("Successfully updated class:", response.data);
  
        // After successful update, update the classesData state
        setClassesData((prevClasses) =>
          prevClasses.map((classItem) =>
            classItem._id === classId
              ? {
                  ...classItem,
                  startTime: updateData.startTime,
                  endTime: updateData.endTime,
                }
              : classItem
          )
        );
      } catch (err) {
        console.error("Error updating class:", err.message);
      }
    }, 0);
  };
   

  return (
    <div>
      <button
        className="btn"
        onClick={() => document.getElementById("my_modal_5").showModal()}
      >
        Add Class
      </button>

      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-center text-xl mb-4">Add a New Class</h3>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="batchSelection" className="block text-sm font-medium mb-2">
                Select Batch
              </label>
              <select
                id="batchSelection"
                className="select select-bordered w-full"
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select Batch
                </option>
                {batches
                  .filter((batch) => uniqueBatchIds.includes(batch._id))
                  .map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.batchName}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label htmlFor="classDate" className="block text-sm font-medium mb-2">
                Class Date
              </label>
              <input
                id="classDate"
                type="date"
                className="input input-bordered w-full"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="modal-action">
              <button className="btn" type="submit">
                Add Class
              </button>
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => document.getElementById("my_modal_5").close()}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </dialog>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Batch Name</th>
              <th>Instructor</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {classesData.map((classItem, index) => {
              const batch = batches.find((b) => b._id === classItem.batchId);
              return (
                <tr key={index}>
                  <td>{batch ? batch.batchName : "Unknown Batch"}</td>
                  <td>{classItem.instructorName || "Unknown Instructor"}</td>
                  <td>{classItem.date}</td>
                  <td>{classItem.startTime}</td>
                  <td>{classItem.endTime}</td>
                  <td>
                    <input
                      type="checkbox"
                      value="synthwave"
                      className="toggle theme-controller"
                      checked={!!timeTracker[classItem._id]?.startTime}
                      onChange={() => handleToggleChange(classItem._id)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Classes;
