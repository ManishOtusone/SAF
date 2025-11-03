import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import DefaultScreen from "./DefaultScreen";

const DefaultLayout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const handleLogin = () => navigate("/login");
  const handleSignup = () => navigate("/signup");
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="flex h-screen">

      <div className="flex-1 flex flex-col">
        {/* 🌿 Top Navbar */}
        <header className="flex justify-between items-center bg-white shadow-sm border-b border-gray-200 px-6 py-3 sticky top-0 z-20">
          {/* Left: Logo / Title */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="/Logo.png"
              alt="Logo"
              className="h-20 w-40 object-contain p-1 bg-white"
            />
            
          </div>

          {/* Right: Auth Buttons */}
          <div className="flex items-center space-x-3">
            {!token ? (
              <>
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 text-sm font-medium text-green-700 border border-green-600 rounded-md hover:bg-green-50 transition"
                >
                  Login
                </button>
                <button
                  onClick={handleSignup}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 transition"
              >
                Logout
              </button>
            )}
          </div>
        </header>

        {/* Main Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <DefaultScreen/>
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;
