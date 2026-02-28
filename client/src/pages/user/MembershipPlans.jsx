import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";
import Swal from "sweetalert2";

const MembershipPlans = () => {
  const [plans, setPlans] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const [userPlan, setUserPlan] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const plansRes = await axios.get(`${baseUrl}/user/getMembershipsPlans`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const membershipsRes = await axios.get(`${baseUrl}/user/allMemberships`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userRes = await axios.get(`${baseUrl}/user/getAllUserDetails`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (plansRes.data.success) {
          const { plans, benefits } = plansRes.data.data;

          setPlans(
            plans.map((p) => ({
              label: p.name.toUpperCase(),
              price: `${p.price}/year`,
            }))
          );

          setBenefits(
            benefits.map((b) => ({
              name: b.name,
              values: b.values,
              link: b.link || "",
            }))
          );
        }

        if (membershipsRes.data?.success) {
          setMemberships(membershipsRes.data.memberships);
        }

        const userDetails = userRes.data?.data;
        const activePlan = userDetails?.membership?.planName || null;
        setUserPlan(activePlan);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const normalizePlan = (p) => {
    if (!p) return "";

    if (p.includes("MATURE")) return "mature";
    if (p.includes("GROWTH")) return "growth";
    if (p.includes("START")) return "startup";

    if (p === "MatureStage") return "mature";
    if (p === "GrowthStage") return "growth";
    if (p === "StartupStage") return "startup";

    return p.toLowerCase().trim();
  };

  const handleUpgradeClick = (planLabel) => {
    setSelectedPlan(planLabel);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    const confirmResult = await Swal.fire({
      title: "Confirm Payment?",
      text: `Proceed with ${selectedPlan} plan purchase?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ca8a04",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Pay",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setIsPaying(true);

      Swal.fire({
        title: "Processing Payment...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      await assignMembership(selectedPlan);

      Swal.close();

      await Swal.fire({
        icon: "success",
        title: "Payment Successful!",
        text: `${selectedPlan} plan activated successfully.`,
        confirmButtonColor: "#16a34a",
      });

      setShowPaymentModal(false);
      window.location.reload();

    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setIsPaying(false);
    }
  };

  const assignMembership = async (planLabel) => {
    const token = localStorage.getItem("accessToken");

    let planName = "";
    if (planLabel.includes("START")) planName = "Startup";
    else if (planLabel.includes("GROWTH")) planName = "GrowthStage";
    else if (planLabel.includes("MATURE")) planName = "MatureStage";

    const matchedMembership = memberships.find(
      (m) => m.planName === planName
    );

    if (!matchedMembership) {
      throw new Error("Membership not found");
    }

    await axios.post(
      `${baseUrl}/user/assignMembership/${matchedMembership._id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

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
              <th className="p-3 border border-gray-300 text-left w-12">SR. NO</th>
              <th className="p-3 border border-gray-300 text-left">Benefit / Service</th>
              {/* <th className="p-3 border border-gray-300 text-center">Link</th> */}

              {plans.map((plan, i) => (
                <th key={i} className="p-3 border border-gray-300 text-center">
                  <div className="font-semibold">{plan.label}</div>
                  <div className="text-xs">({plan.price})</div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {benefits.map((benefit, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-yellow-50`}
              >
                <td className="p-3 border border-gray-300 text-center font-medium">
                  {index + 1}
                </td>

                {/* Benefit Name */}
                <td className="p-3 border border-gray-300">{benefit.name}</td>

                {/* ✅ Link Column */}
                {/* <td className="p-3 border border-gray-300 text-center">
                  {benefit.link && benefit.link.trim() !== "" ? (
                    <a
                      href={benefit.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm hover:text-blue-800"
                    >
                      View Link
                    </a>
                  ) : (
                    "-"
                  )}
                </td> */}

                {/* Plan Values */}
                {plans.map((_, i) => (
                  <td key={i} className="p-3 border border-gray-300 text-center">
                    {benefit.values[i] || "-"}
                  </td>
                ))}
              </tr>
            ))}

            {/* Upgrade / Current Plan Row */}
            <tr className="bg-yellow-600">
              <td className="p-4 border border-gray-300" colSpan="2"></td>

              {plans.map((plan, i) => {
                const uiPlan = normalizePlan(plan.label);
                const active = normalizePlan(userPlan);

                return (
                  <td key={i} className="p-4 border border-gray-300 text-center">
                    {uiPlan === active ? (
                      <span className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg font-semibold w-full block">
                        Current Plan
                      </span>
                    ) : (
                      <button
                        onClick={() => handleUpgradeClick(plan.label)}
                        className="bg-white text-yellow-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-100 transition font-semibold w-full"
                      >
                        Upgrade
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <h2 className="text-xl font-bold mb-3 text-gray-800">Confirm Payment</h2>
            <p className="text-gray-600 mb-5">
              You are about to purchase <strong>{selectedPlan}</strong> plan.
            </p>

            <button
              onClick={handlePayment}
              disabled={isPaying}
              className={`w-full py-2 rounded-lg text-white font-semibold ${isPaying
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-600 hover:bg-yellow-700"
                }`}
            >
              {isPaying ? "Processing..." : "Pay Now"}
            </button>

            <button
              onClick={() => setShowPaymentModal(false)}
              disabled={isPaying}
              className="w-full mt-3 py-2 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipPlans;
