import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../Providers/AuthProvider';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import toast from 'react-hot-toast';

const ResultDisplay = () => {
  const { user, loading } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();

  const [studentID, setStudentID] = useState(null);
  const [resultData, setResultData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [batchInfo, setBatchInfo] = useState({});
  const [courseInfo, setCourseInfo] = useState({});
  const [noResultsFound, setNoResultsFound] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const fetchData = async () => {
        try {
          // Step 1: Get student info to get studentID
          const studentRes = await axiosSecure.get('/students');
          const matchedStudent = studentRes.data.find(
            (student) => student.userId === user._id
          );

          if (!matchedStudent) {
            toast.error("Student data not found.");
            setIsLoading(false);
            setNoResultsFound(true);
            return;
          }

          const studentID = matchedStudent.studentID;
          setStudentID(studentID);

          // Step 2: Fetch all results and filter by studentID
          const resultRes = await axiosSecure.get('/results');
          const matchedResults = resultRes.data.filter(
            (result) => result.studentID === studentID
          );

          if (matchedResults.length === 0) {
            setNoResultsFound(true);
            setIsLoading(false);
            return;
          }

          // Step 3: Fetch batch information for each result
          const batchIds = [...new Set(matchedResults.map(result => result.batchId))];
          const batchPromises = batchIds.map(batchId => 
            axiosSecure.get(`/batches/${batchId}`)
          );
          const batchResponses = await Promise.all(batchPromises);
          const batchInfoMap = batchResponses.reduce((acc, response) => {
            acc[response.data._id] = response.data;
            return acc;
          }, {});

          // Step 4: Fetch course information for each batch
          const courseIds = [...new Set(batchResponses.map(response => response.data.course_id))];
          const coursePromises = courseIds.map(courseId => 
            axiosSecure.get(`/courses/${courseId}`)
          );
          const courseResponses = await Promise.all(coursePromises);
          const courseInfoMap = courseResponses.reduce((acc, response) => {
            acc[response.data._id] = response.data;
            return acc;
          }, {});

          setBatchInfo(batchInfoMap);
          setCourseInfo(courseInfoMap);
          setResultData(matchedResults);
          setNoResultsFound(false);
        } catch (error) {
          toast.error("Error fetching result data.");
          console.error(error);
          setNoResultsFound(true);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [user, loading, axiosSecure]);

  // Function to calculate total marks and determine if all marks are available
  const calculateResult = (result) => {
    const examTypes = ['Mid_Term', 'Project', 'Assignment', 'Final_Exam', 'Attendance'];
    let total = 0;
    let allMarksAvailable = true;
    
    examTypes.forEach(type => {
      if (result[type] !== null) {
        total += result[type];
      } else {
        allMarksAvailable = false;
      }
    });

    return {
      total,
      allMarksAvailable,
      isPass: total >= 40
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  if (noResultsFound) {
    return (
      <div className="max-w-6xl mx-auto mt-8 bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">No Results Available</h2>
          <p className="text-gray-600 text-lg mb-4">We couldn't find any results for your account.</p>
          <p className="text-gray-500">
            This could be because:
            <ul className="list-disc text-left max-w-md mx-auto mt-2">
              <li>Your results haven't been published yet</li>
              <li>Your marks haven't been uploaded by the instructor</li>
              <li>There might be an issue with your student record</li>
            </ul>
          </p>
          <button 
            className="btn btn-primary mt-6"
            onClick={() => window.location.reload()}
          >
            Refresh Results
          </button>
        </div>
      </div>
    );
  }

  // Exam types to display in the table
  const examTypes = [
    { key: 'Mid_Term', label: 'Mid Term' },
    { key: 'Project', label: 'Project' },
    { key: 'Assignment', label: 'Assignment' },
    { key: 'Final_Exam', label: 'Final Exam' },
    { key: 'Attendance', label: 'Attendance' }
  ];

  return (
    <div className="max-w-6xl mx-auto mt-8 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Academic Results</h2>

      <div className="space-y-8">
        {resultData.map((result) => {
          const batch = batchInfo[result.batchId] || {};
          const course = courseInfo[batch.course_id] || {};
          const { total, allMarksAvailable, isPass } = calculateResult(result);
          
          return (
            <div key={result._id} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-3 border-b">
                <h3 className="font-semibold">
                  Batch: {batch.batchName || 'N/A'} | 
                  Course: {course.courseName || 'N/A'}
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Exam Type</th>
                      <th>Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examTypes.map((exam) => (
                      <tr key={exam.key}>
                        <td>{exam.label}</td>
                        <td>
                          {result[exam.key] !== null ? (
                            <span className="font-medium">{result[exam.key]}</span>
                          ) : (
                            <span className="text-gray-500">Not available</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-gray-50">
                      <td>Total Marks</td>
                      <td>{total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600">
                {allMarksAvailable ? (
                  <div className="flex justify-between items-center">
                    <span>Last updated: {new Date(result.createdAt).toLocaleDateString()}</span>
                    <span className={`font-bold ${isPass ? 'text-green-600' : 'text-red-600'}`}>
                      {isPass ? 'PASS' : 'FAIL'} (Minimum 40 required)
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                 
                    <span className="text-blue-600">
                      Result pending - waiting for all marks to be uploaded
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultDisplay;