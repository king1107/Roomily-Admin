import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import home1 from '../assets/images/home1.png';
import home2 from '../assets/images/home2.png';
import people1 from '../assets/images/people1.png';
import rectangle from '../assets/images/Rectangle.png';
import logo from '../assets/images/logo.png';

const LoginPage = () => {
  const [username, setUsername] = useState(''); // dùng username thay vì email
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Xử lý thay đổi input
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setErrorMessage('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setErrorMessage('');
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      usernameOrEmail: username,
      password: password,
    };

    console.log('Sending login request with payload:', payload);

    try {
      const response = await fetch('https://api.roomily.tech/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log('Response from server:', data);

      if (response.ok) {
        localStorage.setItem('accessToken', data.accessToken);
        navigate('/admin/dashboard');
      } else {
        setErrorMessage(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF3E4] flex items-center justify-center p-4">
      <div className="flex w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-lg">
        {/* Bên trái */}
        <div className="relative w-1/2 bg-gradient-to-t from-[#FBFBFB] to-[#B3FF7C] flex flex-col justify-end overflow-hidden">
          <div className="absolute top-[42%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] z-10">
            <img src={rectangle} alt="rectangle" className='w-full h-auto' />
          </div>
          <div className="absolute top-[2%] left-[25%] z-20 w-[40%]">
            <img src={home1} alt="Living Room" className="w-full h-auto drop-shadow-lg" />
          </div>
          <div className="absolute top-[30%] right-[8%] z-20 w-[40%]">
            <img src={home2} alt="Bedroom" className="w-full h-auto drop-shadow-lg" />
          </div>
          <div className="absolute top-[35%] left-[30%] transform -translate-x-1/2 z-20 w-[40%]">
            <img src={people1} alt="Person" className="w-full h-auto drop-shadow-lg" />
          </div>
          <div className="relative z-30 p-10 mt-auto text-center">
            <h1 className="text-[#73114B] text-2xl font-bold mb-2">Turn your ideas into reality.</h1>
            <p className="text-[#73114B] text-base mb-10">Start for free and get attractive offers from the community</p>
          </div>
        </div>

        {/* Phần form */}
        <div className="w-1/2 p-12 flex flex-col justify-center">
          <div className='flex justify-center mb-5'>
            <img src={logo} alt="logo" className='w-20 h-20' />
          </div>
          <div className="text-center mb-6">
            <h2 className="text-[#3A2A52] text-2xl font-semibold">Login to your Account</h2>
            <p className="text-gray-500 text-sm mt-1">See what is going on with your business</p>
          </div>

          

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="mb-4">
              <label className="block text-gray-600 text-sm mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-gray-600 text-sm mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Lỗi nếu có */}
            {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

            {/* Nút login */}
            <button
              type="submit"
              className="w-full py-2.5 bg-[#8B2D83] text-white rounded-md hover:bg-[#7B2573] transition-colors font-medium"
            >
              Login
            </button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Not Registered Yet? <button onClick={() => navigate('/sign-up')} className="text-[#8B2D83] font-medium">Create an account</button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
