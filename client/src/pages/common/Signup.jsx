import React, { useState } from "react";
import AuthLayout from "../../component/AuthLayout";

const Signup = () => {
    const [form, setForm] = useState({
        businessName: "",
        ownerName: "",
        industry: "",
        contactNumber: "",
        gstPan: "",
        email: "",
        password: "",
    });

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Signup Data:", form);
        // 🔹 TODO: Replace with your Axios POST to backend endpoint (e.g., /api/v1.0/auth/signup)
    };

    return (
        <AuthLayout imageSrc="/Logo.png">
            <h2 className="text-3xl font-semibold mb-6 text-center">
                Business Sign Up
            </h2>

            <form
                onSubmit={handleSubmit}
                className="space-y-4 max-w-md mx-auto bg-white p-6 rounded-xl shadow-md"
            >
                {/* Business Name */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Business Name
                    </label>
                    <input
                        type="text"
                        name="businessName"
                        value={form.businessName}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your business name"
                        required
                    />
                </div>

                {/* Owner Name */}
                <div>
                    <label className="block text-sm font-medium mb-1">Owner Name</label>
                    <input
                        type="text"
                        name="ownerName"
                        value={form.ownerName}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter owner’s full name"
                        required
                    />
                </div>

                {/* Industry */}
                <div>
                    <label className="block text-sm font-medium mb-1">Industry</label>
                    <input
                        type="text"
                        name="industry"
                        value={form.industry}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Manufacturing, Retail, IT"
                        required
                    />
                </div>

                {/* Contact Number */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Contact Number
                    </label>
                    <input
                        type="tel"
                        name="contactNumber"
                        value={form.contactNumber}
                        onChange={handleChange}
                        pattern="[0-9]{10}"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter 10-digit mobile number"
                        required
                    />
                </div>

                {/* GST / PAN */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        GST / PAN (optional)
                    </label>
                    <input
                        type="text"
                        name="gstPan"
                        value={form.gstPan}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter GST or PAN number"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email address"
                        required
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter a strong password"
                        required
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-all"
                >
                    Sign Up
                </button>

                <p className="text-center text-sm mt-3">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-600 hover:underline">
                        Log in
                    </a>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Signup;
