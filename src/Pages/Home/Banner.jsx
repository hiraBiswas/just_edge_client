import React, { useEffect, useState } from 'react';

const Banner = () => {
    const [studentCount, setStudentCount] = useState(0);
    const [classCount, setClassCount] = useState(0);

    useEffect(() => {
        // Mocking fetch call for demonstration purposes
        const fetchCounts = async () => {
            // Simulate fetching data with setTimeout
            setTimeout(() => {
                setStudentCount(350); // Replace with actual fetch logic
                setClassCount(21); // Replace with actual fetch logic
            }, 500);
        };

        fetchCounts();
    }, []);

    const Counter = ({ count, label }) => {
        const [displayCount, setDisplayCount] = useState(0);

        useEffect(() => {
            const target = count;
            const duration = 1000; 
            const stepTime = Math.abs(Math.floor(duration / target));

            let currentCount = 0;
            const interval = setInterval(() => {
                if (currentCount < target) {
                    currentCount++;
                    setDisplayCount(currentCount);
                } else {
                    clearInterval(interval);
                }
            }, stepTime);

            return () => clearInterval(interval);
        }, [count]);

        return (
            <div className="text-center">
                <h2 className="text-4xl font-bold">{displayCount}</h2>
                <p className="text-lg">{label}</p>
            </div>
        );
    };

    return (
        <div
            className="hero min-h-[400px] lg:min-h-[650px]"
            style={{
                backgroundImage: "url(https://i.ibb.co/Nmqs5s5/banner2.jpg)",
            }}>
            <div className="hero-overlay bg-gray-500 bg-opacity-70"></div> 
            <div className="hero-content text-neutral-content text-center">
                <div className='flex  items-center justify-between lg: gap-52'>
                    <div className="max-w-md mt-20">
                        <h1 className="mb-5 text-2xl text-white font-bold lg:text-5xl">JUST EDGE:</h1>
                        <p className="mb-5 text-white font-semibold lg:text-2xl">
                            Building Tomorrow’s Digital Economy at Jashore University
                        </p>
                        <div className='h-32 w-full bg-white text-black rounded-3xl drop-shadow-xl flex items-center justify-around mt-12'>
                            <Counter count={studentCount} label="Students" />
                            <div className="border-l-2 border-gray-300 h-16"></div> 
                            <Counter count={classCount} label="Courses" />
                        </div>
                    </div>

                    <div className='mt-24'>
                        <img className='h-96 w-96' src="./../../../public/logo.png" alt="" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Banner;
