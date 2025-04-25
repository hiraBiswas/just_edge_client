import React, { useEffect, useState } from "react";
import axios from "axios";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import {
  FaDownload,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// Define the PDF styles (same as your provided styles)
const pdfStyles = StyleSheet.create({
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

// PDF Document Component
const ResultsPDF = ({ batchName, students, results }) => {
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Calculate statistics
  const passCount = results.filter((r) => r.status === "Pass").length;
  const failCount = results.filter((r) => r.status === "Fail").length;
  const totalStudents = results.length;
  const passRate =
    totalStudents > 0 ? ((passCount / totalStudents) * 100).toFixed(1) : 0;

  return (
    <Document>
      <Page style={pdfStyles.page}>
        <View style={pdfStyles.headerSection}>
          <Text style={pdfStyles.title}>Batch Results Report</Text>
          <Text style={pdfStyles.subtitle}>{batchName}</Text>
          <Text style={pdfStyles.dateText}>Generated on: {currentDate}</Text>
        </View>

        <View style={pdfStyles.summarySection}>
          <View style={pdfStyles.summaryBox}>
            <Text style={pdfStyles.summaryTitle}>Summary Statistics</Text>
            <Text style={pdfStyles.summaryContent}>
              Total Students: {totalStudents}
            </Text>
            <Text style={pdfStyles.summaryContent}>Passed: {passCount}</Text>
            <Text style={pdfStyles.summaryContent}>Failed: {failCount}</Text>
            <Text style={pdfStyles.summaryContent}>Pass Rate: {passRate}%</Text>
          </View>
        </View>

        <View style={pdfStyles.table}>
          <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
            <Text
              style={[
                pdfStyles.tableCell,
                pdfStyles.header,
                pdfStyles.wideCell,
              ]}
            >
              Student
            </Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.header]}>ID</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.header]}>
              Mid Term
            </Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.header]}>Project</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.header]}>
              Assignment
            </Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.header]}>
              Final Exam
            </Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.header]}>
              Attendance
            </Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.header]}>Total</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.header]}>Status</Text>
          </View>

          {results.map((result) => (
            <View key={result.studentID} style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.tableCell, pdfStyles.wideCell]}>
                {result.name}
              </Text>
              <Text style={pdfStyles.tableCell}>{result.studentID}</Text>
              <Text style={pdfStyles.tableCell}>
                {result.result.Mid_Term || 0}
              </Text>
              <Text style={pdfStyles.tableCell}>
                {result.result.Project || 0}
              </Text>
              <Text style={pdfStyles.tableCell}>
                {result.result.Assignment || 0}
              </Text>
              <Text style={pdfStyles.tableCell}>
                {result.result.Final_Exam || 0}
              </Text>
              <Text style={pdfStyles.tableCell}>
                {result.result.Attendance || 0}
              </Text>
              <Text style={pdfStyles.tableCell}>{result.total}</Text>
              <Text style={pdfStyles.tableCell}>{result.status}</Text>
            </View>
          ))}
        </View>

        <View style={pdfStyles.footer}>
          <Text>Official Results Document - {batchName}</Text>
        </View>
      </Page>
    </Document>
  );
};

