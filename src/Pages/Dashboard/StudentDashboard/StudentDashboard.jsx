import React, { useState, useEffect, useContext } from 'react';
import EnrollmentRequests from "./BatchEnrollment/EnrollmentRequests";
import { AuthContext } from "../../../Providers/AuthProvider";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import toast from "react-hot-toast";

const StudentDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();
  const [studentData, setStudentData] = useState(null);
  const [hasOnlineProfile, setHasOnlineProfile] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const fetchStudentData = async () => {
        try {
          const response = await axiosSecure.get('/students');
          const matchedStudent = response.data.find(student => student.userId === user._id);

          if (matchedStudent) {
            setStudentData(matchedStudent);

            // ✅ Check Online Profile
            const res = await axiosSecure.get(`/onlineProfile/${matchedStudent._id}`);
            if (res.data?.success && res.data?.data) {
              setHasOnlineProfile(true);
            }

            // ✅ Check Results
            const resultRes = await axiosSecure.get('/results');
            const studentHasResult = resultRes.data.some(result => result.studentID === matchedStudent.studentID);
            if (studentHasResult) {
              setHasResult(true);
            }
          }
        } catch (err) {
          toast.error("Error fetching student, profile or result data.");
        }
      };
      fetchStudentData();
    }
  }, [loading, user, axiosSecure]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const getStepStatus = () => {
    const steps = [
      { label: "Registered", completed: !!studentData },
      { label: "Enrolled to Batch", completed: !!studentData?.enrolled_batch },
      { label: "Uploaded Documents", completed: !!studentData?.fatherName && !!studentData?.motherName },
      { label: "Updated Online Profile", completed: hasOnlineProfile },
      { label: "Result", completed: hasResult },
    ];
    return steps;
  };

  return (
    <div className="min-h-screen w-[1100px]">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <span className="loading loading-ring loading-xl text-primary"></span>
        </div>
      ) : (
        <>
          {/* Progress Steps */}
          <div className="w-full mx-auto mb-2 mt-6 bg-white rounded-lg shadow-sm">
            <ul className="steps w-full overflow-x-auto">
              {getStepStatus().map((step, index) => (
                <li
                  key={index}
                  className={`step ${step.completed ? "step-primary" : ""}`}
                >
                  {step.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto">
            <EnrollmentRequests onLoadingComplete={() => setIsLoading(false)} />
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
