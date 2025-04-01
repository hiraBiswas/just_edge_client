import React, { useState, useEffect } from "react";
import {
  Tabs,
  TabsHeader,
  Tab,
  TabsBody,
  TabPanel,
} from "@material-tailwind/react";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import { toast } from "react-hot-toast";
import { FaExchangeAlt } from "react-icons/fa";

const tabsData = [
  { label: "Batch Change", value: "batch" },
  { label: "Course Change", value: "course" },
];

const ChangeRequests = () => {
  const [activeTab, setActiveTab] = useState("batch");
  const [allRequests, setAllRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [swapModal, setSwapModal] = useState({
    open: false,
    currentRequest: null,
    candidates: []
  });

  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    if (activeTab === "batch") {
      fetchAllBatchRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    const filtered = allRequests.filter(req => req.status === "Pending");
    setPendingRequests(filtered);
  }, [allRequests]);

  const fetchAllBatchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const requestsResponse = await axiosSecure.get("/batch-change-requests");
      const requests = requestsResponse.data;

      const [studentsResponse, usersResponse, batchesResponse] = await Promise.all([
        axiosSecure.get("/students"),
        axiosSecure.get("/users"),
        axiosSecure.get("/batches"),
      ]);

      const enrichedRequests = requests.map(request => {
        const student = studentsResponse.data.find(s => s._id === request.studentId);
        const user = usersResponse.data.find(u => u._id === student?.userId);
        const currentBatch = batchesResponse.data.find(b => b._id === student?.enrolled_batch);
        const requestedBatch = batchesResponse.data.find(b => b._id === request.requestedBatch);

        return {
          ...request,
          studentInfo: {
            name: user?.name || "Unknown",
            userId: student?.userId,
            enrolled_batch: student?.enrolled_batch,
          },
          currentBatchInfo: {
            batchName: currentBatch?.batchName || "N/A",
            _id: currentBatch?._id
          },
          requestedBatchInfo: {
            batchName: requestedBatch?.batchName || "N/A",
            seat: requestedBatch?.seat,
            occupiedSeat: requestedBatch?.occupiedSeat,
            _id: requestedBatch?._id
          },
          seatsAvailable: requestedBatch 
            ? (requestedBatch.seat - requestedBatch.occupiedSeat) > 0
            : false
        };
      });

      setAllRequests(enrichedRequests);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to load batch change requests");
    } finally {
      setLoading(false);
    }
  };

  // Find all potential swap candidates for a request
  const findSwapCandidates = (request) => {
    return pendingRequests.filter(req => 
      req._id !== request._id &&
      req.currentBatchInfo?._id === request.requestedBatchInfo?._id &&
      req.requestedBatchInfo?._id === request.currentBatchInfo?._id
    );
  };

 // Open swap modal with candidates
