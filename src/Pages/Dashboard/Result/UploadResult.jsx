import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useInstructor from "../../../hooks/useInstructor";
import ResultTable from "./ResultTable";

const UploadResult = () => {
    const axiosSecure = useAxiosSecure();
    const [batchId, setBatchId] = useState("");
    const [file, setFile] = useState(null);
    const [results, setResults] = useState([]); // Store extracted data
    const [isInstructor] = useInstructor();

    // Fetch batches
    const { data: batches = [] } = useQuery({
        queryKey: ["batches"],
        queryFn: async () => {
            const res = await axiosSecure.get("/batches");
            return res.data;
        },
    });

    // Handle batch selection
    const handleBatchChange = (e) => {
        setBatchId(e.target.value);
        console.log("Selected batchId:", e.target.value);
    };

    // Read Excel file in frontend
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
                
                console.log("Extracted Data from Excel:", jsonData); // Debugging
                setResults(jsonData);
            };
        }
    };

    // Submit extracted JSON data to backend
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!batchId || results.length === 0) {
            alert("Please select a batch and upload a valid file.");
            return;
        }

        const payload = {
            batchId: batchId,
            results: results, // Sending structured JSON data
        };

        console.log("Submitting data:", payload); // Debugging

        try {
            const res = await axiosSecure.post("/results/upload", payload);
            console.log("Response:", res.data);
            alert("Results uploaded successfully!");
        } catch (error) {
            console.error("Error uploading results:", error.response?.data || error.message);
            alert("Failed to upload results.");
        }
    };

    return (
        <div>
            <button className="btn" onClick={() => document.getElementById("upload_modal").showModal()}>
                Upload Results
            </button>
            <dialog id="upload_modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Upload Exam Results</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="py-4">
                            <label className="block mb-2">Select Batch:</label>
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
                        <div className="py-4">
                            <label className="block mb-2">Upload File:</label>
                            <input type="file" onChange={handleFileChange} className="file-input w-full" />
                        </div>
                        <button type="submit" className="btn btn-primary w-full">
                            Upload
                        </button>
                    </form>
                </div>
            </dialog>

            <ResultTable></ResultTable>
        </div>
    );                              
};

export default UploadResult;
