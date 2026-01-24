"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";

export default function RegisterPage() {
	const router = useRouter();
	const { register } = useAuth();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		// Validation
		if (!formData.name || !formData.email || !formData.password) {
			setError("Please fill in all fields");
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (formData.password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		setLoading(true);

		try {
			const result = await register(
				formData.email,
				formData.password,
				formData.name
			);
			if (result.success) {
				router.push("/");
			} else {
				setError(result.error || "Registration failed");
			}
		} catch (err) {
			setError("An error occurred during registration");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative min-h-screen overflow-hidden bg-white dark:bg-black">
			{/* Background */}
			<div
				className="absolute inset-0 opacity-10 dark:opacity-20"
				style={{
					backgroundImage: `url('/images/background.jpg')`,
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			/>

			<main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-20">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5 }}
					className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-900"
				>
					<h1 className="mb-2 text-center text-3xl font-bold text-black dark:text-white">
						Create Account
					</h1>
					<p className="mb-8 text-center text-zinc-600 dark:text-zinc-400">
						Join us to access water treatment models
					</p>

					{error && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
						>
							{error}
						</motion.div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-zinc-900 dark:text-white">
								Full Name
							</label>
							<input
								type="text"
								name="name"
								value={formData.name}
								onChange={handleChange}
								placeholder="John Doe"
								className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-zinc-900 dark:text-white">
								Email
							</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								placeholder="you@example.com"
								className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-zinc-900 dark:text-white">
								Password
							</label>
							<input
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								placeholder="At least 6 characters"
								className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-zinc-900 dark:text-white">
								Confirm Password
							</label>
							<input
								type="password"
								name="confirmPassword"
								value={formData.confirmPassword}
								onChange={handleChange}
								placeholder="Confirm your password"
								className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
						>
							{loading ? "Creating Account..." : "Sign Up"}
						</button>
					</form>

					<p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
						Already have an account?{" "}
						<Link
							href="/login"
							className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
						>
							Sign In
						</Link>
					</p>
				</motion.div>
			</main>
		</div>
	);
}
