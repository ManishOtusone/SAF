import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Home, LayoutDashboard, BookOpen, LogIn, LogOut } from "lucide-react";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("accessToken"));

  useEffect(() => {
    const stored = localStorage.getItem("sidebarOpen");
    if (stored !== null) setIsOpen(stored === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", isOpen);
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <>
        <button
        className="md:hidden fixed top-4 left-4 z-50 text-green-800 bg-white border border-green-600 rounded-md p-2 shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-green-50 to-yellow-50 border-r border-green-200 shadow-md flex flex-col justify-between transition-all duration-300 z-40
        ${isOpen ? "w-64" : "w-20"} md:w-64`}
      >
        {/* Top Section */}
        <div className="flex flex-col items-center py-6">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 mb-8 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="/Logo.png"
              alt="Logo"
              className="h-10 w-10 object-contain border border-green-500 rounded-full p-1 bg-white"
            />
            {isOpen && (
              <span className="font-semibold text-lg text-green-800">
                MSME Portal
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col w-full space-y-1">
            {/* 🏠 Home */}
            <NavLink
              to="/admin/"
              end
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-green-800 hover:bg-yellow-100 hover:text-green-700 transition rounded-md
                ${isActive ? "bg-green-100 text-green-700 font-semibold" : ""}`
              }
            >
              <Home className="w-5 h-5" />
              {isOpen && <span className="ml-3 font-medium">Member Management</span>}
            </NavLink>

            {/* 📊 Dashboard */}
            <NavLink
              to="/admin/serviceManagement"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-green-800 hover:bg-yellow-100 hover:text-green-700 transition rounded-md
                ${isActive ? "bg-green-100 text-green-700 font-semibold" : ""}`
              }
            >
              <LayoutDashboard className="w-5 h-5" />
              {isOpen && <span className="ml-3 font-medium">Service Management
              </span>}
            </NavLink>

            {/* 📚 Study Material */}
            <NavLink
              to="/admin/contentManagement"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-green-800 hover:bg-yellow-100 hover:text-green-700 transition rounded-md
                ${isActive ? "bg-green-100 text-green-700 font-semibold" : ""}`
              }
            >
              <BookOpen className="w-5 h-5" />
              {isOpen && <span className="ml-3 font-medium">Learning Content Management
</span>}
            </NavLink>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="mb-6 flex flex-col items-center w-full">
          {!isLoggedIn ? (
            <button
              onClick={handleLogin}
              className="flex items-center w-5/6 justify-center space-x-2 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              <LogIn size={18} />
              {isOpen && <span>Login</span>}
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center w-5/6 justify-center space-x-2 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
            >
              <LogOut size={18} />
              {isOpen && <span>Logout</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div
        className={`transition-all duration-300 ${isOpen ? "md:ml-64 ml-20" : "ml-20"
          }`}
      >
        {/* Place your page content here */}
      </div>
    </>
  );
};

export default AdminSidebar;
