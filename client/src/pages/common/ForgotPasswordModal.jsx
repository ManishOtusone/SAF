import React, { useState } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";
import Swal from "sweetalert2";

const ForgotPasswordModal = ({ onClose }) => {

    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);


    const handleSendOtp = async () => {

        if (!email) {
            return Swal.fire("Error", "Please enter email", "error");
        }

        try {

            setLoading(true);

            const res = await axios.post(`${baseUrl}/auth/send-otp`, { email });

            if (res.data.success) {

                Swal.fire("Success", "OTP sent to your email", "success");
                setStep(2);

            }

        } catch (err) {

            Swal.fire(
                "Error",
                err.response?.data?.message || "Failed to send OTP",
                "error"
            );

        } finally {
            setLoading(false);
        }
    };


    const handleVerifyOtp = async () => {

        if (!otp) {
            return Swal.fire("Error", "Enter OTP", "error");
        }

        try {

            setLoading(true);

            const res = await axios.post(`${baseUrl}/auth/verify-otp`, {
                email,
                otp,
            });

            if (res.data.success) {

                Swal.fire("Verified", "OTP verified successfully", "success");
                setStep(3);

            }

        } catch (err) {

            Swal.fire(
                "Error",
                err.response?.data?.message || "Invalid OTP",
                "error"
            );

        } finally {
            setLoading(false);
        }
    };


    const handleResetPassword = async () => {

        if (password !== confirmPassword) {
            return Swal.fire("Error", "Passwords do not match", "error");
        }

        try {

            setLoading(true);

            const res = await axios.post(`${baseUrl}/auth/reset-password`, {
                email,
                password,
            });

            if (res.data.success) {

                Swal.fire("Success", "Password updated successfully", "success");
                onClose();

            }

        } catch (err) {

            Swal.fire(
                "Error",
                err.response?.data?.message || "Password reset failed",
                "error"
            );

        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black/20 bg-opacity-40 flex justify-center items-center z-50">

            <div className="bg-white w-96 p-6 rounded-lg shadow-lg">

                <h2 className="text-xl font-semibold mb-4 text-center">
                    Forgot Password
                </h2>


                {step === 1 && (
                    <>
                        <input
                            type="email"
                            placeholder="Enter registered email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border p-2 rounded mb-3"
                        />

                        <button
                            onClick={handleSendOtp}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </>
                )}

                {/* STEP 2 OTP */}

                {step === 2 && (
                    <>
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full border p-2 rounded mb-3"
                        />

                        <button
                            onClick={handleVerifyOtp}
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </>
                )}

                {/* STEP 3 PASSWORD */}

                {step === 3 && (
                    <>
                        <input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border p-2 rounded mb-3"
                        />

                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border p-2 rounded mb-3"
                        />

                        <button
                            onClick={handleResetPassword}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                        >
                            {loading ? "Updating..." : "Reset Password"}
                        </button>
                    </>
                )}

                <button
                    onClick={onClose}
                    className="mt-4 w-full text-gray-500 text-sm"
                >
                    Cancel
                </button>

            </div>

        </div>
    );
};

export default ForgotPasswordModal;