import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { FaFileArchive } from "react-icons/fa";
import CreateBatch from "./CreateBatch";

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  const [selectedStatus, setSelectedStatus] = useState(""); // State for status filter

  useEffect(() => {
    fetchBatches();
    fetchCourses();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await fetch("http://localhost:5000/batches");
      const data = await response.json();
      setBatches(data);
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch("http://localhost:5000/courses");
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // Handle page change
  const totalPages = Math.ceil(batches.length / itemsPerPage);
  const currentItems = batches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Mapping course IDs to names
  const courseMap = courses.reduce((acc, course) => {
    acc[course._id] = course.courseName;
    return acc;
  }, {});

  // Search and filter logic
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

  const handleCloseModal = () => {
    document.getElementById("my_modal_5").close();
    fetchBatches(); // Refresh the batch list after creating a new batch
  };

  return (
    <div className="flex flex-col h-screen w-[1100px] mx-auto">
      <div className="overflow-x-auto mt-8 flex-grow">
        <div className="flex justify-between">
          <div className="join">
            <div>
              <input
                className="input input-bordered join-item"
                placeholder="Search by course or batch"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // Update search query
              />
            </div>
            <select
              className="select select-bordered join-item"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)} // Update selected status filter
            >
              <option value="">Filter by status</option>
              <option value="Soon to be started">Soon to be started</option>
              <option value="On going">On going</option>
              <option value="Completed">Completed</option>
            </select>
            <div className="indicator">
              <button className="btn join-item">Search</button>
            </div>
          </div>

          <button
            className="btn btn-outline"
            onClick={() => document.getElementById("my_modal_5").showModal()}
          >
            <FaPlus /> Create Batch
          </button>
        </div>

        <div className="overflow-x-auto w-[1100px]">
          {loading ? (
            <div className="animate-pulse w-full mt-8 mx-auto">
              <table className="table w-[1000px] mx-auto">
                <thead className="bg-gray-200">
                  <tr className="text-lg font-medium">
                    <th>#</th>
                    <th>Batch</th>
                    <th>Course Name</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(itemsPerPage)].map((_, index) => (
                    <tr key={index}>
                      <td colSpan="5">
                        <div className="h-10 bg-gray-100 rounded-lg"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="text-center mt-8 text-lg text-gray-500">
              No batches found for the applied filters.
            </div>
          ) : (
            <table className="table w-[1000px] mt-8">
              <thead className="bg-blue-950 text-white">
                <tr className="text-lg font-medium">
                  <th>Index</th>
                  <th>Batch</th>
                  <th>Course Name</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                ).map((batch, index) => (
                  <tr key={batch._id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{batch.batchName}</td>
                    <td>{courseMap[batch.course_id] || "Unknown Course"}</td>
                    <td>{batch.status}</td>
                    <td className="flex justify-center gap-4">
                      <button>
                        <MdEdit />
                      </button>
                      <button>
                        <FaFileArchive />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

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

      {/* Modal Structure */}
      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <CreateBatch onBatchCreated={fetchBatches} />
          <div className="modal-action">
            <button className="btn" onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default BatchManagement;
