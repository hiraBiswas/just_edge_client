import React from "react";
import EnrollmentRequests from "./BatchEnrollment/EnrollmentRequests";

const StudentDashboard = () => {
  return (
    <div>
      <div>
        <ul className="steps">
          <li className="step step-info">Fly to moon</li>
          <li className="step step-info">Shrink the moon</li>
          <li className="step step-info">Grab the moon</li>
          <li className="step step-error" data-content="?">
            Sit on toilet
          </li>
        </ul>
      </div>
      <EnrollmentRequests></EnrollmentRequests>
    </div>
  );
};

export default StudentDashboard;
