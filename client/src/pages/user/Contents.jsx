import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";
import toast from "react-hot-toast";

const Contents = () => {
    const [services, setServices] = useState([]); // all service names
    const [requests, setRequests] = useState([]); // [{ service, content }]
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // 🧭 Fetch all service names on mount
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                const res = await axios.get(`${baseUrl}/user/getMembershipsPlans`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.data?.success) {
                    // ✅ Services are actually the benefit names in this response
                    const fetchedServices = res.data.data.benefits.map((b) => b.name);
                    setServices(fetchedServices);
                    setRequests(fetchedServices.map((s) => ({ service: s, content: "" })));
                } else {
                    toast.error("Failed to fetch services");
                }
            } catch (error) {
                console.error("Error fetching services:", error);
                toast.error("Failed to load services");
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    // 📝 Handle content change
    const handleChange = (index, value) => {
        const updated = [...requests];
        updated[index].content = value;
        setRequests(updated);
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem("accessToken");

            const res = await axios.post(
                `${baseUrl}/user/create-content-request`,
                { requests },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                toast.success("Request submitted successfully!");
            } else {
                toast.error(res.data.message || "Submission failed");
            }
        } catch (error) {
            console.error("Error submitting requests:", error);
            toast.error("Error submitting requests");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading)
        return (
            <div className="p-10 text-center text-lg text-gray-600">
                Loading services...
            </div>
        );

    return (
        <div className="p-6 sm:p-10 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-800">
                Service Request Form
            </h1>

            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
                <table className="w-full border border-gray-300 text-sm sm:text-base">
                    <thead className="bg-yellow-600 text-white">
                        <tr>
                            <th className="p-3 border border-gray-300 text-center w-16">#</th>
                            <th className="p-3 border border-gray-300 text-left">
                                Service Name
                            </th>
                            <th className="p-3 border border-gray-300 text-left">
                                Your Content / Request
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {services.map((service, index) => (
                            <tr
                                key={index}
                                className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                    } hover:bg-yellow-50`}
                            >
                                <td className="p-3 border border-gray-300 text-center font-medium">
                                    {index + 1}
                                </td>
                                <td className="p-3 border border-gray-300 font-medium text-gray-800">
                                    {service}
                                </td>
                                <td className="p-3 border border-gray-300">
                                    <input
                                        type="text"
                                        value={requests[index]?.content || ""}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        placeholder={`Enter content for ${service}`}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="p-4 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className={`px-6 py-2 rounded-lg text-white font-semibold ${submitting
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-yellow-600 hover:bg-yellow-700"
                            }`}
                    >
                        {submitting ? "Submitting..." : "Submit Requests"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Contents;
