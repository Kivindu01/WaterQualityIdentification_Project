"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const MotionSection = ({ children, className }) => {
	const { ref, inView } = useInView({ threshold: 0.3 });

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y: 50 }}
			animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
			transition={{ duration: 0.8, ease: "easeOut" }}
			className={className}
		>
			{children}
		</motion.div>
	);
};

const components = [
	{
		title: "Raw Water Quality Forecaster",
		subtitle: "with Uncertainty",
		description:
			"Advanced ML model that predicts raw water quality parameters with confidence intervals for proactive decision-making.",
		icon: "🌊",
	},
	{
		title: "Chlorine Residual Safety",
		subtitle: "Predictor",
		description:
			"Optimize chlorine dosing levels to ensure safe and effective water disinfection while minimizing excess.",
		icon: "🧪",
	},
	{
		title: "Alum Dose",
		subtitle: "Optimizer",
		description:
			"Predict optimal alum dosing for efficient coagulation and flocculation processes in water treatment.",
		icon: "⚗️",
	},
	{
		title: "Lime Dosing",
		subtitle: "Stabilizer",
		description:
			"Balance pH and alkalinity with precise lime dosing recommendations for stable, safe drinking water.",
		icon: "⚖️",
	},
];

export default function Home() {
	const [activeTab, setActiveTab] = useState(0);

	return (
		<div className="relative min-h-screen overflow-hidden bg-white dark:bg-black">
			{/* Background Image */}
			<div
				className="absolute inset-0 opacity-5 dark:opacity-10"
				style={{
					backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><defs><pattern id="water" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M0,50 Q25,40 50,50 T100,50" fill="none" stroke="%23666" stroke-width="2"/><circle cx="30" cy="70" r="3" fill="%23666" opacity="0.5"/><circle cx="70" cy="80" r="2" fill="%23666" opacity="0.5"/></pattern></defs><rect width="1200" height="600" fill="url(%23water)"/></svg>')`,
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			/>

			<main className="relative z-10">
				{/* Hero Section */}
				<section className="flex min-h-screen items-center justify-center px-6 py-20">
					<div className="mx-auto max-w-4xl text-center">
						<motion.div
							initial={{ opacity: 0, y: -30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.2 }}
						>
							<h1 className="mb-6 text-5xl font-extrabold leading-tight text-black dark:text-white sm:text-6xl">
								Precision Water Treatment{" "}
								<span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
									for a Healthier Nation
								</span>
							</h1>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.4 }}
						>
							<p className="mb-8 text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-xl">
								We bring together water experts, innovators, and institutions
								united by a shared mission to ensure clean, reliable drinking
								water for Sri Lankan community.
							</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.8, delay: 0.6 }}
							className="flex flex-wrap justify-center gap-4"
						>
							<a
								href="/"
								className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg"
							>
								Try the Model
							</a>
							<a
								href="/docs"
								className="inline-flex items-center rounded-lg border-2 border-zinc-300 px-8 py-4 text-base font-semibold text-zinc-900 transition-all hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900"
							>
								Learn More
							</a>
						</motion.div>
					</div>
				</section>

				{/* Components Section */}
				<section className="px-6 py-20">
					<div className="mx-auto max-w-5xl">
						<MotionSection className="mb-12 text-center">
							<h2 className="mb-4 text-4xl font-extrabold text-black dark:text-white">
								Advanced Treatment Features
							</h2>
							<p className="text-lg text-zinc-600 dark:text-zinc-400">
								Four powerful tools for comprehensive water quality management
							</p>
						</MotionSection>

						{/* Tabs */}
						<MotionSection
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.3 }}
							className="mb-8"
						>
							<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
								{components.map((component, idx) => (
									<motion.button
										key={idx}
										onClick={() => setActiveTab(idx)}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										className={`rounded-lg border-2 p-4 text-left transition-all duration-300 ${
											activeTab === idx
												? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
												: "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
										}`}
									>
										<div className="mb-2 text-2xl">{component.icon}</div>
										<h3 className="font-semibold text-black dark:text-white">
											{component.title}
										</h3>
										<p className="text-sm text-zinc-600 dark:text-zinc-400">
											{component.subtitle}
										</p>
									</motion.button>
								))}
							</div>
						</MotionSection>

						{/* Active Tab Content */}
						<MotionSection
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-8 dark:border-blue-900 dark:from-blue-950/20 dark:to-cyan-950/20"
						>
							<div className="flex items-start gap-6">
								<div className="flex-shrink-0 text-5xl">
									{components[activeTab].icon}
								</div>
								<div>
									<h3 className="mb-2 text-2xl font-bold text-black dark:text-white">
										{components[activeTab].title}
									</h3>
									<p className="mb-4 text-lg font-semibold text-blue-600 dark:text-blue-400">
										{components[activeTab].subtitle}
									</p>
									<p className="text-zinc-700 dark:text-zinc-300">
										{components[activeTab].description}
									</p>
									{/* Lime Dosing and Alum Dose - Show Manual/Automatic buttons */}
									{activeTab === 2 || activeTab === 3 ? (
										<div className="mt-6 flex flex-wrap gap-3">
											<a
												href={
													activeTab === 3 ? "/pre-lime" : "/alum-dosing/manual"
												}
												className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700"
											>
												📋 Manual Mode
											</a>
											<button
												disabled
												className="inline-flex items-center rounded-lg border-2 border-blue-600 px-6 py-2 text-sm font-semibold text-blue-600 transition-all opacity-60 cursor-not-allowed dark:border-blue-400 dark:text-blue-400"
											>
												🤖 Automatic Mode
											</button>
										</div>
									) : (
										<a
											href="/"
											className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700"
										>
											Explore {components[activeTab].title}
										</a>
									)}
								</div>
							</div>
						</MotionSection>
					</div>
				</section>

				{/* Latest News Section */}
				<section className="px-6 py-20 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
					<div className="mx-auto max-w-5xl">
						<MotionSection className="mb-12 text-center">
							<h2 className="mb-4 text-4xl font-extrabold text-black dark:text-white">
								Latest News & Updates
							</h2>
							<p className="text-lg text-zinc-600 dark:text-zinc-400">
								Stay informed about water quality research and industry insights
							</p>
						</MotionSection>

						<div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{[
								{
									date: "Jan 7, 2026",
									title: "New ML Model Achieves 95% Accuracy",
									excerpt:
										"Our latest raw water quality forecasting model surpasses industry benchmarks with improved uncertainty quantification.",
									category: "Research",
								},
								{
									date: "Jan 3, 2026",
									title: "Water Safety Guidelines Updated",
									excerpt:
										"Sri Lanka updates drinking water safety standards with recommendations for optimal chlorine residual levels.",
									category: "Policy",
								},
								{
									date: "Dec 28, 2025",
									title: "Community Water Treatment Workshop",
									excerpt:
										"Successful training program completed with 150+ water treatment operators across 12 districts.",
									category: "Training",
								},
							].map((news, idx) => (
								<MotionSection key={idx} className="group">
									<div className="h-full rounded-lg border border-zinc-200 bg-white p-6 transition-all hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:hover:shadow-xl">
										<div className="mb-3 flex items-center justify-between">
											<span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
												{news.category}
											</span>
											<span className="text-sm text-zinc-500 dark:text-zinc-400">
												{news.date}
											</span>
										</div>
										<h3 className="mb-2 text-lg font-bold text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
											{news.title}
										</h3>
										<p className="text-zinc-600 dark:text-zinc-400">
											{news.excerpt}
										</p>
										<button className="mt-4 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
											Read More →
										</button>
									</div>
								</MotionSection>
							))}
						</div>

						<MotionSection className="text-center">
							<a
								href="/news"
								className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg"
							>
								View All News
							</a>
						</MotionSection>
					</div>
				</section>

				{/* Features Section */}
				<section className="px-6 py-20">
					<div className="mx-auto max-w-5xl">
						<MotionSection className="mb-12 text-center">
							<h2 className="mb-4 text-4xl font-extrabold text-black dark:text-white">
								Why Choose Us
							</h2>
							<p className="text-lg text-zinc-600 dark:text-zinc-400">
								Built with precision and powered by explainable AI
							</p>
						</MotionSection>

						<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
							{[
								{
									title: "ML-Powered",
									desc: "Advanced predictive models trained on real water quality data",
								},
								{
									title: "Explainable",
									desc: "LIME-based explanations for every prediction",
								},
								{
									title: "Real-Time",
									desc: "Get insights instantly with our optimized infrastructure",
								},
							].map((feature, idx) => (
								<MotionSection
									key={idx}
									className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900"
								>
									<h3 className="mb-2 text-lg font-bold text-black dark:text-white">
										{feature.title}
									</h3>
									<p className="text-zinc-600 dark:text-zinc-400">
										{feature.desc}
									</p>
								</MotionSection>
							))}
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
