import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import placeholder from '../assets/images/Placeholder.png';

// Komponen Login
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [headerContent, setHeaderContent] = useState({
    image: null,
    title: 'SEKOLAH NUSANTARA'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchHeaderSettings();
  }, []);

  // Mengambil pengaturan header dari server
  const fetchHeaderSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/web-settings/component/header');
      if (response.data) {
        setHeaderContent({
          image: response.data.image || null,
          title: response.data.title || 'SEKOLAH NUSANTARA'
        });
        document.title = `Login - ${response.data.title || 'SEKOLAH NUSANTARA'}`;
        if (response.data.image) {
          const favicon = document.querySelector("link[rel='icon']");
          if (favicon) {
            favicon.href = response.data.image;
          } else {
            const newFavicon = document.createElement('link');
            newFavicon.rel = 'icon';
            newFavicon.href = response.data.image;
            document.head.appendChild(newFavicon);
          }
        }
      }
    } catch (error) {
      console.error('Error loading header settings:', error);
    }
  };

  const storeToken = (token) => {
    localStorage.setItem('token', token);
  };

  // Menangani proses login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });

      if (response.data.success && response.data.token) {
        storeToken(response.data.token);
        navigate('/admin', { replace: true });
      } else {
        setError(response.data.message || 'Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (!err.response) {
        setError('Cannot connect to server. Please try again later.');
      } else if (err.response.status === 401) {
        setError('Invalid username or password');
      } else if (err.response.status === 500) {
        setError('Server error. Please try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Menangani verifikasi OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        username,
        otp
      });

      if (response.data.token) {
        storeToken(response.data.token);
        navigate('/admin');
      } else {
        setError('Invalid OTP verification response');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      
      if (err.response?.status === 401) {
        setError('Invalid or expired OTP');
      } else {
        setError('OTP verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Menangani error pada loading gambar
  const handleImageError = (e) => {
    e.target.src = placeholder;
  };

  return (
    <div className="min-h-screen bg-base-200 grid place-items-center px-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Logo dan Judul */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <img 
              src={headerContent.image || placeholder} 
              alt="Logo"
              className="w-16 h-16 object-contain"
              onError={handleImageError}
            />
            <div className="text-center">
              <h1 className="text-2xl font-bold">{headerContent.title}</h1>
              <p className="text-sm text-base-content/60">Admin Panel Login</p>
            </div>
          </div>

          {!showOtpInput ? (
            // Form Login
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Input Username */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Username</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="input input-bordered w-full pl-10"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <span className="absolute inset-y-0 left-0 grid w-10 place-content-center text-base-content/30">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Input Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    className="input input-bordered w-full pl-10"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <span className="absolute inset-y-0 left-0 grid w-10 place-content-center text-base-content/30">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Tombol Masuk */}
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    <span className="ml-2">Signing in...</span>
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          ) : (
            // Form Verifikasi OTP
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-base-content/70">
                  Please enter the verification code sent to your email
                </p>
              </div>

              {/* OTP Input */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Verification Code</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full text-center text-2xl tracking-[1em]"
                  placeholder="000000"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  required
                />
              </div>

              {/* Tombol Verifikasi */}
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    <span className="ml-2">Verifying...</span>
                  </>
                ) : (
                  'Verify Code'
                )}
              </button>

              {/* Tombol Kembali */}
              <button
                type="button"
                onClick={() => {
                  setShowOtpInput(false);
                  setOtp('');
                  setError('');
                }}
                className="btn btn-ghost btn-sm w-full"
                disabled={loading}
              >
                Back to Login
              </button>
            </form>
          )}

          {/* Alert Error */}
          {error && (
            <div className="alert alert-error mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
