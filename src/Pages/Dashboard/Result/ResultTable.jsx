import React, { useState, useEffect, useContext } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import UploadResult from "./UploadResult";
import { Toaster, toast } from "react-hot-toast";
import { AuthContext } from "../../../Providers/AuthProvider";
import {
  FaPencilAlt as PencilIcon,
  FaTrash as TrashIcon,
} from "react-icons/fa";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 30,
    backgroundColor: "#ffffff",
  },
  headerSection: {
    marginBottom: 15,
    paddingBottom: 5,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 3,
  },
  performance: {
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 5,
  },
  dateText: {
    fontSize: 8,
    textAlign: "right",
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000000",
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#000000",
    minHeight: 20,
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
  },
  tableCell: {
    padding: 3,
    flex: 1,
    textAlign: "center",
    fontSize: 7,
    borderRightWidth: 0.5,
    borderRightColor: "#000000",
    justifyContent: "center",
  },
  header: {
    fontWeight: "bold",
  },
  narrowCell: {
    flex: 0.5,
  },
  wideCell: {
    flex: 1.2,
  },
  footer: {
    textAlign: "center",
    marginTop: 15,
    fontSize: 7,
    color: "#555555",
    paddingTop: 5,
  },
  summarySection: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryBox: {
    padding: 0,
    width: "45%",
  },
  summaryTitle: {
    fontSize: 7,
    fontWeight: "bold",
    marginBottom: 1,
    textDecoration: "underline",
    textAlign: "center",
  },
  summaryContent: {
    fontSize: 6,
    marginBottom: 1,
    textAlign: "center",
  },
});

