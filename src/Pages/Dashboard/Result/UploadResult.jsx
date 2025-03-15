import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useInstructor from "../../../hooks/useInstructor";
import { FaUpLong } from "react-icons/fa6";
import { toast, Toaster } from "react-hot-toast";

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

    const examTypes = [
        { id: "1", type: "Mid Term" },
        { id: "2", type: "Final Project" },
        { id: "3", type: "Assignment" },
        { id: "4", type: "Final Exam" },

        { id: "5", type: "Attendance" },
    ];

    const handleBatchChange = (e) => {
        setBatchId(e.target.value);
        setSelectedStudent("");
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
                const formattedResults = jsonData.map(row => ({
                    studentID: String(row["studentID"]),  // Ensure studentID is a string
                    Mid_Term: row["Mid_Term"] !== undefined ? row["Mid_Term"] : null,  // If empty, set null
                    Final_Project: row["Final_Project"] !== undefined ? row["Final_Project"] : null,
                    Assignment: row["Assignment"] !== undefined ? row["Assignment"] : null,
                    Final_Exam: row["Final_Exam"] !== undefined ? row["Final_Exam"] : null,
                    Attendance: row["Attendance"] !== undefined ? row["Attendance"] : null
                }));
    
                setResults(formattedResults);
            };
        }
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!batchId || results.length === 0) {
            toast.error("Please select a batch and upload a valid file.");
            return;
        }

        setLoading(true);
        try {
            await axiosSecure.post("/results/upload", { batchId, results });
            toast.success("Results uploaded successfully!");
            queryClient.invalidateQueries(["results"]); // Refresh table data
            closeModal();
        } catch (error) {
            toast.error("Failed to upload results.");
        }
        setLoading(false);
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        if (!batchId || selectedStudent === "") {
            toast.error("Please select a batch and student.");
            setLoading(false);
            return;
        }
    
        const formData = new FormData(e.target);
    
        // Collect all exam types dynamically
        const results = examTypes.map(exam => {
            const marks = formData.get(exam.type);
            return {
                studentID: selectedStudent,
                examType: exam.type.replace(/\s+/g, "_"), // Convert spaces to underscores
                marks: parseInt(marks) || 0 // Ensure it's a number
            };
        });
    
        try {
            console.log("Sending data:", { batchId, results }); // Debug log
    
            const response = await axiosSecure.post("/results/upload", {
                batchId, // Ensure correct variable usage
                results
            }, {
                headers: { "Content-Type": "application/json" }
            });
    
            toast.success("Result uploaded successfully!");
            queryClient.invalidateQueries(["results"]);
            closeModal();
        } catch (error) {
            console.error("Upload Error:", error.response?.data);
            toast.error(error.response?.data?.message || "Failed to upload result.");
        }
        setLoading(false);
    };
    
    
    

    const closeModal = () => {
        document.getElementById("upload_modal").close();
    };

    return (
        <div className="">
            <button className="btn bg-blue-950 text-white flex gap-2" onClick={() => document.getElementById("upload_modal").showModal()}>
            <FaUpLong />
           <h2>Upload Result
           </h2>
            </button>
            <dialog id="upload_modal" className="modal">
                <div className="modal-box max-w-md">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg text-center mt-2">Upload Exam Results</h3>
                    <div className="tabs">
                        <button 
                            className={`tab ${activeTab === "excel" ? "tab-active font-semibold border-b-2 border-blue-500" : ""}`}
                            onClick={() => setActiveTab("excel")}
                        >
                            Upload by Excel
                        </button>
                        <button 
                            className={`tab ${activeTab === "manual" ? "tab-active font-semibold border-b-2 border-blue-500" : ""}`}
                            onClick={() => setActiveTab("manual")}
                        >
                            Upload Manually
                        </button>
                    </div>
                    {activeTab === "excel" ? (
                        <form onSubmit={handleSubmit}>
                            <div className="mt-2">
                                <label className="block mb-1">Select Batch:</label>
                                <select value={batchId} onChange={handleBatchChange} className="select select-bordered w-full">
                                    <option value="" disabled>
                                        Select a batch
                                    </option>
                                    {batches.map((batch) => (
                                        <option key={batch._id} value={batch._id}>
                                            {batch.batchName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="my-2">
                                <label className="block mb-1">Upload File:</label>
                                <input type="file" onChange={handleFileChange} className="file-input file-input-md w-full" />
                            </div>
                            <button type="submit" className="btn bg-blue-950 text-white w-full" disabled={loading}>
                                {loading ? "Uploading..." : "Upload"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleManualSubmit}>
                            {/* Batch Selection */}
                            <div className="my-2 flex justify-between gap-4 items-center">
                                <label className="block text-md">Select Batch:</label>
                                <select value={batchId} onChange={handleBatchChange} className="select select-md select-bordered w-64">
                                    <option value="" disabled>Select a batch</option>
                                    {batches.map((batch) => (
                                        <option key={batch._id} value={batch._id}>
                                            {batch.batchName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="my-2 flex justify-between gap-4 items-center ">
                                <label className="block text-md">Select Student ID:</label>
                                <select 
                                    name="studentId" 
                                    className="select select-md select-bordered w-64"
                                    value={selectedStudent}
                                    onChange={(e) => setSelectedStudent(e.target.value)}
                                >
                                    <option value="" disabled>Select a student</option>
                                    {students.map((student) => (
                                        <option key={student.studentID} value={student.studentID}>
                                            {student.studentID} - {student.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Exam Type Selection */}
                           
                                {examTypes.map((exam) => (
    <div key={exam.id} className="my-2 flex justify-between gap-4 items-center">
        <label className="block text-md">{exam.type} Marks:</label>
        <input 
            type="number" 
            name={exam.type} 
            className="input input-md input-bordered w-64" 
            placeholder={`Enter ${exam.type} Marks`}
        />
    </div>
))}




                            <button type="submit" className="btn bg-blue-950 text-white w-full" disabled={loading}>
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
