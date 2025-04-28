import React from 'react';
import './NotFoundPage.css';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(window.history.length > 1 ? -1 : '/'); // Quay lại trang trước đó hoặc về trang chủ nếu không có trang trước
  };

  return (
    <div className="NotFound-container">
      <div className="NotFound-error">
        <h1>Uh Ohh!</h1>
        <p>We couldn't find the page that you're looking for :(</p>
        <div className="NotFound-cta">
          <button className="NotFound-cta-back" onClick={handleBackClick}>
            Quay lại
          </button>
        </div>
      </div>
      <img
        src="https://github.com/smthari/404-page-using-html-css/blob/Starter/Images/404.png?raw=true"
        alt="404 error illustration"
        className="NotFound-hero-img"
      />
    </div>
  );
};

export default NotFoundPage;