import React, { useState } from 'react';
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const ResultTable = () => {
    const axiosSecure = useAxiosSecure();
    const [batchId, setBatchId] = useState("");
    const [selectedBatchName, setSelectedBatchName] = useState("");

    // Fetch batches
    const { data: batches = [] } = useQuery({
        queryKey: ["batches"],
        queryFn: async () => {
            const res = await axiosSecure.get("/batches");
            return res.data;
        },
    });

    // Fetch students for the selected batch
    const { data: students = [], isLoading: studentsLoading } = useQuery({
        queryKey: ["students", batchId],
        queryFn: async () => {
            const res = await axiosSecure.get(`/batch/${batchId}/students`);
            return res.data;
        },
        enabled: !!batchId, // Only fetch students after a batch is selected
    });

    // Fetch all results
    const { data: allResults = [], isLoading: resultsLoading } = useQuery({
        queryKey: ["results"],
        queryFn: async () => {
            const res = await axiosSecure.get("/results");
            return res.data;
        },
    });

    // Handle batch selection
    const handleBatchChange = (e) => {
        const selectedId = e.target.value;
        setBatchId(selectedId);
        
        // Find and set the batch name for display
        const selectedBatch = batches.find(batch => batch._id === selectedId);
        setSelectedBatchName(selectedBatch ? selectedBatch.batchName : "");
    };

    // Function to render table headers
    const renderTableHeader = () => {
        return (
            <thead>
                <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">SI</th>
                    <th className="px-4 py-2 text-left">Student Name</th>
                    <th className="px-4 py-2 text-left">Student ID</th>
                    {/* <th className="px-4 py-2 text-center">Quiz</th> */}
                    <th className="px-4 py-2 text-center">Assignment</th>
                    <th className="px-4 py-2 text-center">Mid Term</th>
                    <th className="px-4 py-2 text-center">Final Project</th>
                    <th className="px-4 py-2 text-center">Attendance</th>
                    <th className="px-4 py-2 text-center">Total</th>
                    <th className="px-4 py-2 text-center">Action</th>
                </tr>
            </thead>
        );
    };

    // Function to render rows for each student with matched exam data
    const renderTableRows = () => {
        return students.map((student, index) => {
            // Find the corresponding results for the student
            const studentResults = allResults.find(result => result.studentID == student.studentID);
            
            // Extract marks for each exam type (only if results exist)
            // const quizMarks = studentResults ? 
            //     (studentResults.exams.find(exam => exam.examType === "Quiz")?.marks || '-') : '-';
            
            const assignmentMarks = studentResults ? 
                (studentResults.exams.find(exam => exam.examType === "Assignment")?.marks || '-') : '-';


            const midTermMarks = studentResults ? 
                (studentResults.exams.find(exam => exam.examType === "Mid Term")?.marks || '-') : '-';


                const finalProjectMarks = studentResults ? 
                (studentResults.exams.find(exam => exam.examType === "Final Project")?.marks || '-') : '-';

            
            
            const attendanceMarks = studentResults ? 
                (studentResults.exams.find(exam => exam.examType === "Attendance")?.marks || '-') : '-';

            // Calculate the total marks (if all marks are available)
            const total = 
            (assignmentMarks !== '-' ? Number(assignmentMarks) : 0) + 
            (midTermMarks !== '-' ? Number(midTermMarks) : 0) + 
            (finalProjectMarks !== '-' ? Number(finalProjectMarks) : 0) + 
            (attendanceMarks !== '-' ? Number(attendanceMarks) : 0);

            return (
                <tr key={student.studentID} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-2 border">{index + 1}</td>
                    <td className="px-4 py-2 border">{student.name}</td>
                    <td className="px-4 py-2 border">{student.studentID}</td>
                    <td className="px-4 py-2 border text-center">{assignmentMarks}</td>
                    <td className="px-4 py-2 border text-center">{midTermMarks}</td>
                    <td className="px-4 py-2 border text-center">{finalProjectMarks}</td>
                    <td className="px-4 py-2 border text-center">{attendanceMarks}</td>
                    <td className="px-4 py-2 border text-center font-medium">
                        {total !== '-' ? total : 'N/A'}
                    </td>
                    <td className="px-4 py-2 border text-center">
                        <button className="bg-blue-500 text-white px-2 py-1 rounded text-sm mr-1">Edit</button>
                        <button className="bg-red-500 text-white px-2 py-1 rounded text-sm">Delete</button>
                    </td>
                </tr>
            );
        });
    };

    return (
        <div className="p-4">
            <div className="mb-6 bg-white p-4 rounded shadow">
                <label className="block mb-2 font-medium">Select Batch:</label>
                <select
                    value={batchId}
                    onChange={handleBatchChange}
                    className="w-full p-2 border rounded"
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

            {/* Loading states */}
            {batchId && (studentsLoading || resultsLoading) && (
                <div className="text-center py-8">Loading data...</div>
            )}

            {/* Render Results Table for Each Batch */}
            {batchId && students.length > 0 && !studentsLoading && !resultsLoading && (
                <div className="overflow-x-auto bg-white p-4 rounded shadow">
                    <h3 className="text-xl font-bold mb-4">Results for Batch: {selectedBatchName}</h3>
                    <table className="min-w-full border-collapse border">
                        {renderTableHeader()}
                        <tbody>
                            {renderTableRows()}
                        </tbody>
                    </table>
                </div>
            )}

            {/* No data message */}
            {batchId && !studentsLoading && !resultsLoading && students.length === 0 && (
                <div className="text-center py-8 bg-white p-4 rounded shadow">
                    No students found for this batch.
                </div>
            )}
        </div>
    );
};

export default ResultTable;