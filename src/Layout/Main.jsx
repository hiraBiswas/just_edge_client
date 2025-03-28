import React, { useContext, useEffect, useState } from 'react';
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
        const today = new Date();
        const filteredNotices = response.data.filter(notice => new Date(notice.deadline) >= today);
        setNotices(filteredNotices);
      } catch (error) {
        console.error('Error fetching notices:', error);
      }
    };
    fetchNotices();
  }, [axiosSecure]);

  return (
    <div>
      {/* Notices Marquee Section */}
      {notices.length > 0 && (
       <div className="h-8 bg-blue-950 text-white   flex items-center">
       {/* Latest Button */}
       <button className="bg-blue-500 text-white btn  px-4 ">Latest</button>
       
       {/* Marquee for notices */}
       <Marquee pauseOnHover={true} speed={80} className="flex-grow">
         {notices.map(notice => (
           <Link key={notice._id} className="mr-12 font-medium " to="/notice">
             {notice.title}
           </Link>
         ))}
       </Marquee>
     </div>
     
      )}

  <div className=''>
  <Navbar></Navbar>
  </div> 

      <div className="">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Main;
