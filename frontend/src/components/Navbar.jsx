import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
    import { FaTimes } from 'react-icons/fa';
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import { motion, AnimatePresence } from "framer-motion";
import './Navbar.css'

const Navbar = () => {
  const [show, setShow] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { isAuthenticated, setIsAuthenticated, user } = useContext(Context);
  const navigateTo = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await axios.get("https://hospital-app-nyy9.vercel.app/api/v1/user/patient/logout", {
        withCredentials: true,
      });
      toast.success(res.data.message);
      setIsAuthenticated(false);
      setShowProfile(false);
      navigateTo('/')
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  const goToLogin = () => navigateTo("/login");

  return (
    <>
      <nav className="container">
        <div className="logo">
          <img src="/logo.png" alt="logo" className="logo-img" />
        </div>

        <div className={show ? "navLinks showmenu" : "navLinks"}>
          <div className="links">
            <Link to="/" onClick={() => setShow(false)}>Home</Link>
            <Link to="/appointment" onClick={() => setShow(false)}>Appointment</Link>
            <Link to="/about" onClick={() => setShow(false)}>About Us</Link>
          </div>

          {isAuthenticated ? (
            <div className="profileSection">
              {/* <button className="logoutBtn btn" onClick={handleLogout}>
                LOGOUT
              </button> */}
              <img
                src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/1144/1144760.png"}
                alt="profile"
                width="40px"
                className="profileImg"
                onClick={() => setShowProfile(!showProfile)}
              />
            </div>
          ) : (
            <button className="loginBtn btn" onClick={goToLogin}>
              LOGIN
            </button>
          )}
        </div>

        <div className="hamburger" onClick={() => setShow(!show)}>
          <GiHamburgerMenu />
        </div>
      </nav>

      {/* Profile Sidebar */}
      <AnimatePresence>
        {showProfile && (
          <>
            <div
              className="overlay"
              onClick={() => setShowProfile(false)}
            ></div>

            <motion.div
              className="profileSidebar"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <div className="sidebarHeader">
                <h3>User Profile</h3>
                <FaTimes onClick={() => setShowProfile(false)}/>
              </div>

              <div className="profileDetails">
                <img
                  src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/1144/1144760.png"}
                  alt="profile"
                  width="80px"
                />
                <h4>{`${user?.firstName} ${user?.lastName} `|| "Guest User"}</h4>
                <p>{user?.email}</p>
                <p>{user?.role}</p>
              </div>

              <div className="sidebarLinks">
         
                <button className="btn logoutBtn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
