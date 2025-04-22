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
import { FaExchangeAlt, FaInfoCircle } from "react-icons/fa";
import { HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi";
import { Link } from "react-router-dom";

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
  const [swapLoading, setSwapLoading] = useState(false);
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

  // const fetchAllBatchRequests = async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const requestsResponse = await axiosSecure.get("/batch-change-requests");
  //     const requests = requestsResponse.data;

  //     const [studentsResponse, usersResponse, batchesResponse] =
  //       await Promise.all([
  //         axiosSecure.get("/students"),
  //         axiosSecure.get("/users"),
  //         axiosSecure.get("/batches"),
  //       ]);

  //     const enrichedRequests = requests.map((request) => {
  //       const student = studentsResponse.data.find(
  //         (s) => s._id === request.studentId
  //       );
  //       const user = usersResponse.data.find((u) => u._id === student?.userId);
  //       const currentBatch = batchesResponse.data.find(
  //         (b) => b._id === student?.enrolled_batch
  //       );
  //       const requestedBatch = batchesResponse.data.find(
  //         (b) => b._id === request.requestedBatch
  //       );

  //       return {
  //         ...request,
  //         studentInfo: {
  //           name: user?.name || "Unknown",
  //           userId: student?.userId,
  //           enrolled_batch: student?.enrolled_batch,
  //         },
  //         currentBatchInfo: {
  //           batchName: currentBatch?.batchName || "N/A",
  //           _id: currentBatch?._id,
  //         },
  //         requestedBatchInfo: {
  //           batchName: requestedBatch?.batchName || "N/A",
  //           seat: requestedBatch?.seat,
  //           occupiedSeat: requestedBatch?.occupiedSeat,
  //           _id: requestedBatch?._id,
  //         },
  //         seatsAvailable: requestedBatch
  //           ? requestedBatch.seat - requestedBatch.occupiedSeat > 0
  //           : false,
  //       };
  //     });

  //     setAllRequests(enrichedRequests);
  //   } catch (err) {
  //     console.error("Error fetching requests:", err);
  //     setError("Failed to load batch change requests");
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const fetchAllBatchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      // Clear existing data while loading
      setAllRequests([]);
      setPendingRequests([]);
  
      const requestsResponse = await axiosSecure.get("/batch-change-requests");
      const requests = requestsResponse.data;
  
      // Fetch all related data in parallel
      const [studentsResponse, usersResponse, batchesResponse] = await Promise.all([
        axiosSecure.get("/students"),
        axiosSecure.get("/users"),
        axiosSecure.get("/batches"),
      ]);
  
      // Process and enrich the data
      const enrichedRequests = requests.map((request) => {
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
  
      // Update both states atomically
      setAllRequests(enrichedRequests);
      setPendingRequests(enrichedRequests.filter(req => req.status === "Pending"));
      
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to load batch change requests");
      // Clear states on error
      setAllRequests([]);
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Updated handleSwap function
  const handleSwap = async (selectedCandidateId) => {
    setSwapLoading(true);
    try {
      const response = await axiosSecure.patch("/batch-change-requests/swap", {
        requestId1: swapModal.currentRequest._id,
        requestId2: selectedCandidateId,
      });
  
      if (response.status === 200) {
        toast.success("Batch swap completed successfully!");
        
        // Close modal but keep loading state
        document.getElementById("swap_modal").close();
        setSwapModal({ open: false, currentRequest: null, candidates: [] });
        
        // Add artificial delay to ensure smooth transition
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refetch with proper loading states
        await fetchAllBatchRequests();
        
     
      }
    } catch (error) {
      console.error("Error processing swap:", error);
      toast.error(error.response?.data?.message || "Failed to process swap");
    } finally {
      setSwapLoading(false);
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

      const batchToCourseMap = {};
      batches.forEach((batch) => {
        batchToCourseMap[batch._id] = batch.course_id;
      });

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

  const findSwapCandidates = (request) => {
    return pendingRequests.filter(
      (req) =>
        req._id !== request._id &&
        req.currentBatchInfo?._id === request.requestedBatchInfo?._id &&
        req.requestedBatchInfo?._id === request.currentBatchInfo?._id
    );
  };

  const openSwapModal = (request) => {
    const candidates = findSwapCandidates(request);
    setSwapModal({
      open: true,
      currentRequest: request,
      candidates: candidates,
    });
    document.getElementById("swap_modal").showModal();
  };

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

  // const handleSwap = async (selectedCandidateId) => {
  //   setSwapLoading(true);
  //   try {
  //     const response = await axiosSecure.patch("/batch-change-requests/swap", {
  //       requestId1: swapModal.currentRequest._id,
  //       requestId2: selectedCandidateId,
  //     });

  //     if (response.status === 200) {
  //       toast.success("Batch swap completed successfully!");
  //       document.getElementById("swap_modal").close();
  //       setSwapModal({ open: false, currentRequest: null, candidates: [] });
  //       await fetchAllBatchRequests();
  //     }
  //   } catch (error) {
  //     console.error("Error processing swap:", error);
  //     toast.error(error.response?.data?.message || "Failed to process swap");
  //   } finally {
  //     setSwapLoading(false);
  //   }
  // };

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
      const batchesResponse = await axiosSecure.get("/batches");
      const allBatches = batchesResponse.data;

      const matchingBatches = allBatches.filter(
        (batch) => batch.course_id === request.requestedCourse
      );

      const availableBatches = matchingBatches.filter(
        (batch) =>
          ["Upcoming", "Ongoing"].includes(batch.status) &&
          batch.seat > batch.occupiedSeat
      );

      setBatchModal({
        open: true,
        currentRequest: request,
        availableBatches,
      });
      document.getElementById("batch_assign_modal").showModal();
    } catch (error) {
      console.error("Error in batch assignment:", error);
      toast.error("Failed to load available batches");
    }
  };

  const handleBatchAssign = async () => {
    try {
      const selectElement = document.getElementById("batch_select");
      const selectedBatchId = selectElement.value;

      if (!selectedBatchId) {
        toast.error("Please select a batch");
        return;
      }

      selectElement.disabled = true;
      document.querySelector(
        "#batch_assign_modal .btn-primary"
      ).disabled = true;

      const response = await axiosSecure.patch(
        `/course-change-requests/${batchModal.currentRequest._id}/approve`,
        { batchId: selectedBatchId }
      );

      toast.success(response.data.message);
      document.getElementById("batch_assign_modal").close();
      fetchAllCourseRequests();
    } catch (error) {
      console.error("Assignment error:", error);
      if (error.response?.data?.message?.includes("already processed")) {
        toast.error("This request was already processed. Refreshing data...");
        document.getElementById("batch_assign_modal").close();
        fetchAllCourseRequests();
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to process approval. Please try again.");
      }
    } finally {
      const selectElement = document.getElementById("batch_select");
      if (selectElement) selectElement.disabled = false;
      const approveBtn = document.querySelector(
        "#batch_assign_modal .btn-primary"
      );
      if (approveBtn) approveBtn.disabled = false;
    }
  };

  const handleRejectCourse = async (requestId) => {
    try {
      const reason = window.prompt("Please enter rejection reason (optional):") || "";
      if (reason === null) return;
  
      setLoading(true);
      
      const response = await axiosSecure.patch(
        `/course-change-requests/${requestId}/reject`,
        { reason }
      );
  
      if (response.data.success) {
        toast.success(response.data.message);
        // Optimistic update - remove the rejected request immediately
        setPendingCourseRequests(prev => 
          prev.filter(req => req._id !== requestId)
        );
      } else {
        // Handle specific error cases
        if (response.data.code === "REQUEST_ALREADY_PROCESSED") {
          // Request was already processed elsewhere - refresh the list
          toast.info("Request status was updated elsewhere. Refreshing data...");
          await fetchAllCourseRequests();
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error("Rejection error:", error);
      if (error.response) {
        if (error.response.status === 409) {
          // Conflict - request already processed
          toast.info("Request was already processed. Refreshing data...");
          await fetchAllCourseRequests();
        } else {
          toast.error(
            error.response.data?.message || "Failed to reject request"
          );
        }
      } else {
        toast.error("Network error - please check your connection");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 w-[1100px] mx-auto">
      <div className="breadcrumbs text-md mt-4 mb-4">
        <ul className="flex items-center space-x-2 text-gray-600">
          <li>
            <Link
              to="/dashboard"
              className="text-blue-600 hover:underline font-medium"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/courseAssignment"
              className="text-blue-600 hover:underline font-medium"
            >
              Batch Assignment
            </Link>
          </li>
          <li className="text-gray-500 font-medium">Change Requests</li>
        </ul>
      </div>

      <h1 className="text-xl font-bold lg:text-xl text-center text-gray-800 mb-6">
        Change Requests Management
      </h1>

      {/* Swap Modal */}
      <dialog id="swap_modal" className="modal">
        <div className="modal-box max-w-md bg-white rounded-lg shadow-xl">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="text-xl font-semibold text-gray-800">
              Batch Swap Request
            </h3>
            <button
              onClick={() => document.getElementById("swap_modal").close()}
              className="text-gray-500 hover:text-gray-700"
              disabled={swapLoading}
            >
              ✕
            </button>
          </div>

          <div className="py-4 space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <FaInfoCircle className="text-blue-600" />
                Student Request Details
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Student:</span>{" "}
                  {swapModal.currentRequest?.studentInfo?.name}
                </p>
                <p>
                  <span className="font-medium">From:</span>{" "}
                  <span className="bg-blue-100 px-2 py-1 rounded">
                    {swapModal.currentRequest?.currentBatchInfo?.batchName}
                  </span>
                </p>
                <p>
                  <span className="font-medium">To:</span>{" "}
                  <span className="bg-blue-100 px-2 py-1 rounded">
                    {swapModal.currentRequest?.requestedBatchInfo?.batchName}
                  </span>
                </p>
              </div>
            </div>

            {swapLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                <p className="mt-4 text-sm text-gray-600">Processing swap...</p>
              </div>
            ) : swapModal.candidates.length > 0 ? (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Student to Swap With:
                  </label>
                  <select
                    className="select select-bordered w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue=""
                    id="swap_candidate_select"
                    disabled={swapLoading}
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
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() =>
                      document.getElementById("swap_modal").close()
                    }
                    className="btn btn-ghost"
                    disabled={swapLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const selectElement = document.getElementById(
                        "swap_candidate_select"
                      );
                      const selectedId = selectElement?.value;
                      if (selectedId) {
                        handleSwap(selectedId);
                      } else {
                        toast.error("Please select a student to swap with");
                      }
                    }}
                    className="btn btn-primary flex items-center gap-2"
                    disabled={swapLoading}
                  >
                    {swapLoading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <>
                        <FaExchangeAlt />
                        Confirm Swap
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 inline-block">
                  <p className="text-yellow-700 flex items-center gap-2">
                    <FaInfoCircle />
                    No suitable swap candidates found
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Batch Assignment Modal */}
      <dialog id="batch_assign_modal" className="modal">
        <div className="modal-box max-w-md bg-white rounded-lg shadow-xl">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="text-xl font-semibold text-gray-800">
              Assign New Batch
            </h3>
            <button
              onClick={() =>
                document.getElementById("batch_assign_modal").close()
              }
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Student:</span>{" "}
                {batchModal.currentRequest?.studentInfo?.name}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Requested Course:</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  {batchModal.currentRequest?.requestedCourseInfo?.courseName}
                </span>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Available Batches
                </span>
              </label>
              <select
                className="select select-bordered w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                id="batch_select"
              >
                <option value="" disabled>
                  Select a batch
                </option>
                {batchModal.availableBatches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.batchName} ({batch.status}) - Seats:{" "}
                    {batch.seat - batch.occupiedSeat}/{batch.seat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() =>
                  document.getElementById("batch_assign_modal").close()
                }
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchAssign}
                className="btn btn-primary flex items-center gap-2"
              >
                <HiOutlineCheckCircle className="text-lg" />
                Assign Batch
              </button>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <div className="mt-6">
        <Tabs value={activeTab}>
          <TabsHeader
            className="bg-transparent p-0 border-b border-gray-200"
            indicatorProps={{
              className:
                "bg-transparent border-b-2 border-blue-500 shadow-none rounded-none",
            }}
          >
            {tabsData.map(({ label, value }) => (
              <Tab
                key={value}
                value={value}
                onClick={() => setActiveTab(value)}
                className={`px-4 py-2 font-medium text-gray-600 ${
                  activeTab === value
                    ? "text-blue-950 border-b-2 border-blue-950"
                    : "hover:text-gray-800"
                }`}
              >
                {label}
              </Tab>
            ))}
          </TabsHeader>
          <TabsBody>
            <TabPanel value="batch">
              <div className="card bg-white shadow-sm p-4 border border-gray-100 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-md font-semibold text-gray-800">
                    Pending Batch Change Requests
                  </h2>
                  <span className="badge badge-primary">
                    {pendingRequests.length} Pending
                  </span>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center h-40">
                    <span className="loading loading-ring loading-xl"></span>
                  </div>
                ) : error ? (
                  <div className="alert alert-error shadow-lg">
                    <div>
                      <HiOutlineXCircle className="text-xl" />
                      <span>{error}</span>
                    </div>
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No pending batch change requests found.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                     {swapLoading && (
      <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )}
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-blue-950">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-lg">
                            Index
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Current Batch
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Requested Batch
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Availability
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-white uppercase tracking-wider rounded-tr-lg">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingRequests.map((req, index) => {
                          const swapCandidates = findSwapCandidates(req);
                          const canSwap = swapCandidates.length > 0;

                          return (
                            <tr
                              key={req._id}
                              className={`hover:bg-blue-50 ${
                                swapLoading ? "opacity-70" : ""
                              }`}
                            >
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                {index + 1}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="">
                                    <div className="text-sm font-medium text-gray-900">
                                      {req.studentInfo?.name || "Unknown"}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {req.studentInfo?.email || ""}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  {req.currentBatchInfo?.batchName || "N/A"}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {req.requestedBatchInfo?.batchName || "N/A"}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                {req.seatsAvailable ? (
                                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Available
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    Full
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  {req.seatsAvailable && (
                                    <button
                                      onClick={() => handleApprove(req._id)}
                                      disabled={swapLoading}
                                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${
                                        swapLoading
                                          ? "bg-green-400"
                                          : "bg-green-600 hover:bg-green-700"
                                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                                    >
                                      {swapLoading ? "..." : "Approve"}
                                    </button>
                                  )}

                                  {canSwap && (
                                    <button
                                      onClick={() => openSwapModal(req)}
                                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${
                                        swapLoading
                                          ? "bg-yellow-400"
                                          : "bg-yellow-500 hover:bg-yellow-600"
                                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500`}
                                      title="Swap with another student"
                                      disabled={swapLoading}
                                    >
                                      {swapLoading ? (
                                        <span className="loading loading-spinner loading-xs"></span>
                                      ) : (
                                        <FaExchangeAlt className="h-4 w-4" />
                                      )}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleReject(req._id)}
                                    disabled={swapLoading}
                                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${
                                      swapLoading
                                        ? "bg-red-400"
                                        : "bg-red-600 hover:bg-red-700"
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                                  >
                                    {swapLoading ? "..." : "Reject"}
                                  </button>
                                </div>
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
              <div className="card bg-white shadow-sm p-4 border border-gray-100 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-semibold text-gray-800">
                    Pending Course Change Requests
                  </h2>
                  <span className="badge badge-primary">
                    {pendingCourseRequests.length} Pending
                  </span>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center h-40">
                    <span className="loading loading-ring loading-xl"></span>
                  </div>
                ) : error ? (
                  <div className="alert alert-error shadow-lg">
                    <div>
                      <HiOutlineXCircle className="text-xl" />
                      <span>{error}</span>
                    </div>
                  </div>
                ) : pendingCourseRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No pending course change requests found.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-blue-950">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-lg">
                            #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Current Course
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Requested Course
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Availability
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-white uppercase tracking-wider rounded-tr-lg">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingCourseRequests.map((req, index) => (
                          <tr key={req._id} className="hover:bg-blue-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                              {index + 1}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10"></div>
                                <div className="">
                                  <div className="text-sm font-medium text-gray-900">
                                    {req.studentInfo?.name || "Unknown"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {req.studentInfo?.email || ""}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                {req.currentCourseInfo?.courseName || "N/A"}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {req.requestedCourseInfo?.courseName || "N/A"}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {req.hasAvailableBatches ? (
                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Available
                                </span>
                              ) : (
                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  Unavailable
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => openBatchAssignModal(req)}
                                  className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${
                                    req.hasAvailableBatches
                                      ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                                      : "bg-gray-400 cursor-not-allowed"
                                  } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                                  disabled={!req.hasAvailableBatches}
                                  title={
                                    !req.hasAvailableBatches
                                      ? "No batches available"
                                      : "Assign batch"
                                  }
                                >
                                  Assign Batch
                                </button>
                                <button
                                  onClick={() => handleRejectCourse(req._id)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  Reject
                                </button>
                              </div>
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
