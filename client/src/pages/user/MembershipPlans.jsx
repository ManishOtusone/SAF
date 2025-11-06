import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";

const MembershipPlans = () => {
  const [plans, setPlans] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const [userPlan, setUserPlan] = useState(null); // ✅ correct user plan

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        // ✅ Fetch Membership Plans
        const plansRes = await axios.get(`${baseUrl}/user/getMembershipsPlans`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ Fetch all memberships
        const membershipsRes = await axios.get(`${baseUrl}/user/allMemberships`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ Fetch User Details
        const userRes = await axios.get(
          `${baseUrl}/user/getAllUserDetails`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (plansRes.data.success) {
          const { plans, benefits } = plansRes.data.data;

          const planList = plans.map((p) => ({
            label: p.name.toUpperCase(), // STARTUP, GROWTHSTAGE, MATURESTAGE
            price: `${p.price}/year`,
          }));

          setPlans(planList);
          setBenefits(benefits.map((b) => [b.name, b.values]));
        }

        if (membershipsRes.data?.success) {
          setMemberships(membershipsRes.data.memberships);
        }

        // ✅ ✅ Correctly extract the user's current plan
        // Your API returns:
        //  user.membership.planName = "Startup"
        const userDetails = userRes.data?.data;
        const activePlan = userDetails?.membership?.planName || null;

        console.log("✅ User Active Plan:", activePlan);

        setUserPlan(activePlan);

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const normalizePlan = (p) =>
    p?.toLowerCase()?.replace("stage", "").replace(" ", "");

  const handleUpgradeClick = (planLabel) => {
    setSelectedPlan(planLabel);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    setIsPaying(true);

    setTimeout(async () => {
      alert("✅ Payment successful!");
      setIsPaying(false);
      setShowPaymentModal(false);

      await assignMembership(selectedPlan);
    }, 1500);
  };

  const assignMembership = async (planLabel) => {
    try {
      if (!memberships || memberships.length === 0) {
        alert("No membership data loaded yet. Please refresh the page.");
        return;
      }

      const token = localStorage.getItem("accessToken");

      let planName = "";
      if (planLabel.includes("START")) planName = "Startup";
      else if (planLabel.includes("GROWTH")) planName = "GrowthStage";
      else if (planLabel.includes("MATURE")) planName = "MatureStage";

      const matchedMembership = memberships.find(
        (m) => m.planName === planName
      );

      if (!matchedMembership) {
        alert(`No membership found for ${planLabel}`);
        return;
      }

      const res = await axios.post(
        `${baseUrl}/user/assignMembership/${matchedMembership._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message || "Membership assigned successfully!");
    } catch (error) {
      console.error("Error assigning membership:", error);
      alert("Error assigning membership. Please try again.");
    }
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

                {plans.map((_, i) => (
                  <td key={i} className="p-3 border border-gray-300 text-center">
                    {values[i] || "-"}
                  </td>
                ))}
              </tr>
            ))}

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
              className={`w-full py-2 rounded-lg text-white font-semibold ${
                isPaying ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"
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

