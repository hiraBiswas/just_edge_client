import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-blue-950 mt-8 text-white py-8 lg:mt-16">
      <div className="container mx-auto px-4 lg:px-8">
    
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
         
          <div>
            <h3 className="text-lg font-bold">About JUST EDGE</h3>
            <p className="mt-4 text-sm">
              JUST EDGE is a digital platform for Jashore University of Science and Technology students, providing courses and tools to enhance their skills in digital technologies.
            </p>
          </div>

         
          <div>
            <h3 className="text-lg font-bold">Useful Links</h3>
            <ul className="mt-4 text-sm space-y-2">
              <li><Link to="/" className="hover:underline">Home</Link></li>
              <li><Link to="/about" className="hover:underline">About Us</Link></li>
              <li><Link to="/notice" className="hover:underline">Notice</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="text-lg font-bold">Contact Us</h3>
            <p className="mt-4 text-sm">
              JUST EDGE Project<br />
              Jashore University of Science and Technology<br />
              Jashore, Bangladesh<br />
              Email: <a href="mailto:support@justedge.com" className="underline">support@justedge.com</a>
            </p>
          </div>

          {/* Column 4: Social Media */}
          <div>
            <h3 className="text-lg font-bold">Follow Us</h3>
            <div className="mt-4 space-x-4">
              <a href="#" className="hover:opacity-75">
                <img src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png" alt="Facebook" width="30" />
              </a>
              <a href="#" className="hover:opacity-75">
                <img src="https://img.icons8.com/ios-filled/50/ffffff/twitter.png" alt="Twitter" width="30" />
              </a>
              <a href="#" className="hover:opacity-75">
                <img src="https://img.icons8.com/ios-filled/50/ffffff/linkedin.png" alt="LinkedIn" width="30" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Section */}
        <div className="mt-8 border-t border-gray-600 pt-4 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} JUST EDGE. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
