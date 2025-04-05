import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../../Providers/AuthProvider';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';

const convertTo12HourFormat = (time) => {
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours, 10);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${suffix}`;
};

const InstructorRoutine = () => {
  const { user } = useContext(AuthContext);
  const [schedules, setSchedules] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosSecure = useAxiosSecure();

  useEffect(() => { 
    if (!user || !user._id) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Find the instructor's batches
        const instructorsBatchesResponse = await axiosSecure.get('/instructors-batches');
        const instructorBatches = instructorsBatchesResponse.data.filter(
          item => item.instructorId === user._id
        );

        if (!instructorBatches || instructorBatches.length === 0) {
          setError("No batches assigned to this instructor");
          setLoading(false);
          return;
        }

        // 2. Get all batch IDs for this instructor
        const batchIds = instructorBatches.map(item => item.batchId);

        // 3. Fetch routine for each batch
        const routinePromises = batchIds.map(batchId => 
          axiosSecure.get(`/routine/${batchId}`)
        );
        
        const routineResponses = await Promise.all(routinePromises);
        const allRoutines = routineResponses.flatMap(response => response.data);
        
        setSchedules(allRoutines);

        // 4. Fetch batch names
        const batchesResponse = await axiosSecure.get('/batches');
        setBatches(batchesResponse.data);

      } catch (err) {
        setError(err.response?.data?.message || err.message || "Error fetching data");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, axiosSecure]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-ring loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error max-w-md mx-auto mt-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Error: {error}</span>
      </div>
    );
  }

  // Map batchId to batchName
  const getBatchName = (batchId) => {
    const batch = batches.find(b => b._id === batchId);
    return batch ? batch.batchName : "Unknown Batch";
  };

  // Group schedules by batchId
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const batchName = getBatchName(schedule.batchId);
    if (!acc[batchName]) {
      acc[batchName] = [];
    }
    acc[batchName].push(schedule);
    return acc;
  }, {});

  return (
    <div className="w-[1100px] mx-auto mt-20 p-4">
      <h2 className="text-2xl font-bold mb-6">Assigned Course Schedule</h2>
      
      {Object.keys(groupedSchedules).length === 0 ? (
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>No schedules assigned yet</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2">#</th>
                <th className="border border-gray-300 px-4 py-2">Batch</th>
                <th className="border border-gray-300 px-4 py-2">Day</th>
                <th className="border border-gray-300 px-4 py-2">Start Time</th>
                <th className="border border-gray-300 px-4 py-2">End Time</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedSchedules).map(([batchName, batchSchedules], index) => (
                <React.Fragment key={batchName}>
                  {batchSchedules.map((schedule, idx) => (
                    <tr key={`${batchName}-${idx}`}>
                      {idx === 0 && (
                        <>
                          <td rowSpan={batchSchedules.length} className="border border-gray-300 px-4 py-2">
                            {index + 1}
                          </td>
                          <td rowSpan={batchSchedules.length} className="border border-gray-300 px-4 py-2">
                            {batchName}
                          </td>
                        </>
                      )}
                      <td className="border border-gray-300 px-4 py-2">{schedule.day}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {convertTo12HourFormat(schedule.startTime)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {convertTo12HourFormat(schedule.endTime)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InstructorRoutine;