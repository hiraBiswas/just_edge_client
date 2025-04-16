import React, { useEffect, useState } from 'react';

const Banner = () => {
    const [studentCount, setStudentCount] = useState(0);
    const [classCount, setClassCount] = useState(0);

    useEffect(() => {
        const fetchCounts = async () => {
            setTimeout(() => {
                setStudentCount(350);
                setClassCount(21);
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
                <h2 className="text-2xl font-bold lg:text-4xl">{displayCount}</h2>
                <p className="text-md lg:text-lg">{label}</p>
            </div>
        );
    };

    return (
        <div 
            className="hero min-h-[400px] lg:min-h-[650px]"
            style={{
                backgroundImage: "url(https://static.just.edu.bd/images/public/teacher/1609076174506_2048.jpeg)",
                backgroundSize: "cover",
                backgroundPosition: "center"
            }}
        >
            <div className="hero-overlay bg-opacity-70"></div>
            
            <div className="hero-content text-neutral-content">
                <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-6xl gap-16 lg:gap-44"> {/* Increased gap */}
                    {/* Text content - now with more spacing from logo */}
                    <div className="max-w-md lg:max-w-lg">
                        <h1 className="mb-5 text-2xl text-white font-bold lg:text-5xl">JUST EDGE:</h1>
                        <p className="mb-5 text-white font-semibold lg:text-2xl">
                            Building Tomorrow's Digital Economy at Jashore University
                        </p>
                        
                        <div className='h-24 w-full bg-white text-black rounded-xl drop-shadow-xl flex items-center justify-around mt-8 lg:mt-12 lg:h-32 lg:rounded-3xl'>
                            <Counter count={studentCount} label="Students" />
                            <div className="border-l-2 border-gray-300 h-16"></div>
                            <Counter count={classCount} label="Courses" />
                        </div>
                    </div>

                    {/* Logo image with more spacing */}
                    <div className='mt-12 lg:mt-0'>
                        <img 
                            className='h-64 w-64 lg:h-96 lg:w-96 object-contain' 
                            src="/logo.png" 
                            alt="JUST EDGE Logo" 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Banner;