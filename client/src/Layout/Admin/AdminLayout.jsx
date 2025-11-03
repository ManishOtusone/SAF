import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const UserLayout = () => {
    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;
