import React from "react";

const Footer = () => {
  const APP_NAME = import.meta.env.VITE_APP_NAME;

  return (
    <footer
      className="py-3 bg-dark text-white d-flex justify-content-between align-items-center px-5 w-100 position-absolute bottom-0"
      style={{ height: "60px", zIndex: 1000 }}
    >
      <span className="text-secondary">
        &copy; {new Date().getFullYear()} {APP_NAME} | All rights reserved.
      </span>

      <div>
        <a href="#" className="text-white me-3">
          <i className="bi bi-facebook"></i>
        </a>
        <a href="#" className="text-white me-3">
          <i className="bi bi-twitter"></i>
        </a>
        <a href="#" className="text-white me-3">
          <i className="bi bi-instagram"></i>
        </a>
        <a href="#" className="text-white">
          <i className="bi bi-linkedin"></i>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
