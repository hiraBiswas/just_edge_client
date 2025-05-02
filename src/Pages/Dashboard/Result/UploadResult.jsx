import React, { useState, useEffect, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useInstructor from "../../../hooks/useInstructor";
import { FaUpLong } from "react-icons/fa6";
import { toast, Toaster } from "react-hot-toast";
import { AuthContext } from "../../../Providers/AuthProvider";

const UploadResult = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient(); // Use queryClient to refetch data
  const [batchId, setBatchId] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [isInstructor] = useInstructor();
  const [activeTab, setActiveTab] = useState("excel");
  const [loading, setLoading] = useState(false); // Loader state
  const [availableBatches, setAvailableBatches] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const { user } = useContext(AuthContext);

  // Fetch Batches
  const { data: batches = [] } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const res = await axiosSecure.get("/batches");
      return res.data;
    },
  });

  // Fetch students when batch changes
  useEffect(() => {
    if (!batchId) return;
    const fetchStudents = async () => {
      try {
        const res = await axiosSecure.get(`/batch/${batchId}/students`);
        setStudents(res.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, [batchId, axiosSecure]);

  // Fetch students without results when batch changes
  useEffect(() => {
    if (!batchId) return;

    const fetchStudentsWithoutResults = async () => {
      try {
        // Fetch all students in batch
        const studentsRes = await axiosSecure.get(`/batch/${batchId}/students`);
        const allStudents = studentsRes.data;

        // Fetch student IDs with existing results
        const existingIdsRes = await axiosSecure.get(
          `/results/existingStudentIds?batchId=${batchId}`
        );
        const existingStudentIds = existingIdsRes.data || [];

        // Filter students without results
        const studentsWithoutResults = allStudents.filter(
          (student) => !existingStudentIds.includes(student.studentID)
        );

        setAvailableStudents(studentsWithoutResults);
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to load student data");
      }
    };

    fetchStudentsWithoutResults();
  }, [batchId, axiosSecure]);

  // Render student dropdown
  const renderStudentDropdown = () => {
    if (availableStudents.length === 0) {
      return (
        <select className="select select-bordered w-full" disabled>
          <option>
            {batchId ? "All students have results" : "Select a batch first"}
          </option>
        </select>
      );
    }

    return (
      <select
        value={selectedStudent}
        onChange={(e) => setSelectedStudent(e.target.value)}
        className="select select-bordered w-full"
        required
      >
        <option value="" disabled>
          Select a student
        </option>
        {availableStudents.map((student) => (
          <option key={student.studentID} value={student.studentID}>
            {student.studentID} - {student.name}
          </option>
        ))}
      </select>
    );
  };

  // Fetch instructors
  const { data: instructors = [] } = useQuery({
    queryKey: ["instructors"],
    queryFn: async () => {
      const res = await axiosSecure.get("/instructors");
      return res.data;
    },
  });

  // Find the instructor ID using userId
  const instructor = instructors.find((inst) => inst.userId === user._id);
  const instructorId = instructor ? instructor._id : null;

  // Find batches where instructorIds include the instructorId
  const instructorBatches = instructorId
    ? batches.filter((batch) => batch.instructorIds.includes(instructorId))
    : [];

  // Filter batches to only show those where results haven't been published
  useEffect(() => {
    const fetchBatchesWithoutResults = async () => {
      if (!instructorBatches.length) return;

      try {
        const batchesWithStatus = await Promise.all(
          instructorBatches.map(async (batch) => {
            const response = await axiosSecure.get(
              `/results/batch-status/${batch._id}`
            );
            return {
              ...batch,
              isPublished: response.data.isPublished || false,
              hasResults: response.data.hasResults || false,
            };
          })
        );

        // Filter batches that either have no results or where results aren't published
        const filteredBatches = batchesWithStatus.filter(
          (batch) => !batch.isPublished
        );

        setAvailableBatches(filteredBatches);
      } catch (error) {
        console.error("Error checking batch result status:", error);
        // Don't show toast for 404 errors - they're expected when no results exist
        if (error.response?.status !== 404) {
          toast.error("Failed to fetch batch information");
        }
      }
    };

    fetchBatchesWithoutResults();
  }, [instructorBatches, axiosSecure]);

  const handleBatchChange = (e) => {
    setBatchId(e.target.value);
    setSelectedStudent("");
  };

  const handleDownloadTemplate = () => {
    const headers = [
      [
        "studentID",
        "Mid_Term",
        "Project",
        "Assignment",
        "Final_Exam",
        "Attendance",
      ], // Define your expected headers
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    // Create a downloadable Excel file
    XLSX.writeFile(workbook, "Results_Template.xlsx");
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);

    if (uploadedFile) {
      const reader = new FileReader();
      reader.readAsBinaryString(uploadedFile);
      reader.onload = (event) => {
        const binaryString = event.target.result;
        const workbook = XLSX.read(binaryString, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Convert Excel Data to Match MongoDB Format
        const formattedResults = jsonData.map((row) => ({
          studentID: String(row["studentID"]), // Ensure studentID is a string
          Mid_Term: row["Mid_Term"] !== undefined ? row["Mid_Term"] : null, // If empty, set null
          Project: row["Project"] !== undefined ? row["Project"] : null,
          Assignment:
            row["Assignment"] !== undefined ? row["Assignment"] : null,
          Final_Exam:
            row["Final_Exam"] !== undefined ? row["Final_Exam"] : null,
          Attendance:
            row["Attendance"] !== undefined ? row["Attendance"] : null,
        }));

        setResults(formattedResults);
      };
    }
  };

  const examTypes = [
    { id: "1", type: "Mid Term" },
    { id: "2", type: "Project" },
    { id: "3", type: "Assignment" },
    { id: "4", type: "Final Exam" },
    { id: "5", type: "Attendance" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!batchId ||  results.length === 0) {
      toast.error("Please select batch,  and upload a valid file.");
      return;
    }

    setLoading(true);

    try {
      // Check if result already exists for this student in this batch
      const existingResults = await axiosSecure.get(
        `/results/checkExisting?batchId=${batchId}&studentID=${selectedStudent}`
      );

      if (existingResults.data.length > 0) {
        toast.error("Result already exists for this student.");
        setLoading(false);
        return; // ❗ Prevent further execution
      }

      // Post result
      await axiosSecure.post("/results/upload", {
        batchId,
        studentID: selectedStudent,
        results,
      });

      toast.success("Results uploaded successfully!");
      queryClient.invalidateQueries(["results"]);
      closeModal(); // ✅ Only close modal if success
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload results.");
    } finally {
      setLoading(false); // ✅ Always stop loading regardless of success or failure
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!batchId || !selectedStudent) {
      toast.error("Please select a batch and student.");
      setLoading(false);
      return;
    }

    const formData = new FormData(e.target);
    const formValues = Object.fromEntries(formData.entries());

    const result = {
      studentID: selectedStudent,
      Mid_Term: parseInt(formValues["Mid Term"]) || null,
      Project: parseInt(formValues["Project"]) || null,
      Assignment: parseInt(formValues["Assignment"]) || null,
      Final_Exam: parseInt(formValues["Final Exam"]) || null,
      Attendance: parseInt(formValues["Attendance"]) || null,
    };

    try {
      // Check if result exists
      const { data: existingResults } = await axiosSecure.get(
        `/results/checkExisting?batchId=${batchId}&studentID=${selectedStudent}`
      );

      if (existingResults.length > 0) {
        toast.error(
          "Result already exists for this student. Please edit instead."
        );
        return;
      }

      // Upload result
      const response = await axiosSecure.post(
        "/results/upload",
        {
          batchId,
          results: [result],
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data) {
        toast.success("Result uploaded successfully!");
        queryClient.invalidateQueries(["results"]);

        // Reset form and close modal
        setBatchId("");
        setSelectedStudent("");
        setStudents([]);
        e.target.reset(); // Reset the form directly
        document.getElementById("upload_modal").close();
      }
    } catch (error) {
      console.error("Upload Error:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to upload result.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    document.getElementById("upload_modal").close();
  };

  return (
    <div className="">
      <button
        className="btn bg-blue-950 text-white flex gap-2"
        onClick={() => document.getElementById("upload_modal").showModal()}
      >
        <FaUpLong />
        <h2>Upload Mark</h2>
      </button>
      <dialog id="upload_modal" className="modal">
        <div className="modal-box max-w-md">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg text-center mt-2">Upload Marks</h3>
          <div className="tabs">
            <button
              className={`tab ${
                activeTab === "excel"
                  ? "tab-active font-semibold border-b-2 border-blue-500"
                  : ""
              }`}
              onClick={() => setActiveTab("excel")}
            >
              Upload by Excel
            </button>
            <button
              className={`tab ${
                activeTab === "manual"
                  ? "tab-active font-semibold border-b-2 border-blue-500"
                  : ""
              }`}
              onClick={() => setActiveTab("manual")}
            >
              Upload Manually
            </button>
          </div>
          {activeTab === "excel" ? (
            <form onSubmit={handleSubmit}>
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <label className="block mb-1">Select Batch:</label>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="btn bg-blue-950 text-white btn-sm my-2"
                  >
                    Download Template
                  </button>
                </div>
                <select
                  value={batchId}
                  onChange={handleBatchChange}
                  className="select select-bordered w-full"
                >
                  <option value="" disabled>
                    Select a batch
                  </option>
                  {availableBatches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.batchName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="my-2">
                <label className="block mb-1">Upload File:</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="file-input file-input-md w-full"
                />
              </div>
              <button
                type="submit"
                className="btn bg-blue-950 text-white w-full"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleManualSubmit}>
              {/* Batch Selection */}
              <div className="my-2 flex justify-between gap-4 items-center">
                <label className="block text-md">Select Batch:</label>
                <select
                  value={batchId}
                  onChange={handleBatchChange}
                  className="select select-bordered w-full"
                >
                  <option value="" disabled>
                    Select a batch
                  </option>
                  {availableBatches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.batchName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="my-2 flex justify-between gap-4 items-center ">
                <label className="block text-md">Select Student ID:</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="" disabled>
                    Select a student
                  </option>
                  {availableStudents.map((student) => (
                    <option key={student.studentID} value={student.studentID}>
                      {student.studentID} - {student.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exam Type Selection */}

              {examTypes.map((exam) => (
                <div
                  key={exam.id}
                  className="my-2 flex justify-between gap-4 items-center"
                >
                  <label className="block text-md">{exam.type} Marks:</label>
                  <input
                    type="number"
                    name={exam.type} // This should match exactly with the exam.type
                    className="input input-md input-bordered w-64"
                    placeholder={`Enter ${exam.type} Marks`}
                  />
                </div>
              ))}

              <button
                type="submit"
                className="btn bg-blue-950 text-white w-full"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </form>
          )}
        </div>
        <Toaster position="top-center" reverseOrder={false} />
      </dialog>
    </div>
  );
};

export default UploadResult;
