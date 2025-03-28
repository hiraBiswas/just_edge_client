import React, { useEffect, useState } from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const Notice = () => {
    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const axiosSecure = useAxiosSecure();

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const response = await axiosSecure.get('/notice');
                setNotices(response.data);
            } catch (error) {
                console.error('Error fetching notices:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotices();
    }, [axiosSecure]);

    return (
        <div className='container mx-12 mt-32 rounded-2xl shadow-2xl'>
           <div className='p-12'>

            <div>
            <label className="input">
  <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g></svg>
  <input type="search" className="grow" placeholder="Search" />
  <kbd className="kbd kbd-sm">⌘</kbd>
  <kbd className="kbd kbd-sm">K</kbd>
</label>
            </div>
           {isLoading ? (
                <p>Loading notices...</p>
            ) : (
                <ul>
                    {notices.map(notice => (
                        <li key={notice._id}>{notice.title}</li>
                    ))}
                </ul>
            )}
           </div>
        </div>
    );
};

export default Notice;
