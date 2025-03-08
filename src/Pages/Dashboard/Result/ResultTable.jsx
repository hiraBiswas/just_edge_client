import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import UploadResult from "./UploadResult";

const ResultTable = () => {
    const axiosSecure = useAxiosSecure();
    const [batchId, setBatchId] = useState("");
    const [selectedBatchName, setSelectedBatchName] = useState("");
    const [editStudent, setEditStudent] = useState(null);
    const [editedExams, setEditedExams] = useState([]);

    // Fetch batches
    const { data: batches = [], isLoading: batchesLoading } = useQuery({
        queryKey: ["batches"],
        queryFn: async () => {
            const res = await axiosSecure.get("/batches");
            return res.data;
        },
    });

    // Auto-select the first batch when batches are available
    useEffect(() => {
        if (batches.length > 0 && !batchId) {
            setBatchId(batches[0]._id);
            setSelectedBatchName(batches[0].batchName);
        }
    }, [batches]);

    // Fetch students for the selected batch
    const { data: students = [], isLoading: studentsLoading } = useQuery({
        queryKey: ["students", batchId],
        queryFn: async () => {
            const res = await axiosSecure.get(`/batch/${batchId}/students`);
            return res.data;
        },
        enabled: !!batchId, // Fetch students only when batchId is available
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

      // Open Edit Modal
      const openEditModal = (student) => {
        setEditStudent(student);
        setEditedExams(student.exams || []);
        document.getElementById("edit_modal").showModal();
    };

    // Handle Exam Change
    const handleExamChange = (index, newMarks) => {
        const updatedExams = [...editedExams];
        updatedExams[index].marks = newMarks;
        setEditedExams(updatedExams);
    };


    const handleSaveEdit = async () => {
        try {
            await axiosSecure.patch("/results/update", {
                studentID: editStudent.studentID,
                batchId: editStudent.batchId,
                exams: editedExams, // Only send updated exams
            });
    
            alert("Results updated successfully!");
            setEditStudent(null);
            document.getElementById("edit_modal").close();
            refetch(); // Refresh table data after update
        } catch (error) {
            alert("Failed to update results.");
        }
    };
    


    return (
        <div className="p-6 bg-white w-[1100px] mx-auto mt-5">
            {/* Upload Button with Aligned Text */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Upload or View Results</h2>
                <UploadResult />
            </div>

            {/* Batch Selection */}
            <div className="mb-6 bg-white flex items-center gap-3  ">
                <label className="block font-medium">Select Batch:</label>
                <select
                    value={batchId}
                    onChange={handleBatchChange}
                    className="select select-bordered w-80"
                >
                    {batches.length === 0 ? (
                        <option value="" disabled>Loading batches...</option>
                    ) : (
                        batches.map((batch) => (
                            <option key={batch._id} value={batch._id}>
                                {batch.batchName}
                            </option>
                        ))
                    )}
                </select>
            </div>

            {/* Loading states */}
            {batchId && (studentsLoading || resultsLoading) && (
                <div className="text-center py-20">
                    <span className="loading loading-ring loading-xl"></span>
                </div>
            )}

            {/* Render Results Table for Each Batch */}
            {batchId && students.length > 0 && !studentsLoading && !resultsLoading && (
                <div className="overflow-x-auto bg-white p-4 rounded shadow">
                    <h3 className="text-xl font-bold mb-4">Results for Batch: {selectedBatchName}</h3>
                    <table className="min-w-full border-collapse border">
                        <thead>
                            <tr className="bg-blue-950 text-white">
                                <th className="px-4 py-2 text-left">SI</th>
                                <th className="px-4 py-2 text-left">Student Name</th>
                                <th className="px-4 py-2 text-left">Student ID</th>
                                <th className="px-4 py-2 text-center">Assignment</th>
                                <th className="px-4 py-2 text-center">Mid Term</th>
                                <th className="px-4 py-2 text-center">Final Project</th>
                                <th className="px-4 py-2 text-center">Attendance</th>
                                <th className="px-4 py-2 text-center">Total</th>
                                <th className="px-4 py-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => {
                                const studentResults = allResults.find(result => result.studentID == student.studentID);

                                const assignmentMarks = studentResults ? 
                                    (studentResults.exams.find(exam => exam.examType === "Assignment")?.marks || '-') : '-';

                                const midTermMarks = studentResults ? 
                                    (studentResults.exams.find(exam => exam.examType === "Mid Term")?.marks || '-') : '-';

                                const finalProjectMarks = studentResults ? 
                                    (studentResults.exams.find(exam => exam.examType === "Final Project")?.marks || '-') : '-';

                                const attendanceMarks = studentResults ? 
                                    (studentResults.exams.find(exam => exam.examType === "Attendance")?.marks || '-') : '-';

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
                                        <button
                                                className="bg-blue-950 text-white px-2 py-1 rounded text-sm mr-1"
                                                onClick={() => openEditModal(studentResults)}
                                            >
                                                Edit
                                            </button>
                                            <button className="bg-red-500 text-white px-2 py-1 rounded text-sm">Delete</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}


            {/* Edit Modal */}
            {editStudent && (
                <dialog id="edit_modal" className="modal">
                    <div className="modal-box max-w-sm">
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                        <h3 className="font-bold text-lg text-center mt-2">Edit Exam Results</h3>
                        <p className="text-md text-center text-gray-600 mb-4">
                            Student ID: {editStudent.studentID}
                        </p>
                        {editedExams.map((exam, index) => (
                            <div key={index} className="flex justify-between items-center mb-2">
                                <span className="font-medium">{exam.examType} : </span>
                                <input
                                    type="number"
                                    className="input input-bordered w-48"
                                    value={exam.marks}
                                    onChange={(e) => handleExamChange(index, e.target.value)}
                                />
                            </div>
                        ))}
                        <button onClick={handleSaveEdit} className="btn bg-blue-950 text-white w-full mt-4">
                            Save Changes
                        </button>
                    </div>
                </dialog>
            )}

            {/* No data message */}
            {batchId && !studentsLoading && !resultsLoading && students.length === 0 && (
                <div className="text-center py-20 bg-white p-4 rounded shadow">
                    No students found for this batch.
                </div>
            )}
        </div>
    );
};

export default ResultTable;
