import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLoginMutation, useVerifyOTPMutation } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import useAuthStore from "../store/authStore";

const LoginForm = () => {
    const loginMutation = useLoginMutation();
    const verifyOTPMutation = useVerifyOTPMutation();
    const [isOTPStage, setIsOTPStage] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [otpTimer, setOTPTimer] = useState(300);
    const [isOTPTimerActive, setIsOTPTimerActive] = useState(false);
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const { register: loginRegister, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors }, reset: resetLoginForm } = useForm();
    const { register: otpRegister, handleSubmit: handleOTPSubmit, formState: { errors: otpErrors }, reset: resetOTPForm } = useForm();

    // Handle Login Submit
    const onSubmitLogin = (data) => {
        const { email, password } = data;
        setUserEmail(email);
        loginMutation.mutate(
            { email, password },
            {
                onSuccess: () => {
                    setIsOTPStage(true);
                    setOTPTimer(300);
                    setIsOTPTimerActive(true);
                    resetOTPForm();
                    resetLoginForm();
                },
            }
        );
    };

    const onSubmitOTP = (data) => {
        const { otp } = data;
        verifyOTPMutation.mutate(
            { email: userEmail, otp_code: otp },
            {
                onSuccess: () => {
                    setIsOTPStage(false);
                    setIsOTPTimerActive(false);
                    navigate('/layout/');
                },
            }
        );
    };

    useEffect(() => {
        if (isOTPTimerActive && otpTimer > 0) {
            const timer = setInterval(() => {
                setOTPTimer(prevTime => prevTime - 1);
            }, 1000);

            return () => clearInterval(timer);
        } else if (otpTimer === 0) {
            setIsOTPTimerActive(false);
        }
    }, [otpTimer, isOTPTimerActive]);

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    {!isOTPStage ? (
                        <form onSubmit={handleLoginSubmit(onSubmitLogin)} className="card p-4 shadow">
                            <h3 className="text-center mb-4">Login</h3>
                            <div className="mb-3">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    {...loginRegister('email', { required: 'Email is required' })}
                                    placeholder="Enter email"
                                />
                                {loginErrors.email && <p className="text-danger">{loginErrors.email.message}</p>}
                            </div>
                            <div className="mb-3">
                                <label>Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    {...loginRegister('password', { required: 'Password is required' })}
                                    placeholder="Enter password"
                                />
                                {loginErrors.password && <p className="text-danger">{loginErrors.password.message}</p>}
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                                disabled={loginMutation.status === 'pending'}
                            >
                                {loginMutation.status === 'pending' ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Sending OTP...
                                    </>
                                ) : 'Login'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleOTPSubmit(onSubmitOTP)} className="card p-4 shadow">
                            <h3 className="text-center mb-4">Verify OTP</h3>
                            <div className="mb-3">
                                <label>OTP</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    {...otpRegister('otp', { required: 'OTP is required' })}
                                    placeholder="Enter OTP"
                                />
                                {otpErrors.otp && <p className="text-danger">{otpErrors.otp.message}</p>}
                            </div>

                            <div className="mb-3 text-center">
                                <span>OTP Expires In: {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')}</span>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-success w-100"
                                disabled={verifyOTPMutation.status === 'pending' || otpTimer === 0}
                            >
                                {verifyOTPMutation.status === 'pending' ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Verifying OTP...
                                    </>
                                ) : 'Verify OTP'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