const MyPDFDocument = ({ students, allResults, selectedBatchName }) => {
  const totalStudents = students.length;
  const studentsWithResults = students.filter((student) =>
    allResults.some((result) => result.studentID === student.studentID)
  ).length;

  const passCount = students.filter((student) => {
    const studentResults = allResults.find(
      (result) => result.studentID === student.studentID
    );
    if (!studentResults) return false;

    // Check if any field is null
    const hasNullField =
      studentResults.Assignment === null ||
      studentResults.Mid_Term === null ||
      studentResults.Project === null ||
      studentResults.Final_Exam === null ||
      studentResults.Attendance === null;

    // If any field is null, the student fails regardless of total
    if (hasNullField) return false;

    // Calculate total treating null values as 0 (though we've already checked for nulls above)
    const total =
      (studentResults.Assignment || 0) +
      (studentResults.Mid_Term || 0) +
      (studentResults.Project || 0) +
      (studentResults.Final_Exam || 0) +
      (studentResults.Attendance || 0);

    return total >= 60;
  }).length;

  const failCount = studentsWithResults - passCount;
  const passRate =
    studentsWithResults > 0
      ? ((passCount / studentsWithResults) * 100).toFixed(1)
      : 0;

  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Result Summary</Text>
          <Text style={styles.subtitle}>Batch: {selectedBatchName}</Text>
          <Text style={styles.dateText}>Report Date: {currentDate}</Text>
        </View>

        <View>
          <Text style={styles.performance}>
            Total Students: {totalStudents}
          </Text>
          <Text style={styles.performance}>Pass: {passCount}</Text>
          <Text style={styles.performance}>Fail: {failCount}</Text>
          <Text style={styles.performance}>Pass Rate: {passRate}%</Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.header, styles.wideCell]}>
              Student Name
            </Text>
            <Text style={[styles.tableCell, styles.header]}>Student ID</Text>
            <Text style={[styles.tableCell, styles.header]}>Assignment</Text>
            <Text style={[styles.tableCell, styles.header]}>Mid Term</Text>
            <Text style={[styles.tableCell, styles.header]}>Project</Text>
            <Text style={[styles.tableCell, styles.header]}>Final Exam</Text>
            <Text style={[styles.tableCell, styles.header]}>Attendance</Text>
            <Text style={[styles.tableCell, styles.header]}>Total</Text>
            <Text style={[styles.tableCell, styles.header]}>Status</Text>
          </View>

          {students.map((student) => {
            const result = allResults.find(
              (r) => r.studentID === student.studentID
            );

            // Display values (for showing in the table)
            const assignment = result?.Assignment ?? "-";
            const midTerm = result?.Mid_Term ?? "-";
            const project = result?.Project ?? "-";
            const finalExam = result?.Final_Exam ?? "-";
            const attendance = result?.Attendance ?? "-";

            // Check if student has any results
            const hasResults = result !== undefined;

            // Check if any field is null
            const hasNullField =
              hasResults &&
              (result.Assignment === null ||
                result.Mid_Term === null ||
                result.Project === null ||
                result.Final_Exam === null ||
                result.Attendance === null);

            // Calculate total (counting null values as 0)
            const total = hasResults
              ? (result.Assignment || 0) +
                (result.Mid_Term || 0) +
                (result.Project || 0) +
                (result.Final_Exam || 0) +
                (result.Attendance || 0)
              : 0;

            // Status determination
            let status = "Fail";
            if (hasResults && !hasNullField && total >= 60) {
              status = "Pass";
            }

            return (
              <View key={student.studentID} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.wideCell]}>
                  {student.name}
                </Text>
                <Text style={styles.tableCell}>{student.studentID}</Text>
                <Text style={styles.tableCell}>{assignment}</Text>
                <Text style={styles.tableCell}>{midTerm}</Text>
                <Text style={styles.tableCell}>{project}</Text>
                <Text style={styles.tableCell}>{finalExam}</Text>
                <Text style={styles.tableCell}>{attendance}</Text>
                <Text style={styles.tableCell}>{hasResults ? total : "0"}</Text>
                <Text style={styles.tableCell}>{status}</Text>
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
};

const ResultTable = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [batchId, setBatchId] = useState("");
  const [selectedBatchName, setSelectedBatchName] = useState("");
  const [editStudent, setEditStudent] = useState(null);
  const [editedExams, setEditedExams] = useState([]);
  const { user } = useContext(AuthContext);

  const MAX_MARKS = {
    Attendance: 10,
    Mid_Term: 25,
    Assignment: 10,
    Project: 25,
    Final_Exam: 30,
  };

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

  // Check if the batch results are published
  const isBatchPublished = () => {
    if (!batchId || allResults.length === 0) return false;

    // Check if any result in this batch is published
    return allResults.some(
      (result) => result.batchId === batchId && result.isPublished
    );
  };

  const batchPublished = isBatchPublished();

  // Open Edit Modal
  const openEditModal = (studentResults) => {
    setEditStudent(studentResults);

    // Exclude fields not meant to be edited
    const editableFields = Object.keys(studentResults)
      .filter(
        (key) =>
          ![
            "_id",
            "batchId",
            "studentID",
            "createdAt",
            "isPublished",
            "isDeleted",
          ].includes(key)
      )
      .map((key) => ({ field: key, value: studentResults[key] ?? "" }));

    setEditedExams(editableFields);
    document.getElementById("edit_modal").showModal();
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
          duration: 3000,
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
        queryClient.invalidateQueries(["results"]);
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
          acc[exam.field] = exam.value;
          return acc;
        }, {}),
      };

      const res = await axiosSecure.patch("/results/update", updatedData);

      if (res.status === 200) {
        toast.success("Results updated successfully!");
        queryClient.invalidateQueries(["results"]);
        setEditStudent(null);
        document.getElementById("edit_modal").close();
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
    <div className="p-6 bg-base-100 w-[1150px] mx-auto ">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Upload or View Marks</h2>
        <UploadResult />
      </div>

      <div className="mb-6 bg-white flex items-center gap-3">
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

      {batchId && (studentsLoading || resultsLoading) && (
        <div className="text-center py-20">
          <span className="loading loading-ring loading-xl"></span>
        </div>
      )}

      {batchId &&
        students.length > 0 &&
        !studentsLoading &&
        !resultsLoading && (
          <div className="overflow-x-auto ">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold mb-4">
                Results for Batch: {selectedBatchName}
              </h3>

              {batchPublished && (
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
                  {({ loading }) => (
                    <button className="px-4 py-2 bg-blue-950 text-white rounded-md hover:bg-blue-700 transition duration-300">
                      {loading ? "Generating PDF..." : "Download Results PDF"}
                    </button>
                  )}
                </PDFDownloadLink>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-950">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-lg">
                        SI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                        Assignment
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                        Mid Term
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                        Final Exam
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                        Attendance
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider rounded-tr-lg">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.length === 0 ? (
                      <tr>
                        <td
                          colSpan="11"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <svg
                              className="w-12 h-12 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                            <p className="mt-2 text-sm font-medium text-gray-600">
                              No students available
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Add students to get started
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      students.map((student, index) => {
                        const studentResults = allResults.find(
                          (result) => result.studentID === student.studentID
                        );

                        const assignmentMarks =
                          studentResults?.Assignment ?? "-";
                        const midTermMarks = studentResults?.Mid_Term ?? "-";
                        const projectMarks = studentResults?.Project ?? "-";
                        const finalExamMarks =
                          studentResults?.Final_Exam ?? "-";
                        const attendanceMarks =
                          studentResults?.Attendance ?? "-";

                        const hasResults = studentResults !== undefined;
                        const hasNullField =
                          hasResults &&
                          (studentResults.Assignment === null ||
                            studentResults.Mid_Term === null ||
                            studentResults.Project === null ||
                            studentResults.Final_Exam === null ||
                            studentResults.Attendance === null);

                        const total = hasResults
                          ? (studentResults.Assignment || 0) +
                            (studentResults.Mid_Term || 0) +
                            (studentResults.Project || 0) +
                            (studentResults.Final_Exam || 0) +
                            (studentResults.Attendance || 0)
                          : 0;

                        let status = "Fail";
                        if (hasResults && !hasNullField && total >= 60) {
                          status = "Pass";
                        }

                        return (
                          <tr
                            key={student.studentID}
                            className="hover:bg-blue-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {student.studentID}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                              {assignmentMarks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                              {midTermMarks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                              {projectMarks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                              {finalExamMarks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                              {attendanceMarks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-900">
                              {hasResults ? total : "0"}
                            </td>
                            <td
                              className={`px-6 py-4 whitespace-nowrap text-sm text-center font-semibold ${
                                status === "Pass"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {status}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center justify-center space-x-2">
                                {studentResults ? (
                                  <>
                                    <button
                                      onClick={() =>
                                        openEditModal(studentResults)
                                      }
                                      className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:hover:text-gray-400 disabled:cursor-not-allowed"
                                      title="Edit"
                                      disabled={batchPublished}
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteStudent(studentResults._id)
                                      }
                                      className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:hover:text-gray-400 disabled:cursor-not-allowed"
                                      title="Delete"
                                      disabled={batchPublished}
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-gray-400 italic text-xs">
                                    Not Uploaded
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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
              {/* <strong>Batch ID:</strong> {editStudent.batchId} <br /> */}
              <strong>Student ID:</strong> {editStudent.studentID}
            </p>

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
                  value={exam.value ?? ""}
                  onChange={(e) => handleExamChange(index, e.target.value)}
                  min="0"
                  max={MAX_MARKS[exam.field]}
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

      {batchId &&
        !studentsLoading &&
        !resultsLoading &&
        students.length === 0 && (
          <div className="text-center py-20 bg-white p-4 rounded-sm shadow-sm">
            No students found for this batch.
          </div>
        )}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default ResultTable;
