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
  const [seat, setSeat] = useState(0);
  const [occupiedSeat, setOccupiedSeat] = useState(0);

  useEffect(() => {
    if (batchId) {
      fetchBatchDetails(batchId);
    }
  }, [batchId]);

  const fetchBatchDetails = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/batches/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch batch details");
      }
      const data = await response.json();
      setBatchData(data);
      // Set the batch data into state
      setBatchName(data.batchName); // Set batchName here
      setStatus(data.status);
      setStartDate(data.startDate);
      setEndDate(data.endDate);
      setSeat(data.seat);
      setOccupiedSeat(data.occupiedSeat);
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
      batchName, // Use the batchName directly as entered in the input
      status,
      startDate,
      endDate,
      seat: parseInt(seat), // Convert seat to integer
    occupiedSeat: parseInt(occupiedSeat)
    };

    try {
      const response = await fetch(`http://localhost:5000/batches/${batchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedBatchData),
      });

      if (response.ok) {
        toast.success("Batch updated successfully!");
        onBatchUpdated(); // Notify parent to refresh data
        onCloseModal(); // Close the modal
        resetForm();
      } else {
        toast.error("Failed to update batch.");
      }
    } catch (error) {
      console.error("Error updating batch:", error);
      toast.error("An error occurred while updating the batch.");
    }
  };

  // Reset form fields after success
  const resetForm = () => {
    setBatchName("");
    setSeat("");
    setStatus("");
    setStartDate("");
    setEndDate("");
  };

  if (loading) return <div>Loading...</div>;
  if (!batchData) return <div>No batch data found</div>;

  const today = new Date().toISOString().split("T")[0]; // For today's date

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Batch Name (Editable) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Batch Name:
          </label>
          <input
            type="text"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)} // Allow the user to update batchName
            className="input input-bordered w-full"
          />
        </div>

        {/* Seat Information (Editable) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Total Seats:
          </label>
          <input
            type="number"
            value={seat}
            onChange={(e) => setSeat(e.target.value)} // Allow the user to edit seat number
            className="input input-bordered w-full"
          />
        </div>

        {/* Status */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Status:
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input input-bordered w-full"
          >
            <option value="Soon to be started">Upcoming</option>
            <option value="Ongoing">On going</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Start Date:
          </label>
          <input
            type="date"
            value={startDate}
            min={today}
            onChange={(e) => setStartDate(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        {/* End Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            End Date:
          </label>
          <input
            type="date"
            value={endDate}
            min={startDate} // Ensure end date is not before start date
            onChange={(e) => setEndDate(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary w-full">
          Update Batch
        </button>
      </form>

      <ToastContainer />
    </div>
  );
};

export default UpdateBatch;
