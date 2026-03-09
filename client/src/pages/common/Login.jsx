import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../component/AuthLayout";
import { baseUrl } from '../../utils/baseUrl'
import Swal from "sweetalert2";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [showForgot, setShowForgot] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${baseUrl}/auth/login`, form, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.data.success) {
                const { token, user } = response.data;

                localStorage.setItem("accessToken", token);
                localStorage.setItem("user", JSON.stringify(user));
                localStorage.setItem("role", user.role);

                await Swal.fire({
                    icon: "success",
                    title: "Login Successful",
                    text: "Welcome back!",
                    confirmButtonColor: "#2563eb",
                });

                if (user.role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/user");
                }

            } else {
                Swal.fire({
                    icon: "error",
                    title: "Login Failed",
                    text: response.data.message || "Please try again",
                    confirmButtonColor: "#dc2626",
                });
            }

        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.response?.data?.message || "Server error. Please try again.",
                confirmButtonColor: "#dc2626",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout imageSrc="/Logo.png">
            <h2 className="text-3xl font-semibold mb-6 text-center">Login</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <p className="text-red-600 bg-red-50 p-2 rounded text-sm text-center">
                        {error}
                    </p>
                )}

                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Password</label>

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 pr-10"
                            placeholder="Enter your password"
                            required
                        />

                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-4 cursor-pointer text-gray-500"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>

                    <div className="text-right mt-1">
                        <button
                            type="button"
                            onClick={() => setShowForgot(true)}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Forgot Password?
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-blue-600 text-white py-2 rounded transition ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                        }`}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p className="text-center text-sm mt-3">
                    Don’t have an account?{" "}
                    <a href="/signup" className="text-blue-600 hover:underline">
                        Sign up
                    </a>
                </p>

            </form>

            {showForgot && (
                <ForgotPasswordModal onClose={() => setShowForgot(false)} />
            )}

        </AuthLayout>
    );
};

export default Login;