const PublishResult = () => {
  const [allBatches, setAllBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [batchStatus, setBatchStatus] = useState(null);
  const [loading, setLoading] = useState({
    batches: true,
    results: false
  });
  const [publishing, setPublishing] = useState(false);
  const axiosSecure = useAxiosSecure();

 // Fetch all batches on component mount
 useEffect(() => {
  const fetchBatches = async () => {
    try {
      const res = await axiosSecure.get("/batches");
      const data = res.data;
      const validBatches = data.filter(
        (batch) => batch.status === "Ongoing" || batch.status === "Completed"
      );
      
      setAllBatches(data);
      setFilteredBatches(validBatches);

      // Auto-select the first batch if available
      if (validBatches.length > 0) {
        setSelectedBatchId(validBatches[0]._id);
      }
    } catch (err) {
      console.error("Error fetching batches:", err);
      toast.error("Failed to load batches");
    } finally {
      setLoading(prev => ({ ...prev, batches: false }));
    }
  };

  fetchBatches();
}, [axiosSecure]);

  useEffect(() => {
    if (selectedBatchId) {
      fetchBatchResults();
    }
  }, [selectedBatchId, axiosSecure]);

    // Fetch batch results when selectedBatchId changes
    useEffect(() => {
      if (!selectedBatchId) return;
  
      const fetchResults = async () => {
        setLoading(prev => ({ ...prev, results: true }));
        setBatchStatus(null);
        
        try {
          const res = await axiosSecure.get(`/results/batch-status/${selectedBatchId}`);
          setBatchStatus(res.data);
        } catch (err) {
          console.error("Error fetching batch results:", err);
          
          if (err.response?.status === 404) {
            setBatchStatus({
              isPublished: false,
              data: [],
              message: err.response.data.message || "Results not uploaded yet",
              noResults: true,
              batchExists: err.response.data.batchExists
            });
          } else {
            toast.error("Failed to load batch results");
          }
        } finally {
          setLoading(prev => ({ ...prev, results: false }));
        }
      };
  
      fetchResults();
    }, [selectedBatchId, axiosSecure]);
  
    const handleSelectChange = (e) => {
      setSelectedBatchId(e.target.value);
    };
  
    const handlePublishResults = async () => {
      if (!selectedBatchId) return;
  
      setPublishing(true);
      try {
        const res = await axiosSecure.put(`/results/publish/${selectedBatchId}`);
        toast.success(res.data.message || "Results published successfully");
        // Refresh the results after publishing
        const newResults = await axiosSecure.get(`/results/batch-status/${selectedBatchId}`);
        setBatchStatus(newResults.data);
      } catch (err) {
        console.error("Error publishing results:", err);
        toast.error(err.response?.data?.message || "Failed to publish results");
      } finally {
        setPublishing(false);
      }
    };
  
    const getSelectedBatchName = () => {
      if (!selectedBatchId) return "Selected Batch";
      const batch = allBatches.find((b) => b._id === selectedBatchId);
      return batch ? batch.batchName : "Selected Batch";
    };
  
    // Calculate statistics for the PDF
    const getResultsStatistics = () => {
      if (!batchStatus?.data?.length) return null;
      
      const passCount = batchStatus.data.filter((r) => r.status === "Pass").length;
      const failCount = batchStatus.data.filter((r) => r.status === "Fail").length;
      const totalStudents = batchStatus.data.length;
      const passRate = totalStudents > 0 ? ((passCount / totalStudents) * 100).toFixed(1) : 0;
  
      return { passCount, failCount, totalStudents, passRate };
    };
  


  const fetchBatchResults = () => {
    setLoading(true);
    axiosSecure
      .get(`/results/batch-status/${selectedBatchId}`)
      .then((res) => {
        setBatchStatus(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching batch results:", err);
        if (err.response?.status === 404) {
          // Set batch status with empty data and message from the API
          setBatchStatus({
            isPublished: false,
            data: [],
            message: err.response.data.message || "Results not uploaded yet",
            details:
              err.response.data.details ||
              "No results have been uploaded for this batch",
            noResults: true,
            batchExists: err.response.data.batchExists,
          });
        } else {
          toast.error("Failed to load batch results");
        }
        setLoading(false);
      });
  };


  return (
    <div className="w-[1100px] mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Result Publication
      </h2>

      <div className="mb-4 flex justify-between items-center gap-4">
        <div className="w-full">
          <select
            id="batch-select"
            value={selectedBatchId}
            onChange={handleSelectChange}
            className="select-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={loading.batches}
          >
            <option value="">Select Batch</option>
            {filteredBatches.map((batch) => (
              <option key={batch._id} value={batch._id}>
                {batch.batchName} ({batch.status})
              </option>
            ))}
          </select>
        </div>

        {selectedBatchId && batchStatus && (
          <div className="flex items-center gap-4">
            {batchStatus.isPublished ? (
              <span className="flex items-center text-green-600 font-medium text-sm">
                <FaCheckCircle className="mr-1" /> Published
              </span>
            ) : (
              <span className="flex items-center text-yellow-600 font-medium text-sm">
                <FaTimesCircle className="mr-1" /> Unpublished
              </span>
            )}

            {batchStatus.isPublished ? (
              <PDFDownloadLink
                document={
                  <ResultsPDF
                    batchName={getSelectedBatchName()}
                    results={batchStatus.data || []}
                  />
                }
                fileName={`${getSelectedBatchName()}_results.pdf`}
                className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm whitespace-nowrap"
              >
                {({ loading }) =>
                  loading ? (
                    <span className="flex items-center">
                      <FaSpinner className="animate-spin mr-1.5" /> Preparing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FaDownload className="mr-1.5" /> Download PDF
                    </span>
                  )
                }
              </PDFDownloadLink>
            ) : (
              <button
                 className="flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md text-sm whitespace-nowrap"
                onClick={handlePublishResults}
                disabled={publishing || batchStatus.noResults}
              >
                {publishing ? (
                  <span className="flex items-center">
                    <FaSpinner className="animate-spin mr-1.5" /> Publishing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FaEye className="mr-1.5" /> Publish Results
                  </span>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {loading.batches ? (
        <div className="flex items-center justify-center h-[calc(100vh-180px)] bg-white rounded-lg shadow border border-gray-200">
          <span className="loading loading-ring loading-lg"></span>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 max-h-[calc(100vh-180px)] overflow-hidden flex flex-col">
          {loading.results ? (
            <div className="flex-1 flex items-center justify-center h-[calc(100vh-180px)]">
              <span className="loading loading-ring loading-lg"></span>
            </div>
          ) : selectedBatchId && batchStatus ? (
            <>
              <div className="overflow-auto flex-1">
                <table className="w-full relative">
                  <thead className="sticky top-0 bg-blue-950 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                        SI
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                        Student ID
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                        Mid Term
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                        Project
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                        Assignment
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                        Final Exam
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                        Attendance
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {batchStatus.noResults || batchStatus.data?.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-4 py-8 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <svg
                              className="w-12 h-12 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <p className="text-gray-500 font-medium">
                              {batchStatus.message ||
                                "No results found for this batch"}
                            </p>
                            {!batchStatus.batchExists && (
                              <p className="text-gray-400 text-sm">
                                The selected batch might not exist in the system
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      batchStatus.data?.map((student, index) => (
                        <tr key={index} className="hover:bg-blue-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {student.studentID}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {student.result.Mid_Term || 0}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {student.result.Project || 0}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {student.result.Assignment || 0}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {student.result.Final_Exam || 0}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {student.result.Attendance || 0}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.total}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                student.status === "Pass"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {batchStatus.data?.length > 0 && (
                <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 text-xs text-gray-600">
                  <div className="flex justify-between items-center">
                    <div>
                      Total: {batchStatus.data.length} | Passed:{" "}
                      <span className="text-green-600">
                        {batchStatus.data.filter((s) => s.status === "Pass").length}
                      </span>{" "}
                      | Failed:{" "}
                      <span className="text-red-600">
                        {batchStatus.data.filter((s) => s.status === "Fail").length}
                      </span>
                    </div>
                    {batchStatus.isPublished && (
                      <div className="text-green-600 font-medium">
                        Results published
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              {selectedBatchId
                ? "Loading results..."
                : "Please select a batch to view results"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublishResult;
