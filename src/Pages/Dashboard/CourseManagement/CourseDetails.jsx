import React from "react";
import { useParams } from "react-router-dom";

const CourseDetails = () => {
    const { id } = useParams(); // Access the course ID from the URL

    // You can fetch the course details using this ID
    // For example, you could use useEffect to fetch data

    return (
        <div>
            <h1>Course Details for Course ID: {id}</h1>
            {/* Your logic to display course details goes here */}
        </div>
    );
};

export default CourseDetails;
