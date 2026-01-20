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

export default function About() {
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
							About Us
						</h1>
						<p className="text-xl text-zinc-700 dark:text-zinc-300">
							Dedicated to revolutionizing water quality management in Sri Lanka
						</p>
					</motion.div>
				</div>
			</section>

			{/* Mission Section */}
			<section className="px-6 py-20">
				<div className="mx-auto max-w-4xl">
					<MotionSection className="mb-12">
						<h2 className="mb-6 text-4xl font-extrabold text-black dark:text-white">
							Our Mission
						</h2>
						<p className="mb-4 text-lg text-zinc-700 dark:text-zinc-300">
							We are committed to ensuring access to clean, reliable drinking
							water for every community in Sri Lanka. Through cutting-edge
							machine learning and collaborative partnerships, we optimize water
							treatment processes to protect public health and environmental
							sustainability.
						</p>
						<p className="text-lg text-zinc-700 dark:text-zinc-300">
							Our platform brings together water quality experts, innovative
							technologists, and dedicated institutions united by a shared
							vision of transforming water treatment through data-driven
							insights.
						</p>
					</MotionSection>

					<MotionSection className="mb-12">
						<h2 className="mb-6 text-4xl font-extrabold text-black dark:text-white">
							Why We Exist
						</h2>
						<div className="space-y-4 text-lg text-zinc-700 dark:text-zinc-300">
							<p>
								<strong className="text-black dark:text-white">
									Water is Life:
								</strong>{" "}
								Access to clean water is fundamental to human health,
								development, and dignity. Yet millions lack this basic right.
							</p>
							<p>
								<strong className="text-black dark:text-white">
									Precision Matters:
								</strong>{" "}
								Traditional water treatment relies on outdated methods. Modern
								AI can optimize every step, reducing costs and improving safety.
							</p>
							<p>
								<strong className="text-black dark:text-white">
									Explainability is Key:
								</strong>{" "}
								We don't just predict—we explain. Using LIME technology,
								operators understand why our models make specific
								recommendations.
							</p>
						</div>
					</MotionSection>

					<MotionSection>
						<h2 className="mb-6 text-4xl font-extrabold text-black dark:text-white">
							Our Values
						</h2>
						<div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
							{[
								{
									title: "Transparency",
									desc: "All our methods, data, and models are built on principles of transparency and scientific rigor.",
								},
								{
									title: "Excellence",
									desc: "We pursue the highest standards in accuracy, reliability, and user experience.",
								},
								{
									title: "Community-Focused",
									desc: "Our solutions are designed with input from water treatment operators and communities.",
								},
								{
									title: "Sustainability",
									desc: "We optimize for both immediate water safety and long-term environmental health.",
								},
							].map((value, idx) => (
								<MotionSection key={idx}>
									<div className="rounded-lg border border-zinc-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 dark:border-zinc-700 dark:from-blue-950/30 dark:to-cyan-950/30">
										<h3 className="mb-2 text-xl font-bold text-black dark:text-white">
											{value.title}
										</h3>
										<p className="text-zinc-700 dark:text-zinc-300">
											{value.desc}
										</p>
									</div>
								</MotionSection>
							))}
						</div>
					</MotionSection>
				</div>
			</section>

			{/* Team Section */}
			<section className="px-6 py-20 bg-zinc-50 dark:bg-zinc-900/20">
				<div className="mx-auto max-w-4xl">
					<MotionSection className="mb-12 text-center">
						<h2 className="mb-4 text-4xl font-extrabold text-black dark:text-white">
							Our Team
						</h2>
						<p className="text-lg text-zinc-600 dark:text-zinc-400">
							Water quality experts, machine learning engineers, and domain
							specialists
						</p>
					</MotionSection>

					<div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
						{[
							{
								role: "Water Quality Experts",
								desc: "Decades of field experience in water treatment and safety protocols",
							},
							{
								role: "ML Engineers",
								desc: "Building predictive models with interpretable AI and LIME technology",
							},
							{
								role: "Data Scientists",
								desc: "Analyzing real-world water quality data to improve model accuracy",
							},
							{
								role: "Community Liaisons",
								desc: "Ensuring our solutions meet the needs of water operators and communities",
							},
						].map((member, idx) => (
							<MotionSection key={idx}>
								<div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
									<h3 className="mb-2 text-lg font-bold text-black dark:text-white">
										{member.role}
									</h3>
									<p className="text-zinc-600 dark:text-zinc-400">
										{member.desc}
									</p>
								</div>
							</MotionSection>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="px-6 py-20">
				<div className="mx-auto max-w-4xl text-center">
					<MotionSection>
						<h2 className="mb-6 text-3xl font-extrabold text-black dark:text-white">
							Join Our Mission
						</h2>
						<p className="mb-8 text-lg text-zinc-700 dark:text-zinc-300">
							Together, we can transform water treatment and ensure clean water
							for all.
						</p>
						<div className="flex flex-wrap justify-center gap-4">
							<a
								href="/contact"
								className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg"
							>
								Get in Touch
							</a>
							<a
								href="/"
								className="inline-flex items-center rounded-lg border-2 border-zinc-300 px-8 py-4 text-base font-semibold text-zinc-900 transition-all hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900"
							>
								Try the Model
							</a>
						</div>
					</MotionSection>
				</div>
			</section>
		</div>
	);
}
