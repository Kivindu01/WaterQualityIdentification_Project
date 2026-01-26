"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import { useAuth } from "@/app/context/AuthContext";

/**
 * components/Navbar.jsx
 * Modern navbar matching Water Quality Dashboard design system.
 * Features: Blue/cyan gradient, dark mode support, smooth animations, responsive.
 */

export default function Navbar() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const docsRef = useRef(null);
	const router = useRouter();
	const { user, logout } = useAuth();

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(e) {
			if (docsRef.current && !docsRef.current.contains(e.target)) {
				setMobileOpen(false);
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
			}
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, []);

	return (
		<header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-700 dark:bg-black/50">
			<div className="mx-auto max-w-6xl px-6">
				<nav
					className="flex h-16 items-center justify-between"
					aria-label="Top navigation"
				>
					{/* Left: brand */}
					<div className="flex items-center">
						<Link href="/" className="flex items-center space-x-3 group">
							<Image
								src="/images/logo.png"
								alt="HydroMind Logo"
								width={36}
								height={36}
								className="rounded-lg"
							/>
							<span className="font-bold text-lg text-black dark:text-white">
								HydroMind
							</span>
						</Link>
					</div>

					{/* Center: nav links (hidden on mobile) */}
					<div className="hidden md:flex md:items-center md:space-x-1">
						<Link
							href="/"
							className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-100 hover:text-black dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
						>
							Home
						</Link>
						<Link
							href="/water-footprint"
							className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-100 hover:text-black dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
						>
							Water Footprint
						</Link>
						<Link
							href="/about"
							className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-100 hover:text-black dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
						>
							About Us
						</Link>
						<Link
							href="/contact"
							className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-100 hover:text-black dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
						>
							Contact Us
						</Link>
					</div>

					{/* Right: actions + mobile menu button */}
					<div className="flex items-center space-x-3">
						{user ? (
							<>
								<span className="hidden md:inline text-sm text-zinc-600 dark:text-zinc-400">
									{user.email}
								</span>
								<button
									onClick={() => {
										logout();
										router.push("/");
									}}
									className="hidden md:inline rounded-lg px-4 py-2 text-sm font-semibold text-blue-600 transition-all hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
								>
									Sign Out
								</button>
							</>
						) : (
							<Link
								href="/login"
								className="hidden md:inline rounded-lg px-4 py-2 text-sm font-semibold text-blue-600 transition-all hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
							>
								Sign in
							</Link>
						)}
						<Link
							href={user ? "/pre-lime" : "/login"}
							className="hidden md:inline rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700"
						>
							Try Model
						</Link>

						{/* Mobile menu button */}
						<button
							aria-expanded={mobileOpen}
							aria-label="Open menu"
							className="md:hidden rounded-lg p-2 text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
							onClick={() => setMobileOpen(!mobileOpen)}
						>
							<svg
								className="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								{mobileOpen ? (
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								) : (
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 6h16M4 12h16M4 18h16"
									/>
								)}
							</svg>
						</button>
					</div>
				</nav>

				{/* Mobile menu */}
				<div
					className={`${
						mobileOpen
							? "block max-h-96 overflow-hidden"
							: "hidden max-h-0 overflow-hidden"
					} ${
						styles.mobileMenu
					} md:hidden border-t border-zinc-200 dark:border-zinc-700 transition-all duration-300 ease-in-out`}
				>
					<div className="space-y-1 px-2 py-4">
						<Link
							href="/"
							className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
						>
							Home
						</Link>
						<Link
							href="/pre-lime"
							className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
						>
							Lime Dosing
						</Link>
						<Link
							href="/#features"
							className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
						>
							Features
						</Link>
						<Link
							href="/#about"
							className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
						>
							About
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
