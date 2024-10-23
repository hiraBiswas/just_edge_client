import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Component/Navbar/Navbar';
import Footer from '../Component/Footer/Footer';

const Main = () => {
    return (
        <div>
          <div className=''>
          <Navbar></Navbar>
          </div>
            <Outlet></Outlet>
         <Footer></Footer>
        </div>
    );
};

export default Main;
