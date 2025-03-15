import React, { useContext, useEffect, useState, useMemo } from "react";
import { AuthContext } from "../../../../Providers/AuthProvider";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import { FaPlus } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";

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
  const [filteredBatchId, setFilteredBatchId] = useState("");
   const itemsPerPage = 8;
    const [currentPage, setCurrentPage] = useState(1);
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
      } catch (err) {
        setError(err.message);
      }
      finally {
        setLoading(false); // Stop loading
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
      setLoading(true); 

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
    finally {
      setLoading(false); // Stop loading
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

  const filteredClasses = useMemo(() => {
    if (!filteredBatchId) return classesData;
    return classesData.filter(
      (classItem) => classItem.batchId === filteredBatchId
    );
  }, [filteredBatchId, classesData]);

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

  const handleToggleChange = (classId) => {
    const currentTime = new Date().toLocaleTimeString();

    // Optimistic update for immediate UI feedback
    setTimeTracker((prev) => {
      const updated = { ...prev };
      if (!updated[classId]) {
        updated[classId] = { startTime: currentTime };
        // Update classesData immediately for startTime
        setClassesData((prevClasses) =>
          prevClasses.map((classItem) =>
            classItem._id === classId
              ? { ...classItem, startTime: currentTime }
              : classItem
          )
        );
      } else {
        updated[classId].endTime = currentTime;
        // Update classesData immediately for endTime
        setClassesData((prevClasses) =>
          prevClasses.map((classItem) =>
            classItem._id === classId
              ? { ...classItem, endTime: currentTime }
              : classItem
          )
        );
      }
      return updated;
    });

    // Backend update
    const updateData = {
      startTime: timeTracker[classId]?.startTime || currentTime,
      endTime: timeTracker[classId]?.endTime || currentTime,
    };

    axiosSecure
      .patch(`/classes/${classId}`, updateData)
      .then((response) =>
        console.log("Successfully updated class:", response.data)
      )
      .catch((err) => console.error("Error updating class:", err.message));
  };

  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
const currentClasses = filteredClasses.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

const handlePageChange = (newPage) => {
  setCurrentPage(newPage);
};

  return (
    <div className="w-[1100px] relative mt-6  min-h-screen">
      <div className="flex justify-between">
      <div className="mb-4">
          <select
            id="batchFilter"
            className="select select-bordered w-full max-w-xs"
            value={filteredBatchId}
            onChange={(e) => setFilteredBatchId(e.target.value)}
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


        <button
          className="btn btn-outline b-2 border-blue-950 hover:bg-blue-950 hover:text-white"
          onClick={() => document.getElementById("my_modal_5").showModal()}
        >
         <FaPlus />  Add Class
        </button>

   
      </div>

      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-center text-xl mb-4">
            Add a New Class
          </h3>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="batchSelection"
                className="block text-sm font-medium mb-2"
              >
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
              <label
                htmlFor="classDate"
                className="block text-sm font-medium mb-2"
              >
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
              <button className="btn bg-blue-950 text-white" type="submit">
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
      {loading ? (
          <div className="animate-pulse w-full mt-8 mx-auto">
            <table className="table w-[1000px] mx-auto">
              <thead className="bg-gray-200">
                <tr>
                <th>Index</th>
              <th>Batch Name</th>
              <th>Instructor</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(itemsPerPage)].map((_, index) => (
                  <tr key={index}>
                    <td colSpan="7">
                      <div className="h-8 bg-gray-100 rounded-lg"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : 
   (
        <table className="table table-zebra w-full">
          <thead className="bg-blue-950 text-white text-md rounded-md">
            <tr>
              <th>Index</th>
              <th>Batch Name</th>
              <th>Instructor</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredClasses.map((classItem, index) => {
              const batch = batches.find((b) => b._id === classItem.batchId);
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{batch ? batch.batchName : "Unknown Batch"}</td>
                  <td>{classItem.instructorName || "Unknown Instructor"}</td>
                  <td>{classItem.date}</td>
                  <td>{classItem.startTime}</td>
                  <td>{classItem.endTime}</td>
                  <td className="flex items-center justify-between gap-2">
                    <input
                      type="checkbox"
                      className="toggle bg-blue-950 theme-controller "
                      checked={!!classItem.startTime}
                      disabled={!!classItem.startTime && !!classItem.endTime}
                      onChange={() => handleToggleChange(classItem._id)}
                    />
                   
                   <MdDelete className="text- text-blue-950 text-xl" />

                  </td>
               
                </tr>
              );
            })}
          </tbody>
        </table>
          )}
      </div>

      <div className="flex justify-end join absolute bottom-4 right-0 my-4">
        <button
          className="join-item btn"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </button>
        <button className="join-item btn">{`Page ${currentPage}`}</button>

        <button
          className="join-item btn"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Classes;
