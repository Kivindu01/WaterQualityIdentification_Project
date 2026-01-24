"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginPage() {
	const router = useRouter();
	const { login } = useAuth();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
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
		if (!formData.email || !formData.password) {
			setError("Please fill in all fields");
			return;
		}

		setLoading(true);

		try {
			const result = await login(formData.email, formData.password);
			if (result.success) {
				router.push("/");
			} else {
				setError(result.error || "Login failed");
			}
		} catch (err) {
			setError("An error occurred during login");
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
						Sign In
					</h1>
					<p className="mb-8 text-center text-zinc-600 dark:text-zinc-400">
						Access your water treatment models
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
								placeholder="Your password"
								className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
						>
							{loading ? "Signing In..." : "Sign In"}
						</button>
					</form>

					<p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
						Don't have an account?{" "}
						<Link
							href="/register"
							className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
						>
							Sign Up
						</Link>
					</p>
				</motion.div>
			</main>
		</div>
	);
}
