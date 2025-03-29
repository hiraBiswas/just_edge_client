import React, { useContext, useEffect, useMemo, useState } from 'react';
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import { AuthContext } from "../../../../Providers/AuthProvider";

const ClassList = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();
  const [batches, setBatches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [instructorId, setInstructorId] = useState(null);
  const [scheduleData, setScheduleData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user._id) {
      setError("User ID not found.");
      return;
    }

    const fetchInstructorsAndData = async () => {
      try {
        setLoading(true); 
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

        // Fetch classes for this instructor
        const classesResponse = await axiosSecure.get(`/classes?instructorId=${matchedInstructor._id}`);
        setClasses(classesResponse.data || []);
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

  // Filter classes based on the selected batch
  const filteredClasses = selectedBatchId 
    ? classes.filter(classItem => classItem.batchId === selectedBatchId)
    : classes;

  return (
    <div className="w-[1100px] relative mt-6 min-h-screen">
      <h2 className="text-xl font-bold mb-4">Class List</h2>

      {error && (
        <div className="alert alert-error mt-4">
          <span>{error}</span>
        </div>
      )}

      {/* Filter by batch */}
      <div className="mb-4">
        <select
          id="batchFilter"
          className="select select-bordered w-full max-w-xs"
          value={selectedBatchId}
          onChange={(e) => setSelectedBatchId(e.target.value)}
        >
          <option value="">All Batches</option>
          {batches
            .filter((batch) => uniqueBatchIds.includes(batch._id))
            .map((batch) => (
              <option key={batch._id} value={batch._id}>
                {batch.batchName}
              </option>
            ))}
        </select>
      </div>

      {/* Display classes */}
      <div className="overflow-x-auto mt-4">
        {loading ? (
          <div className="animate-pulse w-full mt-8 mx-auto">
            <table className="table w-full mx-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th>Class Name</th>
                  <th>Batch</th>
                  <th>Date</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, index) => (
                  <tr key={index}>
                    <td colSpan="5">
                      <div className="h-8 bg-gray-100 rounded-lg"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredClasses.length === 0 ? (
          <p className="text-center mt-8">No classes found for the selected batch.</p>
        ) : (
          <table className="table table-zebra w-full">
            <thead className="bg-blue-950 text-white text-md rounded-md">
              <tr>
                <th>Class Number</th>
                <th>Batch</th>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((classItem, index) => {
                // Find batch name
                const batch = batches.find(b => b._id === classItem.batchId);
                return (
                  <tr key={classItem._id || index}>
                    <td>{`Class ${index + 1}`}</td>
                    <td>{batch ? batch.batchName : "Unknown Batch"}</td>
                    <td>{classItem.date}</td>
                    <td>{new Date(classItem.startTime).toLocaleString()}</td>
                    <td>{new Date(classItem.endTime).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ClassList;