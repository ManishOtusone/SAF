import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
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

        if (!name || !phone || !description)
            return toast.error("All fields are required");

        try {
            setLoading(true);

            const token = localStorage.getItem("accessToken");

            const res = await axios.post(
                `${baseUrl}/user/createEnquiry`,
                { name, phone, description },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(res.data.message || "Enquiry submitted successfully!");

            // Reset form
            setFormData({ name: "", phone: "", description: "" });

        } catch (error) {
            console.error("Enquiry Create Error:", error);

            toast.error(
                error.response?.data?.message || "Failed to submit enquiry."
            );
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

                    {/* Name */}
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

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <input
                            type="text"
                            name="phone"
                            placeholder="Enter your phone number"
                            className="w-full border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-600"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Description */}
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

                    {/* Submit Button */}
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
