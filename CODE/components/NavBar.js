import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getLoggedInUserId, getLoggedInUserRole } from "../utils/auth";

export default function NavBar() {
  const accid = getLoggedInUserId();
  const role = getLoggedInUserRole();
  const profileLink = accid
    ? role === "Admin"
      ? "/admin/adminAccount"
      : "/account"
    : "/login";

  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navStyle = {
    position: "fixed",
    top: 0,
    zIndex: 999,
    backgroundColor: "white",
    padding: "15px 20px",
    boxShadow: "1px 1px 1px #D6D6D6",
    boxSizing: "border-box",
    width: "100%",
  };

  const desktopContainer = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  };

  const leftMenu = {
    display: "flex",
    gap: "20px",
    fontWeight: "bold",
    alignItems: "center",
  };

  const rightMenu = {
    display: "flex",
    gap: "20px",
    fontWeight: "bold",
    alignItems: "center",
  };

  const centerLogo = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const hamburgerStyle = {
    fontSize: "24px",
    cursor: "pointer",
    border: "none",
    background: "none",
  };

  const mobileMenuStyle = {
    display: menuOpen ? "flex" : "none",
    flexDirection: "column",
    gap: "15px",
    paddingTop: "15px",
    fontWeight: "bold",
  };

  return (
    <nav style={navStyle}>
      {!isMobile ? (
        // 🖥️ Desktop Layout
        <div style={desktopContainer}>
          <div style={leftMenu}>
            <Link href="/">HOME</Link>
            <Link href="/search">SEARCH</Link>
            <Link href="/Compare">COMPARE</Link>
          </div>

          <div style={centerLogo}>
            <Link href="/">
              <Image src="/image/Logo.png" alt="Logo" width={40} height={40} />
            </Link>
          </div>

          <div style={rightMenu}>
            <Link href="/about">ABOUT</Link>
            <Link href="/contact">CONTACT</Link>
            <Link href={profileLink}>
              <Image src="/image/profile.png" alt="Profile Icon" width={20} height={20} />
            </Link>
          </div>
        </div>
      ) : (
        // 📱 Mobile Layout
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              style={hamburgerStyle}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? "✖" : "☰"}
            </button>

            <Link href="/">
              <Image src="/image/Logo.png" alt="Logo" width={36} height={36} />
            </Link>

            <Link href={profileLink}>
              <Image src="/image/profile.png" alt="Profile Icon" width={20} height={20} />
            </Link>
          </div>

          <div style={mobileMenuStyle}>
            <Link href="/">HOME</Link>
            <Link href="/search">SEARCH</Link>
            <Link href="/Compare">COMPARE</Link>
            <Link href="/about">ABOUT</Link>
            <Link href="/contact">CONTACT</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
