import React, { useEffect, useState } from "react";
import { FaPlus, FaEye, FaFileArchive } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import CreateBatch from "./CreateBatch";
import UpdateBatch from "./UpdateBatch";
import { Link } from "react-router-dom";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const axiosSecure = useAxiosSecure();

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosSecure.get("/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, [axiosSecure]);

  // Fetch instructors and users using React Query
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users");
      return res.data;
    },
  });

  const { data: instructors = [], isLoading: instructorsLoading } = useQuery({
    queryKey: ["instructors"],
    queryFn: async () => {
      const res = await axiosSecure.get("/instructors");
      return res.data.filter((instructor) => instructor.status === "Approved");
    },
  });

  // Combine instructors and users
  const combinedInstructors = React.useMemo(() => {
    return instructors.map((instructor) => {
      const user = users.find((user) => user._id === instructor.userId);
      return {
        ...instructor,
        name: user ? user.name : "Unknown",
      };
    });
  }, [instructors, users]);


// Fetch batches with isDeleted filter and sort by createdAt
useEffect(() => {
  const fetchBatches = async () => {
    try {
      const response = await axiosSecure.get("/batches");
      // Filter out deleted batches and sort by createdAt (newest first)
      const activeBatches = response.data
        .filter(batch => !batch.isDeleted)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Update batches with instructor names
      const updatedBatches = activeBatches.map((batch) => {
        const instructorNames = batch.instructors || [];
        return {
          ...batch,
          instructors: instructorNames,
        };
      });

      setBatches(updatedBatches);
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchBatches();
}, [axiosSecure]);

const refreshBatches = async () => {
  try {
    const response = await axiosSecure.get("/batches");
    // Filter out deleted batches and sort by createdAt (newest first)
    const activeBatches = response.data
      .filter(batch => !batch.isDeleted)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const updatedBatches = activeBatches.map((batch) => {
      const instructorNames = batch.instructors || [];
      return {
        ...batch,
        instructors: instructorNames,
      };
    });
    setBatches(updatedBatches);
  } catch (error) {
    console.error("Error refreshing batches:", error);
  }
};

  // Archive batch function
  const handleArchive = async (batchId) => {
    try {
      const response = await axiosSecure.patch(`/batches/${batchId}`, {
        isDeleted: true
      });

      if (response.data) {
        toast.success("Batch archived successfully");
        // Remove the archived batch from local state
        setBatches(prevBatches => prevBatches.filter(batch => batch._id !== batchId));
      } else {
        toast.error("Failed to archive batch");
      }
    } catch (error) {
      console.error("Error archiving batch:", error);
      toast.error("Failed to archive batch");
    }
  };

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const courseMap = courses.reduce((acc, course) => {
    acc[course._id] = course.courseName;
    return acc;
  }, {});

  const filteredBatches = batches.filter((batch) => {
    const courseName = courseMap[batch.course_id] || "";
    const batchName = batch.batchName || "";
    const status = batch.status || "";

    const matchesSearch =
      courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batchName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus
      ? status.toLowerCase() === selectedStatus.toLowerCase()
      : true;

    return matchesSearch && matchesStatus;
  });

  const currentItems = filteredBatches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);

  return (
    <div className="w-[1100px] mx-auto flex flex-col">
      <div className="overflow-x-auto mt-6 grow">
        <div className="flex justify-between">
          <div className="join">
            <div>
              <input
                className="input input-bordered join-item"
                placeholder="Search by course or batch"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="select select-bordered join-item"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Filter by status</option>
              <option value="Soon to be started">Soon to be started</option>
              <option value="On going">On going</option>
              <option value="Completed">Completed</option>
            </select>
            <div className="indicator">
              <button className="btn join-item bg-blue-950 text-white">
                Search
              </button>
            </div>
          </div>

          <button
            className="btn btn-outline"
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus /> Create Batch
          </button>
        </div>

        <div className="bg-white rounded-lg mt-6 shadow-lg border border-gray-100 w-full">
          {loading || usersLoading || instructorsLoading ? (
            <div className="animate-pulse w-full">
              <table className="w-full">
                <thead className="bg-blue-950">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                      Index
                    </th>
                    <th className="px-8 py-3 text-left text-sm font-semibold text-white tracking-wider">
                      Batch
                    </th>
                    <th className="px-8 py-3 text-left text-sm font-semibold text-white tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-3 text-left text-sm font-semibold text-white tracking-wider">
                      Instructor
                    </th>
                    <th className="px-8 py-3 text-left text-sm font-semibold text-white tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[...Array(itemsPerPage)].map((_, index) => (
                    <tr key={index} className="hover:bg-blue-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="h-5 bg-gray-100 rounded w-8"></div>
                      </td>
                      <td className="px-8 py-3 whitespace-nowrap">
                        <div className="h-5 bg-gray-100 rounded w-32"></div>
                      </td>
                      <td className="px-8 py-3 whitespace-nowrap">
                        <div className="h-5 bg-gray-100 rounded w-20"></div>
                      </td>
                      <td className="px-8 py-3">
                        <div className="h-5 bg-gray-100 rounded w-40"></div>
                      </td>
                      <td className="px-8 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-6">
                          <div className="h-5 w-5 bg-gray-100 rounded-full"></div>
                          <div className="h-5 w-5 bg-gray-100 rounded-full"></div>
                          <div className="h-5 w-5 bg-gray-100 rounded-full"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-blue-950">
                <tr>
                  <th className="px-8 py-3 text-left text-sm font-semibold text-white tracking-wider">
                    Index
                  </th>
                  <th className="px-8 py-3 text-left text-sm font-semibold text-white tracking-wider">
                    Batch
                  </th>
                  <th className="px-8 py-3 text-left text-sm font-semibold text-white tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-3 text-left text-sm font-semibold text-white tracking-wider">
                    Instructor
                  </th>
                  <th className="px-8 py-3 text-left text-sm font-semibold text-white tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-8 py-8 text-center text-gray-500 text-sm"
                    >
                      No batches available. Create a new batch to get started.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((batch, index) => (
                    <tr
                      key={batch._id}
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      <td className="px-8 py-3 whitespace-nowrap text-sm text-gray-700">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-8 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {batch.batchName}
                      </td>
                      <td className="px-8 py-3 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            batch.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : batch.status === "Inactive"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {batch.status}
                        </span>
                      </td>
                      <td className="px-8 py-3 text-sm text-gray-700 max-w-xs truncate">
                        {batch.instructors.join(", ") || (
                          <span className="text-gray-400 italic">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-3 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center space-x-6">
                          <Link
                            to={`/dashboard/batchDetails/${batch._id}`}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View Details"
                          >
                            <FaEye className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedBatchId(batch._id);
                              setShowUpdateModal(true);
                            }}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Edit Batch"
                          >
                            <MdEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleArchive(batch._id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Archive Batch"
                          >
                            <FaFileArchive className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {filteredBatches.length > itemsPerPage && (
        <div className="flex justify-end join my-4">
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
      )}

      {/* Create Batch Modal */}
      <dialog
        id="create_modal"
        className="modal modal-bottom sm:modal-middle"
        open={showCreateModal}
      >
        <div className="modal-box">
          <button
            className="absolute top-2 right-2 btn btn-sm btn-circle"
            onClick={() => setShowCreateModal(false)}
          >
            <RxCross2 />
          </button>
          <CreateBatch
            onBatchCreated={() => {
              refreshBatches();
              setShowCreateModal(false);
            }}
          />
        </div>
      </dialog>

      {/* Update Batch Modal */}
      <dialog
        id="update_modal"
        className="modal modal-bottom sm:modal-middle"
        open={showUpdateModal}
      >
        <div className="modal-box">
          <button
            className="absolute top-2 right-2 btn btn-sm btn-circle"
            onClick={() => setShowUpdateModal(false)}
          >
            <RxCross2 />
          </button>
          {selectedBatchId && (
            <UpdateBatch
              batchId={selectedBatchId}
              onBatchUpdated={() => {
                refreshBatches();
                setShowUpdateModal(false);
              }}
            />
          )}
        </div>
      </dialog>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default BatchManagement;