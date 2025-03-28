import React, { useEffect, useState } from "react";
import { FaPlus, FaEye, FaFileArchive } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import CreateBatch from "./CreateBatch";
import UpdateBatch from "./UpdateBatch";
import { Link } from "react-router-dom";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ImCross } from "react-icons/im";
import { RxCross2 } from "react-icons/rx";

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [instructorSelection, setInstructorSelection] = useState({});
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
      return res.data;
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

  // Instructor map is created after combinedInstructors is ready
  const instructorMap = React.useMemo(() => {
    return combinedInstructors.reduce((acc, instructor) => {
      acc[instructor.userId] = instructor.name;
      return acc;
    }, {});
  }, [combinedInstructors]);


useEffect(() => {
  const fetchBatches = async () => {
    try {
      const response = await axiosSecure.get("/batches");
      console.log(response.data); 

      // Update batches with instructor names
      const updatedBatches = response.data.map(batch => {
  
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

  

const handleAssignInstructor = async (batchId, userId) => {
  try {
    // Fetch the list of instructors from the server
    const { data: instructors } = await axiosSecure.get("/instructors");

    // Match the userId with the fetched instructors
    const matchedInstructor = instructors.find(
      (instructor) => instructor.userId === userId
    );

    if (!matchedInstructor) {
      toast.error("Instructor not found!");
      return;
    }

    const instructorId = matchedInstructor._id; // Get the corresponding instructorId
    console.log("Matched Instructor ID:", instructorId);

    // POST the instructor assignment
    const response = await axiosSecure.post("/instructors-batches", {
      instructorId,
      batchId,
    });

    if (response.status === 201) {
      const instructorName = instructorMap[userId] || "Unknown";

      toast.success("Instructor assigned successfully!");

      // Update the batches state immediately with the instructor's name
      setBatches((prevBatches) => {
        return prevBatches.map((batch) =>
          batch._id === batchId
            ? {
                ...batch,
                instructors: [...batch.instructors, instructorName], // Add the name directly
              }
            : batch
        );
      });

      // Reset the selected instructor for the current batch
      setInstructorSelection((prev) => ({
        ...prev,
        [batchId]: "", // Reset the instructor selection after assignment
      }));
    }
  } catch (error) {
    if (error.response && error.response.status === 409) {
      toast.error(error.response.data.message || "Instructor already assigned.");
    } else {
      toast.error("Error assigning instructor.");
    }
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
    <div className="flex flex-col mx-auto">
      <div className="overflow-x-auto mt-8 grow">
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
              <button className="btn join-item bg-blue-950 text-white">Search</button>
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
          {(loading || usersLoading || instructorsLoading) ? (
            <div className="animate-pulse w-full mt-8 mx-auto">
              <table className="table w-[1000px] mx-auto">
                <thead className="bg-gray-200">
                  <tr>
                    <th>Index</th>
                    <th>Batch</th>
                    <th>Status</th>
                    <th>Instructor</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(itemsPerPage)].map((_, index) => (
                    <tr key={index}>
                      <td colSpan="5">
                        <div className="h-8 bg-gray-100 rounded-lg"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <table className="table w-[1100px] mt-8">
              <thead className="bg-blue-950 text-white text-lg">
                <tr>
                  <th>Index</th>
                  <th>Batch</th>
                  <th>Status</th>
                  <th>Instructor</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((batch, index) => (
                  <tr key={batch._id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{batch.batchName}</td>
                    <td>{batch.status}</td>
                    <td>{batch.instructors.join(", ") || "Unassigned"}</td>

                    <td>
                      <div className="flex items-center justify-between gap-4">
                        <select
                          className="select select-bordered select-sm"
                          value={instructorSelection[batch._id] || ""}
                          onChange={(e) => {
                            const selectedUserId = e.target.value;
                            setInstructorSelection((prev) => ({
                              ...prev,
                              [batch._id]: selectedUserId,
                            }));
                            if (selectedUserId) {
                              handleAssignInstructor(batch._id, selectedUserId);
                            }
                          }}
                        >
                          <option value="" disabled>
                            Assign Instructor
                          </option>
                          {combinedInstructors.map((instructor) => (
                            <option key={instructor.userId} value={instructor.userId}>
                              {instructor.name}
                            </option>
                          ))}
                        </select>

                        <Link to={`/dashboard/batchDetails/${batch._id}`}>
                          <FaEye className="w-4 h-4" />
                        </Link>

                        <button onClick={() => setSelectedBatchId(batch._id)}>
                          <MdEdit className="w-4 h-4" />
                        </button>
                        <button>
                          <FaFileArchive className="w-4 h-4" />
                        </button>
                      </div>
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

      <div className="modal">
      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
  <div className="modal-box">
    <div className="absolute top-0 right-6 p-4">
      <button
        className="text-2xl font-bold hover:text-3xl hover:scale-110 transition-transform duration-200 cursor-pointer"
        onClick={() => document.getElementById("my_modal_5").close()}
      >
        <RxCross2 />
      </button>
    </div>

    {selectedBatchId ? (
      <UpdateBatch batchId={selectedBatchId} />
    ) : (
      <CreateBatch />
    )}
  </div>
</dialog>

      </div>
      <ToastContainer />
    </div>
  );
};

export default BatchManagement;
