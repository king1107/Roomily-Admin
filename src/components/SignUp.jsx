import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import home1 from '../images/home1.png';
import home2 from '../images/home2.png';
import people1 from '../images/people1.png';
import rectangle from '../images/Rectangle.png';
import logo from '../images/logo.png'

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  // Email validation function with regex pattern
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle regular input changes without validation
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  // Validate email on blur
  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setErrors(prev => ({...prev, email: 'Vui lòng nhập địa chỉ email hợp lệ'}));
    } else {
      setErrors(prev => ({...prev, email: ''}));
    }
  };

  // Validate password on blur
  const handlePasswordBlur = () => {
    if (password && password.length < 8) {
      setErrors(prev => ({...prev, password: 'Mật khẩu phải có ít nhất 8 ký tự'}));
    } else {
      setErrors(prev => ({...prev, password: ''}));
    }
  };

  // Validate confirm password on blur
  const handleConfirmPasswordBlur = () => {
    if (confirmPassword && password !== confirmPassword) {
      setErrors(prev => ({...prev, confirmPassword: 'Mật khẩu xác nhận không khớp'}));
    } else {
      setErrors(prev => ({...prev, confirmPassword: ''}));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const newErrors = {
      email: email ? (validateEmail(email) ? '' : 'Vui lòng nhập địa chỉ email hợp lệ') : 'Email không được để trống',
      password: password ? (password.length >= 8 ? '' : 'Mật khẩu phải có ít nhất 8 ký tự') : 'Mật khẩu không được để trống',
      confirmPassword: confirmPassword ? 
        (password === confirmPassword ? '' : 'Mật khẩu xác nhận không khớp') : 
        'Vui lòng xác nhận mật khẩu'
    };
    
    setErrors(newErrors);
    
    // Only navigate if there are no errors
    if (!newErrors.email && !newErrors.password && !newErrors.confirmPassword) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF3E4] flex items-center justify-center p-4">
      <div className="flex w-full max-w-5xl max-h-fit bg-white rounded-2xl overflow-hidden shadow-lg">
        {/* Phần bên trái - Minh họa và Thông điệp */}
        <div className="relative w-1/2 bg-gradient-to-t from-[#FBFBFB] to-[#B3FF7C] flex flex-col justify-end p-0 overflow-hidden">
          {/* Hình tròn lớn màu hồng nhạt ở giữa làm nền */}
          <div className="absolute top-[42%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] z-10">
            <img src={rectangle} alt="rectangle" className='w-full h-auto' />
          </div>
          
          {/* Hình ảnh phòng khách - góc trên bên trái */}
          <div className="absolute top-[2%] left-[25%] z-20 w-[40%]">
            <img 
              src={home1} 
              alt="Living Room" 
              className="w-full h-auto drop-shadow-lg"
            />
          </div>
          
          {/* Hình ảnh phòng ngủ - góc bên phải */}
          <div className="absolute top-[30%] right-[8%] z-20 w-[40%]">
            <img 
              src={home2}
              alt="Bedroom" 
              className="w-full h-auto drop-shadow-lg"
            />
          </div>
          
          {/* Hình ảnh người ngồi trên ghế đệm - giữa dưới */}
          <div className="absolute top-[35%] left-[30%] transform -translate-x-1/2 z-20 w-[40%]">
            <img 
              src={people1} 
              alt="Person on Bean Bag" 
              className="w-full h-auto drop-shadow-lg"
            />
          </div>
          
          {/* Nội dung phần bên trái */}
          <div className="relative z-30 p-10 mt-auto">
            <h1 className="text-[#73114B] text-2xl font-bold mb-2 text-center">Turn your ideas into reality.</h1>
            <p className="text-[#73114B] text-base mb-10 text-center">Start for free and get attractive offers from the community</p>
          </div>
        </div>

        {/* Phần bên phải - Form đăng ký */}
        <div className="w-1/2 p-12 flex flex-col justify-center">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <img src={logo} alt="logo" className='w-20 h-20' />
          </div>

          {/* Tiêu đề form */}
          <div className="text-center mb-6">
            <h2 className="text-[#3A2A52] text-2xl font-semibold">Create an account</h2>
            <p className="text-gray-500 text-sm mt-1">See what is going on with your business</p>
          </div>
          
          {/* Form đăng ký */}
          <form onSubmit={handleSubmit}>
            
            {/* Input Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-600 text-sm mb-1">Email</label>
              <input
                placeholder="example@gmail.com"
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500`}
                required
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            {/* Input Password */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-600 text-sm mb-1">Password</label>
              <input
                placeholder="Enter your password"
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500`}
                required
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Input Confirm Password */}
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-gray-600 text-sm mb-1">Confirm Password</label>
              <input
                placeholder="Confirm your password"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                onBlur={handleConfirmPasswordBlur}
                className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500`}
                required
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
            
            {/* Nút đăng ký */}
            <button
              onClick={handleSubmit}
              type="submit"
              className="w-full py-2.5 bg-[#8B2D83] text-white rounded-md hover:bg-[#7B2573] transition-colors font-medium"
            >
              Sign Up
            </button>
            
            {/* Đăng nhập tài khoản */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already Have An Account? <button onClick={() => navigate('/')} className="text-[#8B2D83] font-medium">Log in</button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;