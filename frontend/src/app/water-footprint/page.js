"use client";

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

export default function WaterFootprint() {
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
							Water Footprint
						</h1>
						<p className="text-xl text-zinc-700 dark:text-zinc-300">
							Understanding and optimizing water usage for a sustainable future
						</p>
					</motion.div>
				</div>
			</section>

			{/* Definition Section */}
			<section className="px-6 py-20">
				<div className="mx-auto max-w-4xl">
					<MotionSection className="mb-12">
						<h2 className="mb-6 text-4xl font-extrabold text-black dark:text-white">
							What is a Water Footprint?
						</h2>
						<p className="mb-4 text-lg text-zinc-700 dark:text-zinc-300">
							A water footprint is a measure of humanity's freshwater
							consumption. It represents the amount of water used to produce the
							goods and services we consume, or consumed by a business,
							individual, or community.
						</p>
						<p className="text-lg text-zinc-700 dark:text-zinc-300">
							The water footprint comprises three components: blue water
							(freshwater from surface and groundwater), green water
							(rainwater), and grey water (freshwater required to assimilate
							pollutants).
						</p>
					</MotionSection>

					<MotionSection>
						<h2 className="mb-6 text-4xl font-extrabold text-black dark:text-white">
							Components of Water Footprint
						</h2>
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
							{[
								{
									title: "Blue Water",
									color: "from-blue-400 to-blue-600",
									desc: "Freshwater from rivers, lakes, and aquifers used in production",
									icon: "💧",
								},
								{
									title: "Green Water",
									color: "from-green-400 to-green-600",
									desc: "Rainwater used in agricultural and industrial processes",
									icon: "🌧️",
								},
								{
									title: "Grey Water",
									color: "from-slate-400 to-slate-600",
									desc: "Freshwater needed to dilute pollutants and maintain quality",
									icon: "⚠️",
								},
							].map((component, idx) => (
								<MotionSection key={idx}>
									<div
										className={`rounded-lg bg-gradient-to-br ${component.color} p-6 text-white`}
									>
										<div className="mb-3 text-4xl">{component.icon}</div>
										<h3 className="mb-2 text-xl font-bold">
											{component.title}
										</h3>
										<p className="text-blue-50">{component.desc}</p>
									</div>
								</MotionSection>
							))}
						</div>
					</MotionSection>
				</div>
			</section>

			{/* Statistics Section */}
			<section className="px-6 py-20 bg-zinc-50 dark:bg-zinc-900/20">
				<div className="mx-auto max-w-4xl">
					<MotionSection className="mb-12 text-center">
						<h2 className="mb-4 text-4xl font-extrabold text-black dark:text-white">
							Global Water Footprint Facts
						</h2>
					</MotionSection>

					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						{[
							{
								stat: "70%",
								label: "of global freshwater is used in agriculture",
								icon: "🌾",
							},
							{
								stat: "2,300",
								label: "liters of water to produce 1 kg of cotton",
								icon: "🎽",
							},
							{
								stat: "15,000",
								label: "liters of water to produce 1 kg of beef",
								icon: "🥩",
							},
							{
								stat: "1,800",
								label: "liters of water needed per person daily on average",
								icon: "👤",
							},
						].map((fact, idx) => (
							<MotionSection key={idx}>
								<div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
									<div className="mb-3 text-4xl">{fact.icon}</div>
									<p className="mb-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
										{fact.stat}
									</p>
									<p className="text-zinc-700 dark:text-zinc-300">
										{fact.label}
									</p>
								</div>
							</MotionSection>
						))}
					</div>
				</div>
			</section>

			{/* Water Treatment Impact */}
			<section className="px-6 py-20">
				<div className="mx-auto max-w-4xl">
					<MotionSection className="mb-12">
						<h2 className="mb-6 text-4xl font-extrabold text-black dark:text-white">
							Reducing Water Footprint Through Smart Treatment
						</h2>
						<p className="text-lg text-zinc-700 dark:text-zinc-300">
							Our water quality optimization platform helps treatment facilities
							reduce their water footprint by:
						</p>
					</MotionSection>

					<div className="space-y-6">
						{[
							{
								title: "Optimized Dosing",
								desc: "Precise predictions ensure exact chemical dosing, reducing waste and harmful byproducts.",
								icon: "🎯",
							},
							{
								title: "Predictive Maintenance",
								desc: "Forecasting water quality parameters helps prevent equipment failures and water loss.",
								icon: "🔧",
							},
							{
								title: "Energy Efficiency",
								desc: "Better treatment planning reduces energy consumption in the water treatment process.",
								icon: "⚡",
							},
							{
								title: "Reduced Contamination",
								desc: "Improved water quality monitoring prevents contamination and the need for reprocessing.",
								icon: "✅",
							},
							{
								title: "Data-Driven Decisions",
								desc: "ML-powered insights enable operators to make informed choices that conserve water.",
								icon: "📊",
							},
							{
								title: "Compliance Assurance",
								desc: "Real-time monitoring ensures consistent adherence to water quality standards.",
								icon: "📋",
							},
						].map((benefit, idx) => (
							<MotionSection key={idx}>
								<div className="flex items-start gap-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
									<div className="flex-shrink-0 text-3xl">{benefit.icon}</div>
									<div>
										<h3 className="mb-2 text-lg font-bold text-black dark:text-white">
											{benefit.title}
										</h3>
										<p className="text-zinc-600 dark:text-zinc-400">
											{benefit.desc}
										</p>
									</div>
								</div>
							</MotionSection>
						))}
					</div>
				</div>
			</section>

			{/* Sri Lanka Context */}
			<section className="px-6 py-20 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-black">
				<div className="mx-auto max-w-4xl">
					<MotionSection className="mb-8 text-center">
						<h2 className="mb-4 text-4xl font-extrabold text-black dark:text-white">
							Water Footprint in Sri Lanka
						</h2>
					</MotionSection>

					<MotionSection className="rounded-lg border-2 border-blue-300 bg-blue-50 p-8 dark:border-blue-700 dark:bg-blue-900/20">
						<div className="space-y-4 text-lg text-zinc-700 dark:text-zinc-300">
							<p>
								<strong className="text-black dark:text-white">
									Island Nation Challenge:
								</strong>{" "}
								As an island nation, Sri Lanka faces unique water management
								challenges. With a population of 22 million and growing
								industrial demands, optimizing water usage is critical.
							</p>
							<p>
								<strong className="text-black dark:text-white">
									Agricultural Dominance:
								</strong>{" "}
								Agriculture accounts for ~80% of freshwater withdrawal in Sri
								Lanka, particularly for rice cultivation and tea plantations.
							</p>
							<p>
								<strong className="text-black dark:text-white">
									Climate Variability:
								</strong>{" "}
								Monsoon patterns and climate change impact water availability,
								making predictive treatment systems essential.
							</p>
							<p>
								<strong className="text-black dark:text-white">
									Our Role:
								</strong>{" "}
								By providing accurate water quality forecasting and
								optimization, we enable facilities across Sri Lanka to conserve
								water while maintaining safety and quality standards.
							</p>
						</div>
					</MotionSection>
				</div>
			</section>

			{/* Action Section */}
			<section className="px-6 py-20">
				<div className="mx-auto max-w-4xl text-center">
					<MotionSection>
						<h2 className="mb-6 text-3xl font-extrabold text-black dark:text-white">
							Start Reducing Your Water Footprint Today
						</h2>
						<p className="mb-8 text-lg text-zinc-700 dark:text-zinc-300">
							Learn how our platform can help your facility optimize water usage
							and improve treatment efficiency.
						</p>
						<div className="flex flex-wrap justify-center gap-4">
							<a
								href="/"
								className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg"
							>
								Try the Model
							</a>
							<a
								href="/contact"
								className="inline-flex items-center rounded-lg border-2 border-zinc-300 px-8 py-4 text-base font-semibold text-zinc-900 transition-all hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900"
							>
								Contact Us
							</a>
						</div>
					</MotionSection>
				</div>
			</section>
		</div>
	);
}
