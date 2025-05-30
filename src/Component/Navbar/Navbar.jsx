import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../../Providers/AuthProvider';
import './navbar.css';

const Navbar = () => {
  const { user, logOut } = useContext(AuthContext);

  const links = (
    <>
      <li className="mr-3">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `text-lg lg:text-xl font-semibold px-3 py-2 rounded-lg transition-colors ${
              isActive 
                ? 'underline' 
                : 'text-gray-700 hover:text-blue-500'
            }`
          }
        >
          Home
        </NavLink>
      </li>
      <li className="mr-3">
        <NavLink 
          to="/about" 
          className={({ isActive }) => 
            `text-lg lg:text-xl font-semibold px-3 py-2 rounded-lg transition-colors ${
              isActive 
                ? 'underline' 
                : 'text-gray-700 hover:text-blue-500'
            }`
          }
        >
          About
        </NavLink>
      </li>
      <li className="mr-3">
        <NavLink 
          to="/notice" 
          className={({ isActive }) => 
            `text-lg lg:text-xl font-semibold px-3 py-2 rounded-lg transition-colors ${
              isActive 
                ? 'underline' 
                : 'text-gray-700 hover:text-blue-500'
            }`
          }
        >
          Notice
        </NavLink>
      </li>
    </>
  );

  const handleSignOut = async () => {
    try {
      await logOut();
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="navbar bg-base-100 rounded-3xl drop-shadow-2xl">
      <div className="navbar-start px-5">
        <div className="dropdown">
          {/* Mobile Menu Toggle */}
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          {/* Mobile Links */}
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow-sm bg-base-100 rounded-box w-52">
            {links}
          </ul>
        </div>
        <a className="text-2xl font-bold text-with-gradient lg:text-4xl">JUST_EDGE</a>
      </div>

      <div className="navbar-end px-5 flex items-center gap-3">
        <ul className="hidden lg:flex items-center">
          {links}
        </ul>

        {/* User Profile and Login Button */}
        {user ? (
          <div className="dropdown dropdown-end relative z-50 flex items-center">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar mr-2">
              <div className="w-10 rounded-full">
                <img src={user.image || "default-profile.png"} alt="Profile" />
              </div>
            </label>
            <h2 className="text-lg font-semibold text-black mr-4">{user.name}</h2>
            <ul tabIndex={0} className="mt-32 p-2 shadow-sm menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
              <li className='text-black'>
                <NavLink 
                  to="/dashboard" 
                  className={({ isActive }) => 
                    `justify-between ${isActive ? 'bg-blue-100 text-blue-800' : ''}`
                  }
                >
                  Dashboard
                </NavLink>
              </li>
              <li className='text-black'>
                <button onClick={handleSignOut}>Logout</button>
              </li>
            </ul>
          </div>
        ) : (
          <Link to="/login">
            <button className="btn grad-button font-bold px-8 text-white">Login</button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;