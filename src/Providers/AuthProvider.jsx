import { createContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import app from "../Firebase/firebase.config";
import useAxiosPublic from "../hooks/useAxiosPublic";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const auth = getAuth(app);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const axiosPublic = useAxiosPublic();

  // Create User with email and password
  const createUser = async (name, image, type, email, password) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateUserProfile(name, image); // Update user profile after creation
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error; // Re-throw the error to propagate it further
    } finally {
      setLoading(false);
    }
  };

  // Sign in the user
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Authentication Error:", error);
      throw error; // Re-throw the error to propagate it further
    } finally {
      setLoading(false);
    }
  };

  // Log out the user
  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Log out Error:", error);
      throw error; // Re-throw the error to propagate it further
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = (name, photo) => {
    return updateProfile(auth.currentUser, {
      displayName: name,
      photoURL: photo
    });
  };

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      if (currentUser) {
        console.log("Current User:", currentUser);
        // Send user email to get a JWT token and store it in local storage
        const userInfo = { email: currentUser.email };
        axiosPublic.post("/jwt", userInfo).then(res => {
          if (res.data.token) {
            localStorage.setItem("access-token", res.data.token);
            setLoading(false);
          }
        });
      } else {
        // Clear token from localStorage if no user
        localStorage.removeItem("access-token");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [axiosPublic]);

  // Auth context value
  const authInfo = {
    user,
    loading,
    createUser,
    signIn,
    logOut,
    updateUserProfile
  };

  return <AuthContext.Provider value={authInfo}>{children}
   <ToastContainer />
   </AuthContext.Provider>;
};

export default AuthProvider;
