import React, { useState, useEffect, useContext } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import UploadResult from "./UploadResult";
import { Toaster, toast } from "react-hot-toast";
import { AuthContext } from "../../../Providers/AuthProvider";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

// Styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 30,
    backgroundColor: "#ffffff",
  },
  headerSection: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 10,
  },
  dateText: {
    fontSize: 10,
    textAlign: "right",
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000000",
    marginVertical: 15,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#000000",
    minHeight: 25,
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
  },
  tableCell: {
    padding: 5,
    flex: 1,
    textAlign: "center",
    fontSize: 9,
    borderRightWidth: 0.5,
    borderRightColor: "#000000",
    justifyContent: "center",
  },
  header: {
    fontWeight: "bold",
  },
  narrowCell: {
    flex: 0.8,
  },
  wideCell: {
    flex: 1.5,
  },
  footer: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 9,
    color: "#555555",
    borderTopWidth: 0.5,
    borderTopColor: "#555555",
    paddingTop: 10,
  },
  summarySection: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryBox: {
    borderWidth: 0.5,
    borderColor: "#000000",
    padding: 8,
    width: "30%",
  },
  summaryTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 5,
  },
  summaryContent: {
    fontSize: 9,
  },
  watermark: {
    position: "absolute",
    fontSize: 60,
    color: "rgba(200, 200, 200, 0.2)",
    transform: "rotate(-45deg)",
    left: 100,
    top: 300,
  },
});

