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
  const [pendingCourseRequests, setPendingCourseRequests] = useState([]);
  const [availableBatchesMap, setAvailableBatchesMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [swapModal, setSwapModal] = useState({
    open: false,
    currentRequest: null,
    candidates: [],
  });
  const [batchModal, setBatchModal] = useState({
    open: false,
    currentRequest: null,
    availableBatches: [],
  });

  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    if (activeTab === "batch") {
      fetchAllBatchRequests();
    } else if (activeTab === "course") {
      fetchAllCourseRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    const filtered = allRequests.filter((req) => req.status === "Pending");
    setPendingRequests(filtered);
  }, [allRequests]);

  const fetchAllBatchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const requestsResponse = await axiosSecure.get("/batch-change-requests");
      const requests = requestsResponse.data;

      const [studentsResponse, usersResponse, batchesResponse] =
        await Promise.all([
          axiosSecure.get("/students"),
          axiosSecure.get("/users"),
          axiosSecure.get("/batches"),
        ]);

      const enrichedRequests = requests.map((request) => {
        const student = studentsResponse.data.find(
          (s) => s._id === request.studentId
        );
        const user = usersResponse.data.find((u) => u._id === student?.userId);
        const currentBatch = batchesResponse.data.find(
          (b) => b._id === student?.enrolled_batch
        );
        const requestedBatch = batchesResponse.data.find(
          (b) => b._id === request.requestedBatch
        );

        return {
          ...request,
          studentInfo: {
            name: user?.name || "Unknown",
            userId: student?.userId,
            enrolled_batch: student?.enrolled_batch,
          },
          currentBatchInfo: {
            batchName: currentBatch?.batchName || "N/A",
            _id: currentBatch?._id,
          },
          requestedBatchInfo: {
            batchName: requestedBatch?.batchName || "N/A",
            seat: requestedBatch?.seat,
            occupiedSeat: requestedBatch?.occupiedSeat,
            _id: requestedBatch?._id,
          },
          seatsAvailable: requestedBatch
            ? requestedBatch.seat - requestedBatch.occupiedSeat > 0
            : false,
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

  const fetchAllCourseRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        courseRequestsResponse,
        studentsResponse,
        usersResponse,
        coursesResponse,
        batchesResponse,
      ] = await Promise.all([
        axiosSecure.get("/course-change-requests"),
        axiosSecure.get("/students"),
        axiosSecure.get("/users"),
        axiosSecure.get("/courses"),
        axiosSecure.get("/batches"),
      ]);

      const requests = courseRequestsResponse.data;
      const students = studentsResponse.data;
      const users = usersResponse.data;
      const courses = coursesResponse.data;
      const batches = batchesResponse.data;

      // Create map of batches to courses
      const batchToCourseMap = {};
      batches.forEach((batch) => {
        batchToCourseMap[batch._id] = batch.course_id;
      });

      // Create map of available batches for each course
      const availableBatchesMap = {};
      batches.forEach((batch) => {
        if (
          ["Upcoming", "Ongoing"].includes(batch.status) &&
          batch.seat > batch.occupiedSeat
        ) {
          if (!availableBatchesMap[batch.course_id]) {
            availableBatchesMap[batch.course_id] = [];
          }
          availableBatchesMap[batch.course_id].push(batch);
        }
      });

      const enrichedRequests = requests.map((request) => {
        const student = students.find((s) => s._id === request.studentId);
        const user = users.find((u) => u._id === student?.userId);

        // Find current course via enrolled batch
        let currentCourse = null;
        if (student?.enrolled_batch) {
          const courseId = batchToCourseMap[student.enrolled_batch];
          currentCourse = courses.find((c) => c._id === courseId);
        }

        const requestedCourse = courses.find(
          (c) => c._id === request.requestedCourse
        );

        return {
          ...request,
          studentInfo: {
            name: user?.name || "Unknown",
            userId: student?.userId,
          },
          currentCourseInfo: {
            courseName: currentCourse?.courseName || "N/A",
            _id: currentCourse?._id,
          },
          requestedCourseInfo: {
            courseName: requestedCourse?.courseName || "N/A",
            _id: requestedCourse?._id,
          },
          hasAvailableBatches: Boolean(
            availableBatchesMap[request.requestedCourse]?.length
          ),
        };
      });

      setPendingCourseRequests(
        enrichedRequests.filter((req) => req.status === "Pending")
      );
      setAvailableBatchesMap(availableBatchesMap);
    } catch (err) {
      console.error("Error fetching course requests:", err);
      setError("Failed to load course change requests");
    } finally {
      setLoading(false);
    }
  };

  // Find all potential swap candidates for a request
  const findSwapCandidates = (request) => {
    return pendingRequests.filter(
      (req) =>
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
      candidates: candidates,
    });
    document.getElementById("swap_modal").showModal();
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
      const response = await axiosSecure.patch("/batch-change-requests/swap", {
        requestId1: swapModal.currentRequest._id,
        requestId2: selectedCandidateId,
      });

      if (response.status === 200) {
        toast.success("Batch swap completed successfully!");
        document.getElementById("swap_modal").close();
        setSwapModal({ open: false, currentRequest: null, candidates: [] });
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
  

  const openBatchAssignModal = async (request) => {
    try {
      // 1. Fetch all batches
      const batchesResponse = await axiosSecure.get("/batches");
      const allBatches = batchesResponse.data;

      // 2. Filter batches that match the requested course
      const matchingBatches = allBatches.filter(
        (batch) => batch.course_id === request.requestedCourse
      );

      // 3. Further filter for upcoming or ongoing batches and check seat availability
      const availableBatches = matchingBatches.filter(
        (batch) =>
          ["Upcoming", "Ongoing"].includes(batch.status) &&
          batch.seat > batch.occupiedSeat // Ensure available seats
      );

      setBatchModal({
        open: true,
        currentRequest: request,
        availableBatches,
      });
      document.getElementById("batch_assign_modal").showModal();

      // Log for debugging
      console.log("All batches:", allBatches);
      console.log("Matching batches:", matchingBatches);
      console.log("Available batches:", availableBatches);
    } catch (error) {
      console.error("Error in batch assignment:", error);
      toast.error("Failed to load available batches");
    }
  };

  // const handleBatchAssign = async () => {
  //   try {
  //     const selectElement = document.getElementById("batch_select");
  //     const selectedBatchId = selectElement.value;

  //     if (!selectedBatchId) {
  //       toast.error("Please select a batch");
  //       return;
  //     }

  //     const response = await axiosSecure.patch(
  //       `/course-change-requests/${batchModal.currentRequest._id}/assign-batch`,
  //       { batchId: selectedBatchId }
  //     );

  //     if (response.status === 200) {
  //       toast.success("Batch assigned successfully");
  //       document.getElementById("batch_assign_modal").close();
  //       fetchAllCourseRequests(); // Refresh the list
  //     }
  //   } catch (error) {
  //     console.error("Error assigning batch:", error);
  //     toast.error(error.response?.data?.message || "Failed to assign batch");
  //   }
  // };

  const handleBatchAssign = async () => {
    try {
      const selectElement = document.getElementById("batch_select");
      const selectedBatchId = selectElement.value;
  
      if (!selectedBatchId) {
        toast.error("Please select a batch");
        return;
      }
  
      // Disable button during processing
      selectElement.disabled = true;
      document.querySelector('#batch_assign_modal .btn-primary').disabled = true;
  
      const response = await axiosSecure.patch(
        `/course-change-requests/${batchModal.currentRequest._id}/approve`,
        { batchId: selectedBatchId }
      );
  
      toast.success(response.data.message);
      document.getElementById("batch_assign_modal").close();
      fetchAllCourseRequests();
  
    } catch (error) {
      console.error("Assignment error:", error);
      
      // Specific handling for already processed requests
      if (error.response?.data?.message?.includes("already processed")) {
        toast.error("This request was already processed. Refreshing data...");
        document.getElementById("batch_assign_modal").close();
        fetchAllCourseRequests();
      } 
      else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } 
      else {
        toast.error("Failed to process approval. Please try again.");
      }
    } finally {
      // Re-enable inputs
      const selectElement = document.getElementById("batch_select");
      if (selectElement) selectElement.disabled = false;
      const approveBtn = document.querySelector('#batch_assign_modal .btn-primary');
      if (approveBtn) approveBtn.disabled = false;
    }
  };
  
  const handleRejectCourse = async (requestId) => {
    try {
      const reason = prompt("Please enter rejection reason (optional):") || "";
  
      if (reason === null) return; // User cancelled
  
      const response = await axiosSecure.patch(
        `/course-change-requests/${requestId}/reject`,
        { reason }
      );
  
      if (response.status === 200) {
        toast.success(response.data.message);
        fetchAllCourseRequests();
      }
    } catch (error) {
      console.error("Rejection error:", error);
      toast.error(error.response?.data?.message || "Failed to reject request");
    }
  };

  return (
    <div className="p-4 w-[1100px] mx-auto">
      <h1 className="text-2xl font-bold lg:text-4xl text-center text-blue-950">
        Change Requests
      </h1>

      {/* Swap Confirmation Modal  */}
      <dialog id="swap_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-center text-lg">Batch Swap Request</h3>

          <div className="py-4">
            <p className="font-semibold mb-2">Student Request:</p>
            <div className="bg-gray-50 p-3 rounded mb-4">
              <p>
                <span className="font-medium"></span>{" "}
                {swapModal.currentRequest?.studentInfo?.name}-
                <span className="font-medium">(From:</span>{" "}
                {swapModal.currentRequest?.currentBatchInfo?.batchName})
              </p>
              {/* <p><span className="font-medium">From:</span> {swapModal.currentRequest?.currentBatchInfo?.batchName}</p>
        <p><span className="font-medium">To:</span> {swapModal.currentRequest?.requestedBatchInfo?.batchName}</p> */}
            </div>

            <label className="font-semibold mb-2 block">
              Select Student to Swap With:
            </label>
            {swapModal.candidates.length > 0 ? (
              <>
                <select
                  className="select select-bordered w-full mb-4"
                  defaultValue=""
                  id="swap_candidate_select"
                >
                  <option value="" disabled>
                    Choose a student
                  </option>
                  {swapModal.candidates.map((candidate) => (
                    <option key={candidate._id} value={candidate._id}>
                      {candidate.studentInfo?.name} (From:{" "}
                      {candidate.currentBatchInfo?.batchName})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const selectElement = document.getElementById(
                      "swap_candidate_select"
                    );
                    const selectedId = selectElement?.value;
                    if (selectedId) {
                      handleSwap(selectedId);
                      document.getElementById("swap_modal").close();
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

      {/* Batch Assignment Modal for Course Change */}
      {/* Assign Batch Modal */}
      <dialog id="batch_assign_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg text-center mb-4">Assign Batch</h3>

          <div className="mb-4">
            <p>
              <strong>Requested Course:</strong>{" "}
              {batchModal.currentRequest?.requestedCourseInfo?.courseName}
            </p>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Assign Batch</span>
            </label>
            <select className="select select-bordered w-full" id="batch_select">
              <option value="" disabled>
                Choose a batch
              </option>
              {batchModal.availableBatches.map((batch) => (
                
                <option key={batch._id} value={batch._id}>
                  {batch.batchName} ({batch.status})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleBatchAssign}>
              Assign Batch
            </button>
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
                  <div className="flex items-center justify-center h-40">
                    <span className="loading loading-ring loading-xl"></span>
                  </div>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : pendingRequests.length === 0 ? (
                  <p>No pending batch change requests found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border p-2">Student</th>
                          <th className="border p-2">Current Batch</th>
                          <th className="border p-2">Requested Batch</th>
                          <th className="border p-2">Seats</th>
                          <th className="border p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingRequests.map((req) => {
                          const swapCandidates = findSwapCandidates(req);
                          const canSwap = swapCandidates.length > 0;

                          return (
                            <tr key={req._id} className="border">
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
    <h2 className="text-xl font-semibold mb-4">
      Pending Course Change Requests
    </h2>
    {loading ? (
      <div className="flex items-center justify-center h-40">
        <span className="loading loading-ring loading-xl"></span>
      </div>
    ) : error ? (
      <p className="text-red-500">{error}</p>
    ) : pendingCourseRequests.length === 0 ? (
      <p>No pending course change requests found.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">SI</th>
              <th className="border p-2">Student</th>
              <th className="border p-2">Current Course</th>
              <th className="border p-2">Requested Course</th>
              <th className="border p-2">Batch Available</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingCourseRequests.map((req, index) => (
              <tr key={req._id} className="border">
                <td className="border p-2 text-center">{index + 1}</td>
                <td className="border p-2">
                  {req.studentInfo?.name || "Unknown"}
                </td>
                <td className="border p-2">
                  {req.currentCourseInfo?.courseName || "N/A"}
                </td>
                <td className="border p-2">
                  {req.requestedCourseInfo?.courseName || "N/A"}
                </td>
                <td className={`border p-2 text-center ${
                  req.hasAvailableBatches
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }`}>
                  {req.hasAvailableBatches ? "Available" : "Unavailable"}
                </td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => openBatchAssignModal(req)}
                    className="btn btn-sm btn-primary"
                    disabled={!req.hasAvailableBatches}
                    title={!req.hasAvailableBatches ? "No batches available" : ""}
                  >
                    Assign Batch
                  </button>
                  <button
                    onClick={() => handleRejectCourse(req._id)}
                    className="btn btn-sm btn-error"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
</TabPanel>
          </TabsBody>
        </Tabs>
      </div>
    </div>
  );
};

export default ChangeRequests;
