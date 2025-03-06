import React, { useState } from 'react';
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const ResultTable = () => {
    const axiosSecure = useAxiosSecure();
    const [batchId, setBatchId] = useState("");

    // Fetch batches
    const { data: batches = [] } = useQuery({
        queryKey: ["batches"],
        queryFn: async () => {
            const res = await axiosSecure.get("/batches");
            return res.data;
        },
    });

    // Fetch student results for the selected batch
    const { data: results = [] } = useQuery({
        queryKey: ["results", batchId],
        queryFn: async () => {
            const res = await axiosSecure.get(`/results/${batchId}`);
            return res.data;
        },
        enabled: !!batchId, // Only fetch results after a batch is selected
    });

    // Handle batch selection
    const handleBatchChange = (e) => {
        setBatchId(e.target.value);
    };

    // Generate table headers dynamically based on exam types
    const generateHeaders = () => {
        const examTypes = new Set();
        results.forEach((result) => {
            result.exams.forEach((exam) => {
                examTypes.add(exam.examType);
            });
        });
        return [...examTypes];
    };

    // Generate rows for the table based on the results data
    const generateRows = () => {
        return results.map((result) => {
            const row = {};

            result.exams.forEach((exam) => {
                row[exam.examType] = exam.marks;
            });

            return row;
        });
    };

    return (
        <div>
            <div className="py-4">
                <label className="block mb-2">Select Batch:</label>
                <select
                    value={batchId}
                    onChange={handleBatchChange}
                    className="select select-bordered w-full"
                >
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

            {batchId && results.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="table table-zebra">
                        {/* head */}
                        <thead>
                            <tr>
                                {generateHeaders().map((header, index) => (
                                    <th key={index}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {generateRows().map((row, index) => (
                                <tr key={index}>
                                    {generateHeaders().map((header, idx) => (
                                        <td key={idx}>{row[header] || '-'}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ResultTable;