// PDF Document component
const MyPDFDocument = ({ students, allResults, selectedBatchName }) => {
  // Calculate summary statistics
  const totalStudents = students.length;
  const studentsWithResults = students.filter((student) =>
    allResults.some((result) => result.studentID === student.studentID)
  ).length;

  const passCount = students.filter((student) => {
    const studentResults = allResults.find(
      (result) => result.studentID === student.studentID
    );
    if (!studentResults) return false;

    const total =
      Number(studentResults.Assignment || 0) +
      Number(studentResults.Mid_Term || 0) +
      Number(studentResults.Project || 0) +
      Number(studentResults.Final_Exam || 0) +
      Number(studentResults.Attendance || 0);

    return total >= 40;
  }).length;

  const failCount = studentsWithResults - passCount;
  const passRate =
    studentsWithResults > 0
      ? ((passCount / studentsWithResults) * 100).toFixed(1)
      : 0;

  // Get current date
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Document>
      <Page style={styles.page}>
        {/* Watermark */}
        {/* <Text style={styles.watermark}>CONFIDENTIAL</Text> */}

        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>RESULT SUMMARY</Text>
          <Text style={styles.subtitle}>Batch: {selectedBatchName}</Text>
          <Text style={styles.dateText}>Report Date: {currentDate}</Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.header, styles.narrowCell]}>
              SI
            </Text>
            <Text style={[styles.tableCell, styles.header, styles.wideCell]}>
              Student{"\n"}Name
            </Text>
            <Text style={[styles.tableCell, styles.header]}>Student ID</Text>
            <Text style={[styles.tableCell, styles.header]}>Assignment</Text>
            <Text style={[styles.tableCell, styles.header]}>Mid{"\n"}Term</Text>
            <Text style={[styles.tableCell, styles.header]}>Project</Text>
            <Text style={[styles.tableCell, styles.header]}>
              Final{"\n"}Exam
            </Text>
            <Text style={[styles.tableCell, styles.header]}>Attendance</Text>
            <Text style={[styles.tableCell, styles.header]}>Total</Text>
            <Text style={[styles.tableCell, styles.header]}>Status</Text>
          </View>

          {/* Table Rows */}
          {students.map((student, index) => {
            const studentResults = allResults.find(
              (result) => result.studentID === student.studentID
            );

            const assignmentMarks = studentResults?.Assignment ?? "-";
            const midTermMarks = studentResults?.Mid_Term ?? "-";
            const projectMarks = studentResults?.Project ?? "-";
            const finalExamMarks = studentResults?.Final_Exam ?? "-";
            const attendanceMarks = studentResults?.Attendance ?? "-";

            const total =
              assignmentMarks !== "-" &&
              midTermMarks !== "-" &&
              projectMarks !== "-" &&
              finalExamMarks !== "-" &&
              attendanceMarks !== "-"
                ? Number(assignmentMarks) +
                  Number(midTermMarks) +
                  Number(projectMarks) +
                  Number(finalExamMarks) +
                  Number(attendanceMarks)
                : "-";

            const status =
              total !== "-" && total >= 40
                ? "Pass"
                : total !== "-"
                ? "Fail"
                : "N/A";

            // Apply background color based on status
            const statusStyle =
              status === "Pass"
                ? { backgroundColor: "rgba(220, 255, 220, 0.5)" }
                : status === "Fail"
                ? { backgroundColor: "rgba(255, 220, 220, 0.5)" }
                : {};

            return (
              <View key={student.studentID} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.narrowCell]}>
                  {index + 1}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.wideCell,
                    { textAlign: "left" },
                  ]}
                >
                  {student.name}
                </Text>
                <Text style={styles.tableCell}>{student.studentID}</Text>
                <Text style={styles.tableCell}>{assignmentMarks}</Text>
                <Text style={styles.tableCell}>{midTermMarks}</Text>
                <Text style={styles.tableCell}>{projectMarks}</Text>
                <Text style={styles.tableCell}>{finalExamMarks}</Text>
                <Text style={styles.tableCell}>{attendanceMarks}</Text>
                <Text style={styles.tableCell}>
                  {total !== "-" ? total : "N/A"}
                </Text>
                <Text style={[styles.tableCell, statusStyle]}>{status}</Text>
              </View>
            );
          })}
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>BATCH SUMMARY</Text>
            <Text style={styles.summaryContent}>
              Total Students: {totalStudents}
            </Text>
            <Text style={styles.summaryContent}>
              Evaluated: {studentsWithResults}
            </Text>
            <Text style={styles.summaryContent}>
              Pending: {totalStudents - studentsWithResults}
            </Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>PERFORMANCE</Text>
            <Text style={styles.summaryContent}>Pass: {passCount}</Text>
            <Text style={styles.summaryContent}>Fail: {failCount}</Text>
            <Text style={styles.summaryContent}>Success Rate: {passRate}%</Text>
          </View>
        </View>

        {/* Footer */}
        {/* <Text style={styles.footer}>
          This is an official document generated by JUST EDGE • Confidential and Private
        </Text> */}
      </Page>
    </Document>
  );
};

