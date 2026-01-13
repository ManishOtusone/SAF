import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Share,
  LogOut,
} from "lucide-react";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <>
      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-green-50 to-yellow-50
        border-r border-green-200 shadow-md flex flex-col justify-between
        transition-all duration-300 z-40
        ${isOpen ? "w-64" : "w-20"}`}
      >
        {/* TOP SECTION */}
        <div className="px-4 py-4">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            {isOpen ? (
              /* LOGO + NAME (OPEN) */
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate("/admin")}
              >
                <img
                  src="/Logo.png"
                  alt="Logo"
                  className="h-10 w-10 border border-green-500 rounded-full p-1 bg-white"
                />
                <span className="font-semibold text-lg text-green-800">
                  MSME Portal
                </span>
              </div>
            ) : (
              /* HAMBURGER (COLLAPSED) */
              <button
                onClick={() => setIsOpen(true)}
                className="mx-auto bg-white border border-green-600 rounded-md p-2 shadow-md text-green-700"
              >
                <Menu size={20} />
              </button>
            )}

            {/* CLOSE BUTTON (OPEN MODE) */}
            {isOpen && (
              <button
                onClick={() => setIsOpen(false)}
                className="text-green-700"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* NAV */}
          <nav className="flex flex-col gap-1">
            {[
              { to: "/admin", icon: Home, label: "Member Management" },
              { to: "/admin/serviceManagement", icon: LayoutDashboard, label: "Service Management" },
              { to: "/admin/content-manager", icon: BookOpen, label: "Learning Contents" },
              { to: "/admin/content-request", icon: MessageSquare, label: "Content Requests" },
              { to: "/admin/contentManagement", icon: BookOpen, label: "Content Management" },
              { to: "/admin/enquiry", icon: MessageSquare, label: "Enquiry & Feedback" },
              { to: "/admin/allReferalls", icon: Share, label: "All Referrals" },
            ].map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end
                className={({ isActive }) =>
                  `flex items-center ${
                    isOpen ? "px-4 justify-start" : "justify-center"
                  } py-3 text-green-800 hover:bg-yellow-100 transition rounded-md
                  ${isActive ? "bg-green-100 font-semibold" : ""}`
                }
              >
                <Icon className="w-5 h-5" />
                {isOpen && <span className="ml-4">{label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* LOGOUT */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-12 h-12 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* PAGE SHIFT */}
      <div className={`transition-all duration-300 ${isOpen ? "ml-64" : "ml-20"}`} />
    </>
  );
};

export default AdminSidebar;
