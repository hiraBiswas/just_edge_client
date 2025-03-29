import React, { useContext, useEffect, useState, useMemo } from "react";
import { AuthContext } from "../../../../Providers/AuthProvider";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import { Link } from "react-router-dom";

const Classes = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();
  const [batches, setBatches] = useState([]);
  const [scheduleData, setScheduleData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggleStates, setToggleStates] = useState({});
  const [disabledToggles, setDisabledToggles] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [instructorId, setInstructorId] = useState(null); // Added state to store instructor ID

  useEffect(() => {
    if (!user || !user._id) {
      setError("User ID not found.");
      return;
    }

    const fetchInstructorsAndData = async () => {
      try {
        setLoading(true);
        // Fetch the instructor data
        const instructorsResponse = await axiosSecure.get(`/instructors`);
        const instructors = instructorsResponse.data;

        // Find the matched instructor based on userId
        const matchedInstructor = instructors.find(
          (instructor) => instructor.userId === user._id
        );

        if (!matchedInstructor) {
          setError("Instructor not found for the current user.");
          return;
        }

        // Save the instructor's _id to use later for backend requests
        const instructorId = matchedInstructor._id;
        setInstructorId(instructorId); // Store the instructor ID in state

        // Fetch the schedule data
        const scheduleResponse = await axiosSecure.get(
          `/instructors/${instructorId}/classes`
        );
        setScheduleData(scheduleResponse.data.schedule || {});

        // Fetch all batches
        const batchesResponse = await axiosSecure.get(`/batches`);
        setBatches(batchesResponse.data || []);

        // Check if a class is already recorded for each batch today
        const today = new Date().toISOString().split("T")[0];
        const existingClasses = await axiosSecure.get(`/classes`);

        // Disable toggles for batches with existing classes today
        const disabledBatchIds = existingClasses.data
          .filter((classItem) => classItem.date === today)
          .map((classItem) => classItem.batchId);

        setDisabledToggles((prev) => {
          const newDisabledToggles = {};
          disabledBatchIds.forEach((batchId) => {
            newDisabledToggles[batchId] = true;
          });
          return newDisabledToggles;
        });
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
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

  const handleToggleChange = async (batchId) => {
    try {
      const today = new Date().toISOString().split("T")[0];

      if (toggleStates[batchId]) {
        // Toggle is being turned OFF (Ending class)
        setSubmitting(true);
        console.log("Ending class for", batchId);

        // Send all the data to the backend when toggle is turned OFF
        await axiosSecure.post("/classes", {
          instructorId: instructorId, // Using the correct instructor ID from state
          batchId,
          startTime: toggleStates[batchId].startTime,
          endTime: new Date().toISOString(),
          date: today,
        });

        // Clear toggle state and disable it
        setToggleStates((prev) => {
          const newState = { ...prev };
          delete newState[batchId];
          return newState;
        });
        setDisabledToggles((prev) => ({ ...prev, [batchId]: true }));
        setSubmitting(false);
      } else {
        // Toggle is being turned ON (Starting class)
        console.log("Starting class for", batchId);

        // Only store the start time in the state, don't send to backend yet
        setToggleStates((prev) => ({
          ...prev,
          [batchId]: { startTime: new Date().toISOString() },
        }));
      }
    } catch (err) {
      console.error("Error handling toggle:", err);
      setError("Failed to record class. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="w-[1100px] relative mt-6 min-h-screen">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">Assigned Batches</h2>
      <Link to="/dashboard/classList"> 
       <button
          className="btn btn-outline text-blue-950"
          onClick={() => console.log("View Classes")}
        >
          View Classes
        </button>
        </Link>
      </div>

      {error && (
        <div className="alert alert-error mt-4">
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-x-auto mt-4">
        {loading ? (
          <div className="animate-pulse w-full mt-8 mx-auto">
            <table className="table w-4/6 mx-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th>Index</th>
                  <th>Batch Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(8)].map((_, index) => (
                  <tr key={index}>
                    <td colSpan="3">
                      <div className="h-8 bg-gray-100 rounded-lg"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <table className="table table-zebra w-4/6 mx-auto">
            <thead className="bg-blue-950 text-white text-md rounded-md">
              <tr>
                <th>Index</th>
                <th>Batch Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {batches
                .filter((batch) => uniqueBatchIds.includes(batch._id))
                .map((batch, index) => (
                  <tr key={batch._id}>
                    <td>{index + 1}</td>
                    <td>{batch.batchName}</td>

                    <td>
                      <input
                        type="checkbox"
                        className="toggle toggle-success"
                        checked={!!toggleStates[batch._id]}
                        onChange={() => handleToggleChange(batch._id)}
                        disabled={disabledToggles[batch._id] || submitting}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Classes;