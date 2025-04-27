import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { Link } from "react-router-dom";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { FaFire } from "react-icons/fa";

const NoticeSlider = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const axiosSecure = useAxiosSecure();

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const response = await axiosSecure.get("/notice");
                const currentDate = new Date();
                
                const activeNotices = response.data
                    .filter(notice => notice.deadline && new Date(notice.deadline) >= currentDate)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5);

                setNotices(activeNotices);
            } catch (error) {
                console.error("Error fetching notices:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotices();
    }, [axiosSecure]);

    if (loading || notices.length === 0) return null;

    return (
        <div className="w-full bg-red-600 text-white py-2">
            <div className="container mx-auto flex items-center">
                <div className="flex items-center mr-4 whitespace-nowrap px-2">
                    <FaFire className="mr-2 animate-pulse" />
                    <span className="font-bold">BREAKING:</span>
                </div>
                
                <Marquee pauseOnHover speed={50} gradient={false}>
                    {notices.map((notice) => (
                        <Link 
                            key={notice._id} 
                            to={`/notice/${notice._id}`}
                            className="mx-4 hover:underline hover:text-yellow-200 transition-colors"
                        >
                            {notice.title} • Deadline: {new Date(notice.deadline).toLocaleDateString()} •
                        </Link>
                    ))}
                </Marquee>
            </div>
        </div>
    );
};

export default NoticeSlider;