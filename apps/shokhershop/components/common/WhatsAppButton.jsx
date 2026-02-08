"use client";

import { useState, useEffect } from "react";

export default function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show button after a short delay for smooth entrance
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    // WhatsApp phone number: +880 1619-917370
    // Format for WhatsApp URL: 8801619917370
    const phoneNumber = "8801619917370";
    const message = encodeURIComponent("Hello! I'm interested in your products.");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className={`whatsapp-float-button ${isVisible ? "visible" : ""}`}
      aria-label="Chat on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <svg
        viewBox="0 0 32 32"
        className="whatsapp-icon"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16 0C7.164 0 0 7.163 0 16c0 2.826.739 5.486 2.032 7.784L0 32l8.448-2.016A15.94 15.94 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333c-2.41 0-4.719-.648-6.755-1.872l-.485-.291-5.005 1.195 1.221-4.891-.318-.501A13.274 13.274 0 012.667 16c0-7.364 5.97-13.333 13.333-13.333S29.333 8.636 29.333 16 23.364 29.333 16 29.333z" />
        <path d="M23.197 19.803c-.389-.195-2.309-1.141-2.667-1.271-.357-.13-.617-.195-.876.195-.26.39-1.005 1.271-1.232 1.531-.228.26-.455.292-.844.097-.39-.195-1.642-.605-3.127-1.931-1.156-1.032-1.937-2.305-2.165-2.695-.227-.39-.024-.6.171-.795.175-.175.39-.455.584-.683.195-.227.26-.39.39-.65.13-.26.065-.487-.032-.683-.098-.195-.877-2.113-1.201-2.893-.315-.758-.636-.655-.877-.668-.227-.012-.487-.015-.747-.015s-.682.097-.89.487c-.325.39-1.243 1.216-1.243 2.965s1.272 3.438 1.448 3.676c.176.237 2.493 3.807 6.041 5.338.844.365 1.503.583 2.017.747.848.268 1.619.23 2.229.139.68-.101 2.309-.944 2.633-1.857.325-.913.325-1.695.228-1.857-.098-.162-.358-.26-.747-.455z" />
      </svg>
      <span className="whatsapp-text">Chat</span>

      <style jsx>{`
        .whatsapp-float-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 8px;
          background: #25d366;
          color: white;
          border: none;
          border-radius: 50px;
          padding: 12px 20px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          transform: translateY(20px) scale(0.8);
          animation: pulse 2s ease-in-out infinite;
        }

        .whatsapp-float-button.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .whatsapp-float-button:hover {
          background: #20ba56;
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.5);
        }

        .whatsapp-float-button:active {
          transform: translateY(0) scale(0.98);
        }

        .whatsapp-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }

        .whatsapp-text {
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.5px;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
          }
          50% {
            box-shadow: 0 4px 20px rgba(37, 211, 102, 0.6), 0 0 0 8px rgba(37, 211, 102, 0.1);
          }
        }

        @media (max-width: 768px) {
          .whatsapp-float-button {
            bottom: 80px;
            left: 15px;
            right: auto;
            padding: 10px 16px;
          }

          .whatsapp-icon {
            width: 22px;
            height: 22px;
          }

          .whatsapp-text {
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .whatsapp-float-button {
            bottom: 80px;
            left: 15px;
            right: auto;
            padding: 12px;
            border-radius: 50%;
            width: 56px;
            height: 56px;
          }

          .whatsapp-text {
            display: none;
          }

          .whatsapp-icon {
            width: 28px;
            height: 28px;
            margin: 0;
          }
        }
      `}</style>
    </button>
  );
}
