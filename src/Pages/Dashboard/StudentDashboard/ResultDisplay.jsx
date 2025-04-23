import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../Providers/AuthProvider";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import toast from "react-hot-toast";

const ResultDisplay = () => {
  const { user, loading } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noResultsFound, setNoResultsFound] = useState(false);

  useEffect(() => {
    if (!loading && user?._id) {
      const fetchResults = async () => {
        try {
          const response = await axiosSecure.get(`/results-by-user/${user._id}`);

          // Handle different response structures
          if (response.data.error) {
            toast.error(response.data.error);
            setNoResultsFound(true);
          } else if (response.data.data && Array.isArray(response.data.data)) {
            // Handle response with data property
            if (response.data.data.length === 0) {
              setNoResultsFound(true);
            } else {
              setResults(response.data.data);
            }
          } else if (Array.isArray(response.data)) {
            // Handle direct array response
            if (response.data.length === 0) {
              setNoResultsFound(true);
            } else {
              setResults(response.data);
            }
          } else {
            toast.error("Unexpected response format");
            setNoResultsFound(true);
          }
        } catch (error) {
          console.error("Error fetching results:", error);
          toast.error("Failed to load results");
          setNoResultsFound(true);
        } finally {
          setIsLoading(false);
        }
      };

      fetchResults();
    }
  }, [user, loading, axiosSecure]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-ring loading-xl"></span>
      </div>
    );
  }

  if (noResultsFound) {
    return (
      <div className="max-w-6xl flex justify-center items-center min-h-screen mx-auto ">
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Result has not published yet.</h2>
       
        </div>
      </div>
    );
  }

  const examTypes = [
    { key: "Mid_Term", label: "Mid Term" },
    { key: "Project", label: "Project" },
    { key: "Assignment", label: "Assignment" },
    { key: "Final_Exam", label: "Final Exam" },
    { key: "Attendance", label: "Attendance" },
  ];

  return (
    <div className="w-2xl mx-auto mt-8 flex items-center justify-center p-6">
      <div className="space-y-6 w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Your Academic Results
        </h2>
        
        {Array.isArray(results) && results.map((result) => (
          <div
            key={result._id || Math.random()}
            className="border rounded-lg overflow-hidden shadow-sm"
          >
            <div className="bg-gradient-to-r from-blue-50 to-gray-50 px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {result.courseName || "Course Not Found"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Batch: {result.batchName || "N/A"}
                  </p>
                </div>
                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    result.status === "Pass"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {result.status} ({result.total}/100)
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left pl-6">Exam Type</th>
                    <th className="text-center">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {examTypes.map((exam) => (
                    <tr key={exam.key} className="hover:bg-gray-50">
                      <td className="pl-6 py-4 font-medium text-gray-700">
                        {exam.label}
                      </td>
                      <td className="text-center">
                        <span
                          className={`font-medium ${
                            result[exam.key] === null
                              ? "text-gray-400"
                              : "text-gray-800"
                          }`}
                        >
                          {result[exam.key] !== null ? result[exam.key] : "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultDisplay;