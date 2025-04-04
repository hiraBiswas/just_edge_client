import React, { useState, useEffect } from "react";
import EnrollmentRequests from "./BatchEnrollment/EnrollmentRequests";

const StudentDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading (replace with actual loading logic)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full  p-4 md:p-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-full ">
          <span className="loading loading-ring loading-xl text-primary"></span>
         
        </div>
      ) : (
        <>
          {/* Progress Steps */}
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-white rounded-lg shadow-sm">
            <ul className="steps w-full">
              <li className="step step-primary">Enrollment</li>
              <li className="step step-primary">Payment</li>
              <li className="step">Confirmation</li>
              <li className="step">Completion</li>
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