import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { baseUrl } from "../../utils/baseUrl";

const MembershipPlans = () => {
  const [plans, setPlans] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const [userPlan, setUserPlan] = useState(null);

  const [showContentModal, setShowContentModal] = useState(false);
  const [contentLimit, setContentLimit] = useState(0);
  const [selectedContent, setSelectedContent] = useState([]);
  const [alreadySelected, setAlreadySelected] = useState([]);
  const [contentOptions, setContentOptions] = useState([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentSubmitting, setContentSubmitting] = useState(false);
  const [usedCount, setUsedCount] = useState(0);
  const [benefitRequestCounts, setBenefitRequestCounts] = useState({});
  const [showBenefitModal, setShowBenefitModal] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState("");
  const [benefitMessage, setBenefitMessage] = useState("");
  const [benefitSubmitting, setBenefitSubmitting] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const plansRes = await axios.get(
          `${baseUrl}/user/getMembershipsPlans`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const membershipsRes = await axios.get(
          `${baseUrl}/user/allMemberships`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userRes = await axios.get(
          `${baseUrl}/user/getAllUserDetails`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
              ...b,
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

        const requestRes = await axios.get(
          `${baseUrl}/user/my-requested-content`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (requestRes.data?.success) {
          const requests = requestRes.data.data || [];

          setAlreadySelected(
            requestRes.data.contentRequests || []
          );

          setUsedCount(
            Number(requestRes.data.contentCount) || 0
          );

          const counts = requests.reduce((acc, item) => {
            const key = String(item.service || "")
              .trim()
              .toLowerCase();

            acc[key] = (acc[key] || 0) + 1;

            return acc;
          }, {});

          setBenefitRequestCounts(counts);
        }
      } catch (err) {
        console.error("Error fetching data:", err);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unable to load membership data.",
        });
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
      console.error("Payment error:", error);

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

    if (planLabel.includes("START")) {
      planName = "Startup";
    } else if (planLabel.includes("GROWTH")) {
      planName = "GrowthStage";
    } else if (planLabel.includes("MATURE")) {
      planName = "MatureStage";
    }

    const matchedMembership = memberships.find(
      (m) => m.planName === planName
    );

    if (!matchedMembership) {
      throw new Error("Membership not found");
    }

    await axios.post(
      `${baseUrl}/user/assignMembership/${matchedMembership._id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  const getContentBenefit = () => {
    return benefits.find(
      (benefit) =>
        benefit.name?.toLowerCase() === "online learning sessions"
    );
  };

  const getActivePlanIndex = () => {
    return plans.findIndex(
      (plan) =>
        normalizePlan(plan.label) === normalizePlan(userPlan)
    );
  };

  const getContentPlanLimit = () => {
    const contentBenefit = getContentBenefit();

    if (!contentBenefit) return 0;

    const activePlanIndex = getActivePlanIndex();

    if (activePlanIndex === -1) return 0;

    return Number(
      contentBenefit.values?.[activePlanIndex]
    ) || 0;
  };

  const openBenefitModal = (benefitName) => {
    setSelectedBenefit(benefitName);
    setBenefitMessage("");
    setShowBenefitModal(true);
  };

  const handleBenefitRequest = async () => {
    try {
      setBenefitSubmitting(true);

      const token = localStorage.getItem("accessToken");

      const res = await axios.post(
        `${baseUrl}/user/request-content`,
        {
          selectedServices: [selectedBenefit],
          message: benefitMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        const key = String(selectedBenefit)
          .trim()
          .toLowerCase();

        setBenefitRequestCounts((prev) => ({
          ...prev,
          [key]: (prev[key] || 0) + 1,
        }));

        setShowBenefitModal(false);
        setSelectedBenefit("");
        setBenefitMessage("");

        Swal.fire({
          icon: "success",
          title: "Request Submitted",
          text: `${selectedBenefit} request submitted successfully.`,
          confirmButtonColor: "#d99000",
        });
      }
    } catch (error) {
      console.error("Benefit request error:", error);

      Swal.fire({
        icon: "error",
        title: "Request Failed",
        text:
          error.response?.data?.message ||
          "Something went wrong.",
      });
    } finally {
      setBenefitSubmitting(false);
    }
  };

  const handleRequestClick = async () => {
    const contentBenefit = getContentBenefit();

    if (!contentBenefit) {
      Swal.fire({
        icon: "error",
        title: "Benefit Not Found",
        text: "Online Learning Sessions benefit is not configured.",
      });
      return;
    }

    const activePlanIndex = getActivePlanIndex();

    if (activePlanIndex === -1) {
      Swal.fire({
        icon: "warning",
        title: "No Active Plan",
        text: "Unable to determine your active membership plan.",
      });
      return;
    }

    const limit =
      Number(contentBenefit.values?.[activePlanIndex]) || 0;

    if (limit <= 0) {
      Swal.fire({
        icon: "warning",
        title: "No Content Available",
        text: "Your current membership does not have any content sessions.",
      });
      return;
    }

    setContentLimit(limit);
    setSelectedContent([]);
    setShowContentModal(true);

    await fetchContentData();
  };

  const fetchContentData = async () => {
    try {
      setContentLoading(true);

      const token = localStorage.getItem("accessToken");

      const oldReq = await axios.get(
        `${baseUrl}/user/my-requested-content`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (oldReq.data.success) {
        const requests = oldReq.data.data || [];

        setAlreadySelected(
          oldReq.data.contentRequests || []
        );

        setUsedCount(
          Number(oldReq.data.contentCount) || 0
        );

        const counts = requests.reduce((acc, item) => {
          const key = String(item.service || "")
            .trim()
            .toLowerCase();

          acc[key] = (acc[key] || 0) + 1;

          return acc;
        }, {});

        setBenefitRequestCounts(counts);

        const prev = requests.map(
          (item) => item.service
        );

        setAlreadySelected(prev);
        setUsedCount(
          Number(oldReq.data.count) || requests.length
        );
      }

      const contentRes = await axios.get(
        `${baseUrl}/user/content-options`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (contentRes.data.success) {
        setContentOptions(contentRes.data.data);
      }
    } catch (error) {
      console.error("CONTENT ERROR:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Unable to load content options.",
      });
    } finally {
      setContentLoading(false);
    }
  };

  const handleContentCheck = (serviceName) => {
    if (usedCount >= contentLimit) {
      return;
    }

    if (
      selectedContent.length >=
      contentLimit - usedCount &&
      !selectedContent.includes(serviceName)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Selection Limit Reached",
        text: `You can select only ${contentLimit} content items in your membership.`,
      });

      return;
    }

    if (selectedContent.includes(serviceName)) {
      setSelectedContent(
        selectedContent.filter(
          (service) => service !== serviceName
        )
      );
    } else {
      setSelectedContent([
        ...selectedContent,
        serviceName,
      ]);
    }
  };

  const handleContentSubmit = async () => {
    if (selectedContent.length === 0) {
      return Swal.fire({
        icon: "warning",
        title: "No Content Selected",
        text: "Please select at least one content.",
      });
    }

    const remainingCount =
      contentLimit - usedCount;

    if (selectedContent.length > remainingCount) {
      return Swal.fire({
        icon: "warning",
        title: "Selection Limit Reached",
        text: `You can select only ${remainingCount} more content.`,
      });
    }

    const confirmResult = await Swal.fire({
      title: "Confirm Selection?",
      text: "Once submitted, your selection will be locked for this membership.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Submit",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setContentSubmitting(true);

      const token = localStorage.getItem("accessToken");

      Swal.fire({
        title: "Submitting...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await axios.post(
        `${baseUrl}/user/request-content`,
        {
          selectedServices: selectedContent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.close();

      if (res.data.success) {
        const newCount =
          usedCount + selectedContent.length;

        await Swal.fire({
          icon: "success",
          title: "Selection Locked!",
          text: "Your content selection is locked for this membership.",
          confirmButtonColor: "#16a34a",
        });

        setAlreadySelected([
          ...alreadySelected,
          ...selectedContent,
        ]);

        setUsedCount(newCount);
        setSelectedContent([]);
        setShowContentModal(false);
      }
    } catch (error) {
      console.error("CONTENT SUBMIT ERROR:", error);

      Swal.close();

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Error submitting content.",
      });
    } finally {
      setContentSubmitting(false);
    }
  };

  const closeContentModal = () => {
    if (contentSubmitting) return;

    setShowContentModal(false);
    setSelectedContent([]);
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-lg">
        Loading membership plans...
      </div>
    );
  }

  const activePlan = normalizePlan(userPlan);

  return (
    <div className="p-6 sm:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-800">
        MEMBERSHIP PLANS & BENEFITS
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-sm sm:text-base">
          <thead className="bg-yellow-600 text-white">
            <tr>
              <th className="p-3 border border-gray-300 text-center w-20">
                SR. NO
              </th>

              <th className="p-3 border border-gray-300 text-left">
                Benefit / Service
              </th>

              <th className="p-3 border border-gray-300 text-center">
                Benefit Count
              </th>

              <th className="p-3 border border-gray-300 text-center">
                Left Count
              </th>

              <th className="p-3 border border-gray-300 text-center">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {benefits.map((benefit, index) => {
              const activePlanIndex = plans.findIndex(
                (plan) =>
                  normalizePlan(plan.label) === activePlan
              );

              const benefitCount =
                activePlanIndex !== -1
                  ? Number(
                    benefit.values?.[activePlanIndex]
                  ) || 0
                  : 0;

              const isContentBenefit =
                benefit.name?.toLowerCase() ===
                "online learning sessions";

              const benefitKey = String(benefit.name || "")
                .trim()
                .toLowerCase();

              const usedBenefitCount = isContentBenefit
                ? usedCount
                : benefitRequestCounts[benefitKey] || 0;

              const leftCount = Math.max(
                benefitCount - usedBenefitCount,
                0
              );

              return (
                <tr
                  key={benefit._id || index}
                  className={`${index % 2 === 0
                    ? "bg-white"
                    : "bg-gray-100"
                    } hover:bg-yellow-50`}
                >
                  <td className="p-3 border border-gray-300 text-center font-medium">
                    {index + 1}
                  </td>

                  <td className="p-3 border border-gray-300">
                    {benefit.name}
                  </td>

                  <td className="p-3 border border-gray-300 text-center font-semibold">
                    {benefitCount}
                  </td>

                  <td className="p-3 border border-gray-300 text-center font-semibold">
                    {leftCount}
                  </td>

                  <td className="p-3 border border-gray-300 text-center">
                    <button
                      onClick={() =>
                        isContentBenefit
                          ? handleRequestClick()
                          : openBenefitModal(benefit.name)
                      }
                      disabled={leftCount <= 0}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Request
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showContentModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Online Learning Sessions
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Select the content you want to request
                </p>
              </div>

              <button
                onClick={closeContentModal}
                disabled={contentSubmitting}
                className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 text-2xl disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {contentLoading ? (
                <div className="py-16 text-center">
                  <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

                  <p className="text-gray-600">
                    Loading content...
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-5">
                    Select Content (
                    {usedCount +
                      selectedContent.length}
                    /{contentLimit})
                  </h3>

                  {contentOptions.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      No content options available.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {contentOptions.map((item) => {
                        const name = item.name;

                        const isOld =
                          alreadySelected.includes(
                            name
                          );

                        const selectionLocked =
                          usedCount >= contentLimit;

                        const disabled =
                          selectionLocked || isOld;

                        const isChecked =
                          isOld ||
                          selectedContent.includes(
                            name
                          );

                        return (
                          <label
                            key={item._id}
                            className={`flex items-center gap-3 p-4 border rounded-lg transition ${disabled
                              ? "bg-gray-200 opacity-60 cursor-not-allowed"
                              : "bg-white hover:bg-blue-50 cursor-pointer"
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={disabled}
                              onChange={() =>
                                handleContentCheck(
                                  name
                                )
                              }
                              className="w-5 h-5 accent-blue-600"
                            />

                            <span className="font-medium text-gray-800">
                              {name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-5 bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Already Selected
                      </span>

                      <span className="font-semibold text-blue-600">
                        {usedCount}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600">
                        New Selection
                      </span>

                      <span className="font-semibold text-blue-600">
                        {selectedContent.length}
                      </span>
                    </div>

                    <div className="border-t border-blue-200 mt-3 pt-3 flex justify-between items-center">
                      <span className="font-semibold text-gray-800">
                        Total
                      </span>

                      <span className="font-bold text-lg text-blue-700">
                        {usedCount +
                          selectedContent.length}
                        /{contentLimit}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <span className="font-semibold text-gray-800">
                        Left Count
                      </span>

                      <span className="font-bold text-lg text-green-600">
                        {Math.max(
                          contentLimit -
                          usedCount -
                          selectedContent.length,
                          0
                        )}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {!contentLoading &&
              contentOptions.length > 0 && (
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeContentModal}
                    disabled={contentSubmitting}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleContentSubmit}
                    disabled={
                      contentSubmitting ||
                      usedCount >= contentLimit ||
                      selectedContent.length === 0
                    }
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {contentSubmitting
                      ? "Submitting..."
                      : "Submit"}
                  </button>
                </div>
              )}
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
            <h2 className="text-xl font-bold mb-3 text-gray-800">
              Confirm Payment
            </h2>

            <p className="text-gray-600 mb-5">
              You are about to purchase{" "}
              <strong>{selectedPlan}</strong> plan.
            </p>

            <button
              onClick={handlePayment}
              disabled={isPaying}
              className={`w-full py-2 rounded-lg text-white font-semibold ${isPaying
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-600 hover:bg-yellow-700"
                }`}
            >
              {isPaying
                ? "Processing..."
                : "Pay Now"}
            </button>

            <button
              onClick={() =>
                setShowPaymentModal(false)
              }
              disabled={isPaying}
              className="w-full mt-3 py-2 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showBenefitModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Request Benefit
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {selectedBenefit}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (benefitSubmitting) return;

                  setShowBenefitModal(false);
                  setSelectedBenefit("");
                  setBenefitMessage("");
                }}
                className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter Details
              </label>

              <textarea
                value={benefitMessage}
                onChange={(e) =>
                  setBenefitMessage(e.target.value)
                }
                placeholder="Enter your requirement..."
                rows={6}
                className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />

              <div className="flex justify-end gap-3 mt-5">

                <button
                  type="button"
                  onClick={() => {
                    setShowBenefitModal(false);
                    setSelectedBenefit("");
                    setBenefitMessage("");
                  }}
                  disabled={benefitSubmitting}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleBenefitRequest}
                  disabled={benefitSubmitting}
                  className="px-5 py-2.5 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 disabled:bg-gray-400"
                >
                  {benefitSubmitting
                    ? "Submitting..."
                    : "Submit Request"}
                </button>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipPlans;