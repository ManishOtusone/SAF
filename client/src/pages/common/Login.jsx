import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../component/AuthLayout";
import { baseUrl } from '../../utils/baseUrl'

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(`${baseUrl}/auth/login`, form, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.data.success) {
                const { token, user } = response.data;

                // Save to localStorage
                localStorage.setItem("accessToken", token);
                localStorage.setItem("user", JSON.stringify(user));
                localStorage.setItem("role", user.role);

                alert("Login successful!");
                if (user.role === 'admin') {
                    navigate("/admin");
                } else {
                    navigate("/user");
                }

            } else {
                setError(response.data.message || "Login failed. Please try again.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Server error. Please try again.");
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
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your password"
                        required
                    />
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
        </AuthLayout>
    );
};

export default Login;
