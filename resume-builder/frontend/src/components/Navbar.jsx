import React, { useState, useEffect } from "react";
import "./navbar.css";

const LOGO_SRC = "data:image/png;base64,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";

function moduleUrl(base, userName) {
  return userName
    ? `${base}?user=${encodeURIComponent(userName)}`
    : base;
}

export function Navbar() {
  const [userName, setUserName] = useState(null);
  const [dropOpen, setDropOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("user");
    if (fromUrl) {
      setUserName(fromUrl);
      localStorage.setItem("rn_user", fromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const stored = localStorage.getItem("rn_user");
      if (stored) setUserName(stored);
    }

    const handleScroll = () => {
      const s = document.documentElement.scrollTop;
      const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollWidth(h > 0 ? (s / h) * 100 : 0);
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    const close = () => { setDropOpen(false); setProfileOpen(false); };
    document.addEventListener("click", close);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", close);
    };
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("rn_user");
    window.location.href = "http://localhost:5000/?logout=true";
  };

  const stopProp = (e) => e.stopPropagation();

  return (
    <>
      <div className="rn-progress-bar" style={{ width: `${scrollWidth}%` }}></div>
      <nav className={`rn-nav ${scrolled ? 'rn-nav-scrolled' : ''}`}>
        <a href="http://localhost:5000/" className="rn-nav-logo">
          <img src={LOGO_SRC} className="rn-logo-img" alt="RoleNavigator Logo" />
          <span className="rn-logo-text">RoleNavigator</span>
        </a>

        <ul className="rn-nav-menu">
          <li><a href="http://localhost:5000/#hero">Home</a></li>
          <li
            className="rn-nav-dropdown"
            onClick={(e) => { stopProp(e); setDropOpen((o) => !o); }}
          >
            <a href="#" onClick={(e) => e.preventDefault()}>Modules</a>
            <ul className={`rn-dropdown-menu${dropOpen ? " rn-open" : ""}`}>
              <li><a href={moduleUrl("http://localhost:5001/", userName)}>Resume Analyzer</a></li>
              <li><a href={moduleUrl("http://localhost:5004/", userName)}>Resume Optimizer</a></li>
              <li><a href={moduleUrl("http://localhost:5002/", userName)}>Interview Q Prediction</a></li>
            </ul>
          </li>
          <li><a href="http://localhost:5000/#features">Features</a></li>
        </ul>

        <div className="rn-nav-actions">
          {userName ? (
            <div
              className="rn-profile-wrap"
              onClick={(e) => { stopProp(e); setProfileOpen((o) => !o); }}
            >
              <div className="rn-profile-icon">
                <span style={{ fontSize: "15px", fontWeight: 800, color: "#2563eb", lineHeight: 1 }}>
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <ul className={`rn-profile-dropdown${profileOpen ? " rn-open" : ""}`}>
                <li style={{ padding: "10px 14px 2px", fontSize: "13px", fontWeight: 700, color: "#64748b" }}>
                  Signed in as {userName}
                </li>
                <div className="rn-p-divider" />
                <li className="rn-logout"><a href="#" onClick={handleLogout}>Log Out</a></li>
              </ul>
            </div>
          ) : (
            <>
              <button 
                onClick={() => window.location.href="http://localhost:5000/"} 
                className="rn-btn-ghost"
              >
                Login
              </button>
              <a href="http://localhost:5000/" className="rn-btn-primary">Sign Up →</a>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
