"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";

/**
 * components/Navbar.jsx
 * Client component for Next.js app router. Uses Tailwind for layout and a CSS module for small transitions.
 */

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const docsRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (docsRef.current && !docsRef.current.contains(e.target)) {
        setDocsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setDocsOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="flex h-16 items-center justify-between"
          aria-label="Top navigation"
        >
          {/* Left: brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <img
                className="h-8 w-8 rounded-md"
                src="https://via.placeholder.com/40"
                alt="Logo"
              />
              <span className="font-semibold text-lg">YourBrand</span>
            </Link>
          </div>

          {/* Center: nav links (hidden on mobile) */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link
              href="/features"
              className="text-gray-600 hover:text-gray-900"
            >
              Features
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>

            {/* Docs dropdown */}
            <div className="relative" ref={docsRef}>
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={docsOpen}
                onClick={() => setDocsOpen((s) => !s)}
                className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
              >
                Docs
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Keep dropdown in DOM for transition */}
              <div
                role="menu"
                aria-label="Docs"
                className={`${styles.dropdown} ${
                  docsOpen ? styles.open : ""
                } absolute left-0 mt-2 w-48 bg-white border rounded shadow-lg z-20`}
              >
                <Link
                  href="/docs/guides"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  Guides
                </Link>
                <Link
                  href="/docs/api"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  API
                </Link>
                <Link
                  href="/changelog"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  role="menuitem"
                >
                  Changelog
                </Link>
              </div>
            </div>
          </div>

          {/* Right: actions + mobile menu button */}
          <div className="flex items-center space-x-3">
            <Link
              href="/signin"
              className="hidden md:inline text-sm text-gray-600 hover:text-gray-900"
            >
              Sign in
            </Link>
            <Link
              href="/get-started"
              className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md shadow-sm hover:bg-indigo-700"
            >
              Get started
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((s) => !s)}
              aria-controls="mobile-menu"
              aria-expanded={mobileOpen}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>

              {/* icons: show/hide */}
              <svg
                className={`${mobileOpen ? "hidden" : "block"} w-6 h-6`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${mobileOpen ? "block" : "hidden"} w-6 h-6`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu - keep in DOM for transitions */}
      <div
        id="mobile-menu"
        className={`${styles.mobileMenu} md:hidden border-t bg-white ${
          mobileOpen ? styles.mobileOpen : ""
        }`}
      >
        <div className="px-4 pt-4 pb-3 space-y-1">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Home
          </Link>
          <Link
            href="/features"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Pricing
          </Link>

          <button
            onClick={() => setDocsOpen((s) => !s)}
            className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Docs
          </button>

          {/* nested mobile docs */}
          <div className={`${docsOpen ? "block" : "hidden"} pl-4`}>
            <Link
              href="/docs/guides"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md text-base text-gray-700 hover:bg-gray-50"
            >
              Guides
            </Link>
            <Link
              href="/docs/api"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md text-base text-gray-700 hover:bg-gray-50"
            >
              API
            </Link>
          </div>

          <Link
            href="/get-started"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-gray-50"
          >
            Get started
          </Link>
          <Link
            href="/signin"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
