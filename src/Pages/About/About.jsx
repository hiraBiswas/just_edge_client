import React from 'react';

const About = () => {
    return (
        <div className="max-w-6xl mt-20 mx-auto px-4 py-12 text-gray-800">
            {/* Hero Section */}
            <div className="text-center mb-6">
                <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-900">
                    JUST EDGE Initiative
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    A specialized digital transformation program at Jashore University of Science and Technology under Bangladesh's national EDGE project
                </p>
            </div>

            {/* National EDGE Overview */}
            <section className="mb-16 bg-blue-50 rounded-2xl p-8 border border-blue-100">
                <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">About National EDGE Project</h2>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <p className="text-lg text-gray-700 mb-6">
                            The <span className="font-bold text-blue-700">Enhancing Digital Government and Economy (EDGE)</span> project is a $295 million initiative funded by the World Bank and Government of Bangladesh, implemented by Bangladesh Computer Council (BCC).
                        </p>
                        <div className="bg-white p-5 rounded-lg border-l-4 border-blue-500">
                            <h3 className="font-bold text-blue-800 mb-2">National Impact:</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    $200M savings in public sector IT investments through cloud platform
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    100+ government agencies on integrated digital platform
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    Virtual government operations during crises
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <img
                            src="https://scontent.fzyl2-2.fna.fbcdn.net/v/t39.30808-6/486353519_1053726776784503_6404535591623019820_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGj6SEiaUFcq149MKyIJnS58GGNb_4H2qvwYY1v_gfaq4D7Z4qzoLuMO9p9rhoX2vLMaBu5cPqUQycJVklF1Lxv&_nc_ohc=QvkyMQXL4S0Q7kNvwGi1YDi&_nc_oc=AdnxZQtmomJVrvbwoth4lGygygHKnhYbomcd6EnkctwQ5hyyERpFkLaGIuvEKUFmTz4&_nc_zt=23&_nc_ht=scontent.fzyl2-2.fna&_nc_gid=tIX-qH4W3qCtHawTmWGIiQ&oh=00_AfECJEdGefJydVcgLyRheJBlOjfrfQzT0_xRXxaum0MhKw&oe=6805B97C"
                            alt="Digital Bangladesh"
                            className="rounded-lg w-full h-auto object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* JUST EDGE Program */}
            <section className="mb-20 bg-white rounded-2xl p-8 shadow-md border border-gray-100">
                <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">JUST EDGE Program</h2>
                <div className="flex flex-col lg:flex-row gap-10 items-center">
                    <div className="lg:w-1/2">
                        <img
                            src="https://just.edu.bd/images/overview/gallery.jpg"
                            alt="JUST Students Learning"
                            className="rounded-xl shadow-lg w-full h-auto object-cover"
                        />
                    </div>
                    <div className="lg:w-1/2">
                        <div className="space-y-6">
                            <p className="text-lg leading-relaxed text-gray-700">
                                JUST EDGE is the Jashore University of Science and Technology implementation of the national EDGE project, specifically tailored to develop 4IR-ready graduates and enhance digital capabilities in southern Bangladesh.
                            </p>
                            
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg">
                                <h3 className="font-bold text-blue-800 mb-3">JUST-Specific Components:</h3>
                                <ul className="space-y-3 text-gray-700">
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        Specialized labs for cloud computing and cybersecurity
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        Industry-aligned curriculum development for CSE department
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        Digital leadership training for faculty and students
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        Innovation hub for ICT startups
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* JUST EDGE Vision & Mission */}
            <section className="grid md:grid-cols-2 gap-8 mb-20">
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-sm border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-blue-800">JUST EDGE Vision</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                        To become the premier digital skills development hub in southern Bangladesh, producing graduates who will drive ICT exports and technological innovation in line with national Digital Bangladesh vision.
                    </p>
                </div>

                <div className="bg-gradient-to-bl from-indigo-50 to-white rounded-2xl p-8 shadow-sm border border-indigo-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-indigo-800">JUST EDGE Mission</h3>
                    </div>
                    <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                            <span className="text-indigo-500 mr-2">•</span>
                            Transform JUST into a center of excellence for 4IR education
                        </li>
                        <li className="flex items-start">
                            <span className="text-indigo-500 mr-2">•</span>
                            Develop industry-ready digital skills in 5,000+ students by 2025
                        </li>
                        <li className="flex items-start">
                            <span className="text-indigo-500 mr-2">•</span>
                            Foster ICT innovation and entrepreneurship in Jashore region
                        </li>
                    </ul>
                </div>
            </section>

            {/* JUST EDGE Facilities */}
            <section className="mb-20 bg-gray-50 rounded-2xl p-8 border border-gray-200">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">JUST EDGE Facilities</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-50 text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Cloud Computing Lab</h3>
                        <p className="text-gray-600">State-of-the-art infrastructure for hands-on training in AWS, Azure and Google Cloud</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-50 text-center">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Cybersecurity Center</h3>
                        <p className="text-gray-600">Advanced training in ethical hacking, network security and digital forensics</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-50 text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Digital Innovation Hub</h3>
                        <p className="text-gray-600">Incubation space for student startups and industry collaboration</p>
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section className="bg-white rounded-2xl p-8 shadow-md mb-12">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Contact Information</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                        <h3 className="text-xl font-semibold text-blue-800 mb-4">National EDGE Project</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-gray-800">Bangladesh Computer Council</h4>
                                <p className="text-gray-600">ICT Tower, Agargaon, Dhaka (Level-2)</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800">Youth Tower</h4>
                                <p className="text-gray-600">822/2, Rokeya Sarani, Dhaka-1216</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800">Website</h4>
                                <a href="https://edge.gov.bd" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">edge.gov.bd</a>
                            </div>
                        </div>
                    </div>
                    <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                        <h3 className="text-xl font-semibold text-indigo-800 mb-4">JUST EDGE Program</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-gray-800">Jashore University of Science & Technology</h4>
                                <p className="text-gray-600">Department of Computer Science & Engineering</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800">Campus Location</h4>
                                <p className="text-gray-600">Jashore-7408, Bangladesh</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800">Program Coordinator</h4>
                                <p className="text-gray-600">Email: <span className="text-indigo-600">edge@just.edu.bd</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Links */}
            <div className="flex flex-col md:flex-row justify-center gap-8 text-center text-gray-600 mb-8">
                <a href="#" className="hover:text-blue-600">About EDGE</a>
                <a href="#" className="hover:text-blue-600">JUST EDGE Activities</a>
                <a href="https://just.edu.bd" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                    JUST Official Website
                </a>
                <a href="https://edge.gov.bd" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                    EDGE Official Website
                </a>
            </div>
        </div>
    );
};

export default About;