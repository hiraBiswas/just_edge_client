import React, { useEffect, useState } from "react";
import { FaCalendarAlt, FaDownload, FaExternalLinkAlt } from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const Notice = () => {
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNotices, setFilteredNotices] = useState([]);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await axiosSecure.get("/notice");
        setNotices(response.data);
        setFilteredNotices(response.data); // Initialize with all notices
      } catch (error) {
        console.error("Error fetching notices:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotices();
  }, [axiosSecure]);

    // Filter notices instantly as the user types
    useEffect(() => {
        const filtered = notices.filter((notice) =>
          notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notice.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredNotices(filtered);
      }, [searchQuery, notices]);

  // Function to handle direct download attempt
  const handleDownload = async (url, title) => {
    const fileName = title ? `${title.replace(/\s+/g, "_")}.jpg` : "download.jpg";
    
    try {
      // First, try to fetch the image as a blob
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const blob = await response.blob();
      
      // Create blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error) {
      console.error("Error downloading file:", error);
      // Fallback: Open in new tab if direct download fails
      window.open(url, '_blank');
    }
  };

  // Function to view the image in a new tab
  const handleView = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="container mx-auto mt-32 p-8 rounded-2xl shadow-2xl bg-white w-5/6">
      {/* Search Input */}
      <div className="w-full bg-blue-950 h-16 -mt-12 flex items-center justify-center rounded-xl">
        <label className="input my-4 w-4/6 flex items-center bg-white p-2 rounded-lg">
          <svg
            className="h-5 w-5 text-gray-500 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2.5"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </g>
          </svg>
          <input type="search" className="grow outline-none" value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}  placeholder="Search Notices..." />
        </label>
      </div>

      {/* Notices List */}
      {isLoading ? (
         <div className="flex items-center justify-center h-96">
         <span className="loading loading-ring loading-xl"></span>
       </div>
      ) : (
        <ul className="mt-8 space-y-6">
          {filteredNotices.map((notice) => (
            <li key={notice._id} className="p-4 bg-gray-100 rounded-lg shadow-md">
              
              {/* Date and Download Button (Aligned in Row) */}
              <div className="flex items-center justify-between text-gray-600 mb-2">
                <div className="flex items-center">
                  <FaCalendarAlt className="text-blue-950 mr-2" />
                  <span className="font-medium">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Download and View Buttons (if attachment exists) */}
                {notice.attachment && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(notice.attachment, notice.title)}
                      className="inline-flex items-center bg-blue-950 text-white px-4 py-2 drop-shadow-xl rounded-lg hover:bg-blue-800 transition"
                    >
                      <FaDownload className="mr-2" /> Download
                    </button>
                    {/* <button
                      onClick={() => handleView(notice.attachment)}
                      className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      <FaExternalLinkAlt className="mr-2" /> View
                    </button> */}
                  </div>
                )}
              </div>

              {/* Notice Title */}
              <h2 className="text-lg font-semibold">{notice.title}</h2>

              {/* Tags */}
              {notice.tags && notice.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 ">
                  <span className="font-semibold text-gray-700">Tags:</span>
                  {notice.tags.map((tag, index) => (
                    <span key={index} className="text-black px-3 py-1 text-md ">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notice;