const openSwapModal = (request) => {
  const candidates = findSwapCandidates(request);
  setSwapModal({
    open: true,
    currentRequest: request,
    candidates: candidates
  });
  document.getElementById('swap_modal').showModal();
};

  // Normal batch change approval
  const handleApprove = async (requestId) => {
    try {
      const response = await axiosSecure.patch(
        `/batch-change-requests/${requestId}/approve`
      );
      
      if (response.status === 200) {
        toast.success("Request approved successfully");
        fetchAllBatchRequests();
      } else {
        throw new Error(response.data.message || "Failed to approve request");
      }
    } catch (err) {
      console.error("Error approving request:", err);
      toast.error(err.message || "Failed to approve request");
    }
  };

  // Execute the swap
  const handleSwap = async (selectedCandidateId) => {
    try {
      const response = await axiosSecure.patch('/batch-change-requests/swap', {
        requestId1: swapModal.currentRequest._id,
        requestId2: selectedCandidateId
      });
      
      if (response.status === 200) {
        toast.success("Batch swap completed successfully!");
        document.getElementById('swap_modal').close(); 
        setSwapModal({open: false, currentRequest: null, candidates: []});
        fetchAllBatchRequests();
      }
    } catch (error) {
      console.error("Error processing swap:", error);
      toast.error(error.response?.data?.message || "Failed to process swap");
    }
  };

  // Request rejection
  const handleReject = async (requestId) => {
    try {
      const reason = prompt("Please enter rejection reason (optional):") || "";
      
      const response = await axiosSecure.patch(
        `/batch-change-requests/${requestId}/reject`,
        { reason }
      );
      
      if (response.status === 200) {
        toast.success("Request rejected successfully");
        fetchAllBatchRequests();
      } else {
        throw new Error(response.data.message || "Failed to reject request");
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
      toast.error(err.message || "Failed to reject request");
    }
  };

  return (
    <div className="p-4 w-[1100px] mx-auto">
      <h1 className="text-2xl font-bold lg:text-4xl text-center text-blue-950">
        Change Requests
      </h1>

{/* Swap Confirmation Modal - Using DaisyUI dialog */}
<dialog id="swap_modal" className="modal">
  <div className="modal-box">
    <form method="dialog">
      <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form>
    <h3 className="font-bold text-center text-lg">Batch Swap Request</h3>
    
    <div className="py-4">
      <p className="font-semibold mb-2">Student Request:</p>
      <div className="bg-gray-50 p-3 rounded mb-4">
        <p><span className="font-medium"></span> {swapModal.currentRequest?.studentInfo?.name}-<span className="font-medium">(From:</span> {swapModal.currentRequest?.currentBatchInfo?.batchName})</p>
        {/* <p><span className="font-medium">From:</span> {swapModal.currentRequest?.currentBatchInfo?.batchName}</p>
        <p><span className="font-medium">To:</span> {swapModal.currentRequest?.requestedBatchInfo?.batchName}</p> */}
      </div>
      
      <label className="font-semibold mb-2 block">Select Student to Swap With:</label>
      {swapModal.candidates.length > 0 ? (
        <>
          <select 
            className="select select-bordered w-full mb-4"
            defaultValue=""
            id="swap_candidate_select"
          >
            <option value="" disabled>Choose a student</option>
            {swapModal.candidates.map(candidate => (
              <option key={candidate._id} value={candidate._id}>
                {candidate.studentInfo?.name} (From: {candidate.currentBatchInfo?.batchName})
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              const selectElement = document.getElementById('swap_candidate_select');
              const selectedId = selectElement?.value;
              if (selectedId) {
                handleSwap(selectedId);
                document.getElementById('swap_modal').close();
              } else {
                toast.error("Please select a student to swap with");
              }
            }}
            className="btn btn-primary w-full"
          >
            Confirm Swap
          </button>
        </>
      ) : (
        <p className="text-gray-500">No suitable swap candidates found</p>
      )}
    </div>
  </div>
  <form method="dialog" className="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

      <div className="mt-8">
        <Tabs value={activeTab}>
          <TabsHeader
            className="border-gray-300 bg-transparent p-0"
            indicatorProps={{
              className:
                "bg-transparent border-b-2 border-gray-900 shadow-none rounded-none text-md font-semibold lg:text-2xl",
            }}
          >
            {tabsData.map(({ label, value }) => (
              <Tab
                key={value}
                value={value}
                onClick={() => setActiveTab(value)}
                className={`text-lg font-medium lg:text-2xl lg:font-semibold ${
                  activeTab === value
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-500"
                }`}
              >
                {label}
              </Tab>
            ))}
          </TabsHeader>
          <TabsBody>
            <TabPanel value="batch">
              <div className="card bg-base-100 shadow-sm p-4">
                <h2 className="text-xl font-semibold mb-4">
                  Pending Batch Change Requests
                </h2>
                {loading ? (
                  <p>Loading requests...</p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : pendingRequests.length === 0 ? (
                  <p>No pending batch change requests found.</p>
                ) : (
                  <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border p-2">SI</th> 
                        <th className="border p-2">Student</th>
                        <th className="border p-2">Current Batch</th>
                        <th className="border p-2">Requested Batch</th>
                        <th className="border p-2">Seats</th>
                        <th className="border p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingRequests.map((req, index) => { // Added index parameter
                        const swapCandidates = findSwapCandidates(req);
                        const canSwap = swapCandidates.length > 0;
                        
                        return (
                          <tr key={req._id} className="border">
                            <td className="border p-2 text-center">{index + 1}</td> {/* SI number */}
                            <td className="border p-2">
                              {req.studentInfo?.name || "Unknown"}
                            </td>
                            <td className="border p-2">
                              {req.currentBatchInfo?.batchName || "N/A"}
                            </td>
                            <td className="border p-2">
                              {req.requestedBatchInfo?.batchName || "N/A"}
                            </td>
                            <td className="border p-2">
                              {req.seatsAvailable ? "Available" : "Full"}
                            </td>
                            <td className="border p-2 space-x-2">
                              {/* Approve Button - Only shows when seats are available */}
                              {req.seatsAvailable && (
                                <button
                                  onClick={() => handleApprove(req._id)}
                                  className="btn btn-sm btn-primary"
                                >
                                  Approve
                                </button>
                              )}
                                
                              {/* Swap Button (when available) */}
                              {canSwap && (
                                <button
                                  onClick={() => openSwapModal(req)}
                                  className="btn btn-sm btn-warning"
                                  title="Swap with another student"
                                >
                                  <FaExchangeAlt className="inline mr-1" />
                                  Swap
                                </button>
                              )}
                                
                              {/* Reject Button */}
                              <button
                                onClick={() => handleReject(req._id)}
                                className="btn btn-sm btn-error"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            </TabPanel>
            <TabPanel value="course">
              <div className="card bg-base-100 shadow-sm p-4">
                <h2 className="text-xl font-semibold">Course Change Requests</h2>
                <p>Course change requests functionality will be implemented here.</p>
              </div>
            </TabPanel>
          </TabsBody>
        </Tabs>
      </div>
    </div>
  );
};

export default ChangeRequests;