import React, { useState } from "react";
import AuthLayout from "../../component/AuthLayout";
import ReCAPTCHA from "react-google-recaptcha";
import Swal from "sweetalert2";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";
import { useNavigate } from 'react-router-dom'

const Signup = () => {
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState("");
    const navigate = useNavigate();

    const [form, setForm] = useState({
        businessName: "",
        ownerName: "",
        industry: "",
        contactNumber: "",
        gstPan: "",
        city: "",
        website: "",
        email: "",
        password: "",
    });

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(form.contactNumber)) {
            return Swal.fire({
                icon: "error",
                title: "Invalid Mobile Number",
                text: "Enter a valid 10-digit mobile number",
                confirmButtonColor: "#dc2626",
            });
        }

        if (!captchaToken) {
            return Swal.fire({
                icon: "error",
                title: "Captcha Required",
                text: "Please verify you're not a robot",
                confirmButtonColor: "#dc2626",
            });
        }

        try {
            setLoading(true);

            const res = await axios.post(`${baseUrl}/auth/signup`, {
                businessName: form.businessName,
                ownerName: form.ownerName,
                industry: form.industry,
                contactInfo: `+91${form.contactNumber}`, 
                gstOrPan: form.gstPan,
                city: form.city,
                website: form.website,
                email: form.email,
                password: form.password,
                captchaToken,
            });

            await Swal.fire({
                icon: "success",
                title: "Signup Successful",
                text: res.data.message || "Account created successfully!",
                confirmButtonColor: "#16a34a",
            });

            navigate("/login");

        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Signup Failed",
                text:
                    error.response?.data?.message ||
                    "Something went wrong. Try again.",
                confirmButtonColor: "#dc2626",
            });
        } finally {
            setLoading(false);
        }
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
                <div>
                    <label className="block text-sm font-medium mb-1">Business Name</label>
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

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Contact Number
                    </label>

                    <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">

                        <span className="px-3 bg-gray-100 text-gray-700 border-r">
                            +91
                        </span>

                        <input
                            type="tel"
                            name="contactNumber"
                            value={form.contactNumber}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                if (value.length <= 10) {
                                    setForm({ ...form, contactNumber: value });
                                }
                            }}
                            className="w-full p-2 outline-none"
                            placeholder="Enter 10-digit mobile number"
                            maxLength="10"
                            required
                        />
                    </div>
                </div>
                {/* GST / PAN */}
                <div>
                    <label className="block text-sm font-medium mb-1">GST / PAN (optional)</label>
                    <input
                        type="text"
                        name="gstPan"
                        value={form.gstPan}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter GST or PAN number"
                    />
                </div>

                {/* City */}
                <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your city"
                    />
                </div>

                {/* Website */}
                <div>
                    <label className="block text-sm font-medium mb-1">Website</label>
                    <input
                        type="text"
                        name="website"
                        value={form.website}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="https://yourwebsite.com"
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

                {/* reCAPTCHA */}
                <ReCAPTCHA
                    sitekey="6LeQSwQsAAAAAPJZ5StQZ4m_jV21gWr9nD0aa_Hg"
                    onChange={(token) => setCaptchaToken(token)}
                />

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 rounded-md text-white transition-all
                        ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                >
                    {loading ? "Processing..." : "Sign Up"}
                </button>

                <p className="text-center text-sm mt-3">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-600 hover:underline">Log in</a>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Signup;
