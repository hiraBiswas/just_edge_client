import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdateBatch = ({ batchId, onBatchUpdated }) => {
  const [batchData, setBatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [batchName, setBatchName] = useState("");
  const [batchNum, setBatchNum] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Fetch batch details when the component mounts or when batchId changes
  useEffect(() => {
    if (batchId) {
        fetchRoutine();
    }
}, [batchId, refreshTrigger]); 

  const fetchBatchDetails = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/batches/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch batch details");
      }
      const data = await response.json();
      setBatchData(data);
      const [courseName, batchNumber] = data.batchName?.split(" - ") || ["", ""];
      setBatchName(courseName);
      setBatchNum(batchNumber);
      setStatus(data.status);
      setStartDate(data.startDate);
      setEndDate(data.endDate);
    } catch (error) {
      console.error("Error fetching batch details:", error);
      toast.error("Failed to fetch batch details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedBatchData = {
      batchName: `${batchName} - ${batchNum}`,
      status,
      startDate,
      endDate
    };

    try {
      const response = await fetch(`http://localhost:5000/batches/${batchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedBatchData)
      });

      if (response.ok) {
        toast.success("Batch updated successfully!");
        onBatchUpdated(updatedBatchData.batchName);
        resetForm(); // Reset the form after successful update
      } else {
        toast.error("Failed to update batch.");
      }
    } catch (error) {
      console.error("Error updating batch:", error);
      toast.error("An error occurred while updating the batch.");
    }
  };

  // Reset form fields
  const resetForm = () => {
    setBatchName("");
    setBatchNum("");
    setStatus("");
    setStartDate("");
    setEndDate("");
  };

  if (loading) return <div>Loading...</div>;
  if (!batchData) return <div>No batch data found</div>;

  const today = new Date().toISOString().split("T")[0]; // For today's date

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Course Name:</label>
          <input type="text" value={batchName} disabled className="input input-bordered w-full" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Batch Number:</label>
          <input
            type="text"
            value={batchNum}
            onChange={(e) => setBatchNum(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input input-bordered w-full"
          >
            <option value="" disabled>Select Status</option>
            <option value="Soon to be started">Soon to be started</option>
            <option value="On going">On going</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Start Date:</label>
          <input
            type="date"
            value={startDate}
            min={today}
            onChange={(e) => setStartDate(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">End Date:</label>
          <input
            type="date"
            value={endDate}
            min={startDate} // Ensure end date is not before start date
            onChange={(e) => setEndDate(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-full">Update Batch</button>
      </form>

      <ToastContainer />
    </div>
  );
};

export default UpdateBatch;
