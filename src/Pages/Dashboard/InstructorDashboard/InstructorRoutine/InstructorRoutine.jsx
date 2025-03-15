import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../../Providers/AuthProvider'; // Import AuthContext
import useAxiosSecure from '../../../../hooks/useAxiosSecure'; // Import axiosSecure hook

// Function to convert 24-hour time format to 12-hour time format (AM/PM)
const convertTo12HourFormat = (time) => {
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours, 10);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12; // Handle midnight case
  return `${hours}:${minutes} ${suffix}`;
};

const InstructorRoutine = () => {
  const { user } = useContext(AuthContext); // Access the logged-in user from AuthContext
  const [schedule, setSchedule] = useState(null);
  const [batches, setBatches] = useState([]); // State to store batches data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosSecure = useAxiosSecure(); // Use axiosSecure for API calls

  // Fetch instructor's ID and then schedule and batches data
  useEffect(() => { 
    if (!user || !user._id) {
      setError("Instructor ID not found");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch all instructors and find the matching instructor
        const instructorsResponse = await axiosSecure.get('/instructors');
        const instructors = instructorsResponse.data;

        // Match instructor by userId
        const instructor = instructors.find(inst => inst.userId === user._id);

        if (!instructor) {
          setError("Instructor not found");
          setLoading(false);
          return;
        }

        // Fetch instructor's schedule using their _id
        const scheduleResponse = await axiosSecure.get(`/instructors/${instructor._id}/classes`);
        const scheduleData = scheduleResponse.data;

        if (scheduleData.success) {
          setSchedule(scheduleData.schedule); // Set the schedule in state
        } else {
          setError(scheduleData.message || 'Something went wrong');
        }

        // Fetch batches to map batchId to batchName
        const batchesResponse = await axiosSecure.get('/batches');
        if (batchesResponse.data) {
          setBatches(batchesResponse.data); // Set the batches in state
        }
      } catch (err) {
        setError(err.message);
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
  // Show error state
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Map batchId to batchName
  const mapBatchIdToName = (batchId) => {
    const batch = batches.find(b => b._id === batchId);
    return batch ? batch.batchName : "Unknown Batch";
  };

  // Group the schedule data by batchId
  const groupedSchedule = {}; // Grouped schedule by batchId

  Object.entries(schedule).forEach(([dayTime, sessions]) => {
    sessions.forEach(session => {
      const batchName = mapBatchIdToName(session.batchId);
      if (!groupedSchedule[batchName]) {
        groupedSchedule[batchName] = [];
      }
      groupedSchedule[batchName].push({
        day: session.day,
        startTime: session.startTime,
        endTime: session.endTime,
        batchId: session.batchId
      });
    });
  });

  return (
    <div className="overflow-x-auto w-[1100px] mt-20">
      <h2 className='text-xl font-bold mb-4'>Assigned Course Schedule</h2>
      <table className="table-auto w-full border-collapse border border-gray-200">
        {/* Head */}
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Index</th>
            <th className="border border-gray-300 px-4 py-2">Batch Name</th>
            <th className="border border-gray-300 px-4 py-2">Day</th>
            <th className="border border-gray-300 px-4 py-2">Start Time</th>
            <th className="border border-gray-300 px-4 py-2">End Time</th>
          </tr>
        </thead>
        <tbody>
          {/* Table rows */}
          {Object.entries(groupedSchedule).map(([batchName, sessions], index) => (
            <React.Fragment key={batchName}>
              {/* Batch Name Row */}
              <tr>
                <th rowSpan={sessions.length} className="border border-gray-300 px-4 py-2">{index + 1}</th> {/* Index */}
                <td rowSpan={sessions.length} className="border border-gray-300 px-4 py-2">{batchName}</td> {/* Batch Name */}
                {/* First session's Day, Time */}
                <td className="border border-gray-300 px-4 py-2">{sessions[0].day}</td>
                <td className="border border-gray-300 px-4 py-2">{convertTo12HourFormat(sessions[0].startTime)}</td>
                <td className="border border-gray-300 px-4 py-2">{convertTo12HourFormat(sessions[0].endTime)}</td>
              </tr>
              {/* Additional sessions for the same batch */}
              {sessions.slice(1).map((session, subIndex) => (
                <tr key={subIndex}>
                  <td className="border border-gray-300 px-4 py-2">{session.day}</td>
                  <td className="border border-gray-300 px-4 py-2">{convertTo12HourFormat(session.startTime)}</td>
                  <td className="border border-gray-300 px-4 py-2">{convertTo12HourFormat(session.endTime)}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InstructorRoutine;
