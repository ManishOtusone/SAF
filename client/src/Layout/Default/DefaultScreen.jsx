import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";

const DefaultScreen = () => {
    const [plans, setPlans] = useState([]);
    const [benefits, setBenefits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {

                const plansRes = await axios.get(
                    `${baseUrl}/user/getDefaultMembershipsPlans`,
                );

                if (plansRes.data.success) {
                    const { plans, benefits } = plansRes.data.data;

                    // Add FREE plan first
                    const planList = [
                        { label: "FREE", price: "Free" },
                        ...plans.map((p) => ({
                            label: p.name.toUpperCase(),
                            price: `${p.price}/year`,
                        })),
                    ];
                    setPlans(planList);

                    // Add ❌ for Free plan
                    const formattedBenefits = benefits.map((b) => [
                        b.name,
                        ["❌", ...b.values],
                    ]);
                    setBenefits(formattedBenefits);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    if (loading)
        return (
            <div className="p-10 text-center text-lg">
                Loading membership plans...
            </div>
        );

    return (
        <div className="p-6 sm:p-10 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-800">
                MEMBERSHIP PLANS & BENEFITS
            </h1>

            <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 text-sm sm:text-base">
                    <thead className="bg-yellow-600 text-white">
                        <tr>
                            <th className="p-3 border border-gray-300 w-12 text-left">SR. NO</th>
                            <th className="p-3 border border-gray-300 text-left">Benefit / Service</th>

                            {plans.map((plan, i) => (
                                <th key={i} className="p-3 border border-gray-300 text-center">
                                    <div className="font-semibold">{plan.label}</div>
                                    <div className="text-xs">({plan.price})</div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {benefits.map(([benefit, values], index) => (
                            <tr
                                key={index}
                                className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-yellow-50`}
                            >
                                <td className="p-3 border border-gray-300 text-center font-medium">
                                    {index + 1}
                                </td>

                                <td className="p-3 border border-gray-300">{benefit}</td>

                                {values.map((v, i) => (
                                    <td
                                        key={i}
                                        className={`p-3 border border-gray-300 text-center ${v === "❌" ? "text-red-600 font-bold" : ""
                                            }`}
                                    >
                                        {v || "-"}
                                    </td>
                                ))}
                            </tr>
                        ))}

                        {/* Bottom row with NO upgrade button */}
                        <tr className="bg-yellow-600">
                            <td className="p-4 border border-gray-300" colSpan="2"></td>

                            {plans.map((plan, i) => (
                                <td
                                    key={i}
                                    className="p-4 border border-gray-300 text-center text-white font-semibold"
                                >
                                    —
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DefaultScreen;