const ResultTable = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient(); // Initialize QueryClient
  const [batchId, setBatchId] = useState("");
  const [selectedBatchName, setSelectedBatchName] = useState("");
  const [editStudent, setEditStudent] = useState(null);
  const [editedExams, setEditedExams] = useState([]);
  const { user } = useContext(AuthContext);

  // Fetch batches
  const { data: batches = [], isLoading: batchesLoading } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const res = await axiosSecure.get("/batches");
      return res.data;
    },
  });

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

  // Filter only the batches that belong to this instructor
  const instructorBatches = instructorId
    ? batches.filter((batch) => batch.instructorIds.includes(instructorId))
    : [];

  // Auto-select the first batch when batches are available
  useEffect(() => {
    if (instructorBatches.length > 0 && !batchId) {
      setBatchId(instructorBatches[0]._id);
      setSelectedBatchName(instructorBatches[0].batchName);
    }
  }, [instructorBatches]);

  // Fetch students for the selected batch
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["students", batchId],
    queryFn: async () => {
      const res = await axiosSecure.get(`/batch/${batchId}/students`);
      return res.data;
    },
    enabled: !!batchId,
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
    const selectedBatch = batches.find((batch) => batch._id === selectedId);
    setSelectedBatchName(selectedBatch ? selectedBatch.batchName : "");
  };

  // Open Edit Modal
  const openEditModal = (studentResults) => {
    setEditStudent(studentResults);

    // Extract editable fields dynamically (excluding fixed fields)
    const editableFields = Object.keys(studentResults)
      .filter(
        (key) => !["_id", "batchId", "studentID", "createdAt"].includes(key)
      ) // Keep only marks fields
      .map((key) => ({ field: key, value: studentResults[key] ?? "" })); // Preserve empty fields

    setEditedExams(editableFields);
    document.getElementById("edit_modal").showModal();
  };

  const MAX_MARKS = {
    Attendance: 10,
    Mid_Term: 25,
    Assignment: 10,
    Project: 25,
    Final_Exam: 30,
  };

  // Handle Exam Change
  const handleExamChange = (index, newMarks) => {
    let value = newMarks === "" ? null : Number(newMarks);

    // Get field name
    const fieldName = editedExams[index].field;

    // Check if the value exceeds the maximum allowed marks
    if (value !== null && value > MAX_MARKS[fieldName]) {
      toast.error(
        `${fieldName.replace(/_/g, " ")} cannot be more than ${
          MAX_MARKS[fieldName]
        }!`,
        {
          duration: 3000, // 3 seconds
          position: "top-center",
        }
      );
      return;
    }

    // Update the state if valid
    const updatedExams = [...editedExams];
    updatedExams[index].value = value;
    setEditedExams(updatedExams);
  };

  const handleDeleteStudent = async (resultId) => {
    if (!resultId) {
      toast.error("Invalid result ID!");
      return;
    }

    try {
      const res = await axiosSecure.delete(`/results/${resultId}`);

      if (res.status === 200) {
        toast.success("Student's marks deleted successfully!");
        queryClient.invalidateQueries(["results"]); // Refresh the table
      } else {
        throw new Error("Failed to delete marks");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting student marks.");
    }
  };

  // Save Edited Results
  const handleSaveEdit = async () => {
    try {
      const updatedData = {
        studentID: editStudent.studentID,
        batchId: editStudent.batchId,
        ...editedExams.reduce((acc, exam) => {
          acc[exam.field] = exam.value; // Convert array back to object with field names
          return acc;
        }, {}),
      };

      const res = await axiosSecure.patch("/results/update", updatedData);

      if (res.status === 200) {
        toast.success("Results updated successfully!");
        queryClient.invalidateQueries(["results"]); // Refresh results

        setEditStudent(null); // Clear edit state
        document.getElementById("edit_modal").close(); // Close modal
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update results.");
    }
  };

  if (batchesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-ring loading-xl"></span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white w-[1100px] mx-auto mt-5">
      {/* Upload Button with Aligned Text */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Upload or View Marks</h2>
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
          {instructorBatches.length === 0 ? (
            <option value="" disabled>
              No batches assigned
            </option>
          ) : (
            instructorBatches.map((batch) => (
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
      {batchId &&
        students.length > 0 &&
        !studentsLoading &&
        !resultsLoading && (
          <div className="overflow-x-auto bg-white p-4 rounded shadow">
            <div>
              <h3 className="text-xl font-bold mb-4">
                Results for Batch: {selectedBatchName}
              </h3>

              <PDFDownloadLink
                document={
                  <MyPDFDocument
                    students={students}
                    allResults={allResults}
                    selectedBatchName={selectedBatchName}
                  />
                }
                fileName={`Batch_${selectedBatchName}_Results.pdf`}
              >
                {({ loading }) =>
                  loading ? "Loading PDF..." : "Download Results as PDF"
                }
              </PDFDownloadLink>
            </div>
            <table className="min-w-full border-collapse border">
              <thead>
                <tr className="bg-blue-950 text-white">
                  <th className="px-4 py-2 text-left">SI</th>
                  <th className="px-4 py-2 text-left">Student Name</th>
                  <th className="px-4 py-2 text-left">Student ID</th>
                  <th className="px-4 py-2 text-center">Assignment</th>
                  <th className="px-4 py-2 text-center">Mid Term</th>
                  <th className="px-4 py-2 text-center">Project</th>
                  <th className="px-4 py-2 text-center">Final Exam</th>
                  <th className="px-4 py-2 text-center">Attendance</th>
                  <th className="px-4 py-2 text-center">Total</th>
                  <th className="px-4 py-2 text-center">Status</th>{" "}
                  {/* New Status Column */}
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => {
                  const studentResults = allResults.find(
                    (result) => result.studentID === student.studentID
                  );

                  const assignmentMarks = studentResults?.Assignment ?? "-";
                  const midTermMarks = studentResults?.Mid_Term ?? "-";
                  const projectMarks = studentResults?.Project ?? "-";
                  const finalExamMarks = studentResults?.Final_Exam ?? "-";
                  const attendanceMarks = studentResults?.Attendance ?? "-";

                  // Check if all marks are available
                  const allMarksAvailable =
                    assignmentMarks !== "-" &&
                    midTermMarks !== "-" &&
                    projectMarks !== "-" &&
                    finalExamMarks !== "-" &&
                    attendanceMarks !== "-";

                  const total = allMarksAvailable
                    ? Number(assignmentMarks) +
                      Number(midTermMarks) +
                      Number(projectMarks) +
                      Number(finalExamMarks) +
                      Number(attendanceMarks)
                    : "-";

                  // Determine status
                  const status = allMarksAvailable
                    ? total >= 40
                      ? "Pass"
                      : "Fail"
                    : ""; // Empty if any mark is missing

                  return (
                    <tr
                      key={student.studentID}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-2 border">{index + 1}</td>
                      <td className="px-4 py-2 border">{student.name}</td>
                      <td className="px-4 py-2 border">{student.studentID}</td>
                      <td className="px-4 py-2 border text-center">
                        {assignmentMarks}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {midTermMarks}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {projectMarks}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {finalExamMarks}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {attendanceMarks}
                      </td>
                      <td className="px-4 py-2 border text-center font-medium">
                        {total !== "-" ? total : "N/A"}
                      </td>
                      <td
                        className={`px-4 py-2 border text-center font-semibold ${
                          status === "Pass" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {status}
                      </td>
                      <td className="px-4 py-2 border flex gap-2 text-center">
                        <button
                          className="bg-blue-950 text-white px-2 py-1 rounded text-sm mr-1"
                          onClick={() => openEditModal(studentResults)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                          onClick={() =>
                            handleDeleteStudent(studentResults?._id)
                          }
                        >
                          Delete
                        </button>
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
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg text-center mt-2">
              Edit Exam Marks
            </h3>

            <p className="text-md text-center text-gray-600 mb-2">
              <strong>Batch ID:</strong> {editStudent.batchId} <br />
              <strong>Student ID:</strong> {editStudent.studentID}
            </p>

            {/* Editable Marks Fields */}
            {editedExams.map((exam, index) => (
              <div
                key={index}
                className="flex justify-between items-center mb-2"
              >
                <span className="font-medium">
                  {exam.field.replace(/_/g, " ")}:
                </span>
                <input
                  type="number"
                  className="input input-bordered w-32"
                  value={exam.value}
                  onChange={(e) => handleExamChange(index, e.target.value)}
                />
              </div>
            ))}

            <button
              onClick={handleSaveEdit}
              className="btn bg-blue-950 text-white w-full mt-4"
            >
              Save Changes
            </button>
          </div>
          <Toaster position="top-center" reverseOrder={false} />
        </dialog>
      )}

      {/* No data message */}
      {batchId &&
        !studentsLoading &&
        !resultsLoading &&
        students.length === 0 && (
          <div className="text-center py-20 bg-white p-4 rounded shadow">
            No students found for this batch.
          </div>
        )}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default ResultTable;
