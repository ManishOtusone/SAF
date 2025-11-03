import React from "react";

const AuthLayout = ({ children, imageSrc }) => {
    return (
        <div className="min-h-screen flex">
            <div className="hidden md:flex w-1/2 bg-gray-100 items-center justify-center">
                <img
                    src={imageSrc || "https://via.placeholder.com/400x400?text=Your+Logo"}
                    alt="Logo or Illustration"
                    className="max-w-sm"
                />
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">{children}</div>
            </div>
        </div>
    );
};

export default AuthLayout;
