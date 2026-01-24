"use client";

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

const allNews = [
	{
		date: "Jan 7, 2026",
		title: "New ML Model Achieves 95% Accuracy",
		excerpt:
			"Our latest raw water quality forecasting model surpasses industry benchmarks with improved uncertainty quantification.",
		category: "Research",
		content:
			"After months of development and testing, our research team has successfully deployed an enhanced ML model that achieves 95% accuracy in predicting raw water quality parameters. The model now includes improved uncertainty quantification, allowing treatment operators to make more informed decisions with confidence intervals on predictions.",
	},
	{
		date: "Jan 3, 2026",
		title: "Water Safety Guidelines Updated",
		excerpt:
			"Sri Lanka updates drinking water safety standards with recommendations for optimal chlorine residual levels.",
		category: "Policy",
		content:
			"The Ministry of Health has issued updated drinking water safety guidelines that align with our chlorine residual predictor model. These new standards emphasize the importance of precise dosing to maintain safety while minimizing excessive chlorine levels that can cause taste and odor issues.",
	},
	{
		date: "Dec 28, 2025",
		title: "Community Water Treatment Workshop",
		excerpt:
			"Successful training program completed with 150+ water treatment operators across 12 districts.",
		category: "Training",
		content:
			"Our community outreach program successfully trained over 150 water treatment operators across 12 districts in Sri Lanka. Participants learned how to use our predictive models and understand LIME-based explanations for model decisions, empowering them to optimize their treatment processes.",
	},
	{
		date: "Dec 15, 2025",
		title: "Partnership with Water Authority Announced",
		excerpt:
			"Strategic collaboration to deploy ML models across 50+ treatment facilities nationwide.",
		category: "Partnerships",
		content:
			"We are excited to announce a strategic partnership with the National Water Authority. Under this agreement, our water quality optimization platform will be deployed across 50+ treatment facilities, benefiting over 2 million people across the country.",
	},
	{
		date: "Dec 1, 2025",
		title: "Sustainability Report Released",
		excerpt:
			"Analysis shows 30% reduction in chemical waste through optimized dosing recommendations.",
		category: "Sustainability",
		content:
			"Our annual sustainability report reveals that facilities using our platform have achieved an average 30% reduction in chemical waste, 15% reduction in energy consumption, and 25% improvement in water quality consistency metrics.",
	},
	{
		date: "Nov 20, 2025",
		title: "Advanced Lime Dosing Algorithm Developed",
		excerpt:
			"New algorithm balances pH and alkalinity with unprecedented precision for stable drinking water.",
		category: "Technology",
		content:
			"Our engineering team has developed an advanced algorithm for lime dosing optimization that uses real-time water quality data to maintain optimal pH and alkalinity levels. Initial testing shows a 40% improvement in pH stability compared to traditional methods.",
	},
	{
		date: "Nov 5, 2025",
		title: "Recognition from Water Quality Association",
		excerpt:
			"Platform receives innovation award for explainable AI in water treatment.",
		category: "Awards",
		content:
			"Our water quality identification platform has been recognized by the International Water Quality Association with their 2025 Innovation Award. The award acknowledges our commitment to using explainable AI and LIME technology to make water treatment decisions transparent and trustworthy.",
	},
	{
		date: "Oct 15, 2025",
		title: "API Integration Guide Published",
		excerpt:
			"Comprehensive documentation now available for enterprise customers to integrate our models.",
		category: "Documentation",
		content:
			"We have published a comprehensive API integration guide and technical documentation for enterprise customers. The guide includes code examples, authentication details, and best practices for integrating our models into existing water management systems.",
	},
];

export default function News() {
	const [selectedCategory, setSelectedCategory] = useState("All");
	const categories = [
		"All",
		"Research",
		"Policy",
		"Training",
		"Partnerships",
		"Sustainability",
		"Technology",
		"Awards",
		"Documentation",
	];

	const filteredNews =
		selectedCategory === "All"
			? allNews
			: allNews.filter((article) => article.category === selectedCategory);

	return (
		<div className="min-h-screen bg-white dark:bg-black">
			{/* Hero Section */}
			<section className="px-6 py-20 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-black">
				<div className="mx-auto max-w-4xl text-center">
					<motion.div
						initial={{ opacity: 0, y: -30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
					>
						<h1 className="mb-6 text-5xl font-extrabold text-black dark:text-white sm:text-6xl">
							News & Updates
						</h1>
						<p className="text-xl text-zinc-700 dark:text-zinc-300">
							Latest developments in water quality research and industry
							insights
						</p>
					</motion.div>
				</div>
			</section>

			{/* Filter Section */}
			<section className="px-6 py-12 border-b border-zinc-200 dark:border-zinc-700">
				<div className="mx-auto max-w-5xl">
					<h3 className="mb-6 text-lg font-semibold text-black dark:text-white">
						Filter by Category
					</h3>
					<div className="flex flex-wrap gap-3">
						{categories.map((category) => (
							<motion.button
								key={category}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => setSelectedCategory(category)}
								className={`rounded-full px-6 py-2 font-medium transition-all ${
									selectedCategory === category
										? "bg-blue-600 text-white"
										: "border-2 border-zinc-300 text-zinc-700 hover:border-blue-600 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-blue-500"
								}`}
							>
								{category}
							</motion.button>
						))}
					</div>
				</div>
			</section>

			{/* News Grid */}
			<section className="px-6 py-20">
				<div className="mx-auto max-w-5xl">
					{filteredNews.length > 0 ? (
						<div className="space-y-8">
							{filteredNews.map((article, idx) => (
								<MotionSection key={idx}>
									<motion.article
										whileHover={{ y: -4 }}
										className="overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:hover:shadow-2xl"
									>
										<div className="p-8">
											<div className="mb-4 flex items-center justify-between">
												<span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
													{article.category}
												</span>
												<span className="text-sm text-zinc-500 dark:text-zinc-400">
													{article.date}
												</span>
											</div>
											<h2 className="mb-3 text-2xl font-bold text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
												{article.title}
											</h2>
											<p className="mb-4 text-zinc-700 dark:text-zinc-300">
												{article.excerpt}
											</p>
											<p className="mb-6 text-zinc-600 dark:text-zinc-400">
												{article.content}
											</p>
											<button className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
												Read Full Article →
											</button>
										</div>
									</motion.article>
								</MotionSection>
							))}
						</div>
					) : (
						<MotionSection className="text-center py-12">
							<p className="text-lg text-zinc-600 dark:text-zinc-400">
								No articles found in this category. Please try another filter.
							</p>
						</MotionSection>
					)}
				</div>
			</section>

			{/* Newsletter Section */}
			<section className="px-6 py-20 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
				<div className="mx-auto max-w-2xl text-center">
					<MotionSection>
						<h2 className="mb-4 text-3xl font-bold text-black dark:text-white">
							Stay Updated
						</h2>
						<p className="mb-8 text-zinc-700 dark:text-zinc-300">
							Subscribe to our newsletter to receive the latest water quality
							research and industry insights.
						</p>
						<div className="flex flex-col gap-3 sm:flex-row">
							<input
								type="email"
								placeholder="Enter your email"
								className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
							/>
							<button className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700">
								Subscribe
							</button>
						</div>
					</MotionSection>
				</div>
			</section>
		</div>
	);
}
