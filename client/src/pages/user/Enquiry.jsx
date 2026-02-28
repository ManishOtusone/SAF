import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { baseUrl } from "../../utils/baseUrl";

const Enquiry = () => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        description: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { name, phone, description } = formData;

        // Basic validation
        if (!name || !phone || !description) {
            return Swal.fire({
                icon: "warning",
                title: "Missing Fields",
                text: "All fields are required",
            });
        }

        // Phone validation (Indian format)
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(phone)) {
            return Swal.fire({
                icon: "warning",
                title: "Invalid Phone Number",
                text: "Enter a valid 10-digit mobile number",
            });
        }

        // Confirm before submit
        const confirmResult = await Swal.fire({
            title: "Submit Enquiry?",
            text: "Are you sure you want to submit this enquiry?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#ca8a04",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, Submit",
        });

        if (!confirmResult.isConfirmed) return;

        try {
            setLoading(true);

            const token = localStorage.getItem("accessToken");

            Swal.fire({
                title: "Submitting...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const res = await axios.post(
                `${baseUrl}/user/createEnquiry`,
                {
                    name,
                    phone: `+91${phone}`, 
                    description,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            Swal.close();

            await Swal.fire({
                icon: "success",
                title: "Enquiry Submitted!",
                text: res.data.message || "Your enquiry has been sent successfully.",
                confirmButtonColor: "#16a34a",
            });

            setFormData({ name: "", phone: "", description: "" });

        } catch (error) {
            Swal.close();
            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error.response?.data?.message ||
                    "Failed to submit enquiry.",
            });

            console.error("Enquiry Create Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 p-6 flex justify-center items-center ">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">

                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Create Enquiry
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Your Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            className="w-full border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-600"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Phone Number
                        </label>

                        <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-yellow-600">
                            <span className="px-3 bg-gray-100 text-gray-700 border-r">
                                +91
                            </span>

                            <input
                                type="tel"
                                name="phone"
                                placeholder="Enter 10-digit mobile number"
                                className="w-full px-4 py-2 outline-none"
                                value={formData.phone}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    if (value.length <= 10) {
                                        setFormData({ ...formData, phone: value });
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            rows="4"
                            placeholder="Write your enquiry"
                            className="w-full border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-600"
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className={`w-full py-2 rounded-md text-white font-semibold transition 
              ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"}
            `}
                    >
                        {loading ? "Submitting..." : "Submit Enquiry"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Enquiry;
