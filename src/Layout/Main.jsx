import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Navbar from '../Component/Navbar/Navbar';
import Footer from '../Component/Footer/Footer';
import Marquee from 'react-fast-marquee';
import useAxiosSecure from '../hooks/useAxiosSecure';

const Main = () => {
  const axiosSecure = useAxiosSecure();
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await axiosSecure.get('/notice');
        console.log("Fetched notices:", response.data);
  
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset today's time to midnight
  
        const filteredNotices = response.data.filter(notice => {
          if (notice.isDeleted === false && notice.deadline) {
            const noticeDeadline = new Date(notice.deadline);
            noticeDeadline.setHours(0, 0, 0, 0);
            return noticeDeadline >= today;
          }
          return false;
        });
  
        setNotices(filteredNotices);
      } catch (error) {
        console.error('Error fetching notices:', error);
      }
    };
    
    fetchNotices();
  }, [axiosSecure]);
  

  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed Header Section */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Notices Marquee Section */}
        {notices.length > 0 && (
          <div className="h-8 bg-blue-950 text-white flex items-center">
            <button className="bg-blue-500 text-white btn px-4">Latest</button>
            <Marquee pauseOnHover={true} speed={80} className="flex-grow">
              {notices.map(notice => (
                <Link key={notice._id} className="mr-12 font-medium" to="/notice">
                  {notice.title}
                </Link>
              ))}
            </Marquee>
          </div>
        )}
        
        {/* Navbar */}
        <div className=''>
          <Navbar />
        </div>
      </div>

      {/* Main Content - Add padding top to account for fixed header */}
      <div className="flex-grow"> {/* Adjust pt-28 based on your header height */}
        <Outlet />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Main;