"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const links = [
    { name: "Home", href: "/" },
    { name: "Schedules", href: "/schedules" },
    { name: "Locators", href: "/locators" },
    { name: "Reports", href: "/reports" },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    setDropdownOpen(false);
    router.push("/login");
  };

  if (pathname.startsWith("/login")) {
    return <></>;
  }

  return (
    <nav
      style={{
        backgroundColor: "#047857",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.8rem 1rem",
      }}
    >
      {/* Left: Logo + Text */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "50%",
            padding: "0.1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/images/wwlogo.png"
            alt="WasteWise Logo"
            style={{ height: "30px", width: "30px", objectFit: "cover" }}
          />
        </div>
        <span style={{ color: "white", fontWeight: "bold", fontSize: "1.2rem" }}>
          WasteWise
        </span>
      </div>

      {/* Center Links */}
      <div style={{ display: "flex", gap: "2rem" }}>
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            style={{
              color: "white",
              textDecoration: pathname === link.href ? "underline" : "none",
              fontWeight: pathname === link.href ? "bold" : "normal",
            }}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Right: User Icon with Dropdown */}
      <div style={{ position: "relative" }} ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((open) => !open)}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "1.9rem",
            cursor: "pointer",
          }}
        >
          <i className="fa-solid fa-circle-user"></i>
        </button>
        {dropdownOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "2.5rem",
              background: "white",
              borderRadius: "0.5rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              minWidth: "120px",
              zIndex: 10,
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "0.5rem 1rem",
                background: "none",
                border: "none",
                color: "#047857",
                textAlign: "left",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
