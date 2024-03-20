import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../../Providers/AuthProvider';

const Navbar = () => {
  
const { user, logOut } = useContext(AuthContext);
const links =<>
<li className="text-lg lg:text-xl font-semibold mr-3"><NavLink to="/">Home</NavLink></li>
<li className="text-lg lg:text-xl font-semibold mr-3"><NavLink to="/courses">All Course</NavLink></li>
{user && (
    <li className="text-lg lg:text-xl font-semibold mr-5">
      <NavLink to="/dashboard">Dashboard</NavLink>
    </li>
  )}
<li className="text-lg lg:text-xl font-semibold mr-3"><NavLink to="/contact">Contact</NavLink></li>

</>
 

  

  const handleSignOut = async () => {
    try {
      await logOut();
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            {links}
       </ul>
        </div>
        <a className="btn btn-ghost text-xl">JUST_EDGE</a>
      </div>
      <div className="navbar-center hidden lg:flex">
      <ul className="menu menu-horizontal px-1">
    {links}
      </ul>
      </div>
      <div className="navbar-end">
        {user ? (
          <div className="flex items-center">
            <img
              src={user.photoURL}
              alt="Profile"
              className="h-10 w-10 rounded-full mr-1"
            />
            <span className="text-lg font-semibold hidden lg:block">{user.displayName}</span>
            <button onClick={handleSignOut} className="btn bg-blue-950 text-white ml-3">
              Sign Out
            </button>
          </div>
        ) : (
          <Link to="/login">
            <button className="btn bg-blue-950 font-bold px-5 text-white">Login</button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
