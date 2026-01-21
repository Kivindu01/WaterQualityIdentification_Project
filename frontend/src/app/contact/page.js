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

export default function Contact() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});

	const [submitted, setSubmitted] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// Simulate form submission
		console.log("Form submitted:", formData);
		setSubmitted(true);
		setTimeout(() => {
			setFormData({ name: "", email: "", subject: "", message: "" });
			setSubmitted(false);
		}, 3000);
	};

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
							Contact Us
						</h1>
						<p className="text-xl text-zinc-700 dark:text-zinc-300">
							Have questions? We'd love to hear from you. Get in touch with our
							team.
						</p>
					</motion.div>
				</div>
			</section>

			{/* Contact Section */}
			<section className="px-6 py-20">
				<div className="mx-auto max-w-5xl">
					<div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
						{/* Contact Form */}
						<MotionSection>
							<div className="rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-900">
								<h2 className="mb-6 text-2xl font-bold text-black dark:text-white">
									Send us a Message
								</h2>

								{submitted ? (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="rounded-lg bg-green-50 p-6 dark:bg-green-900/20"
									>
										<p className="text-lg font-semibold text-green-700 dark:text-green-400">
											✓ Thank you! Your message has been sent successfully.
										</p>
										<p className="mt-2 text-zinc-600 dark:text-zinc-400">
											We'll get back to you as soon as possible.
										</p>
									</motion.div>
								) : (
									<form onSubmit={handleSubmit} className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-zinc-900 dark:text-white">
												Name
											</label>
											<input
												type="text"
												name="name"
												value={formData.name}
												onChange={handleChange}
												required
												className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
												placeholder="Your name"
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
												required
												className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
												placeholder="your@email.com"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-zinc-900 dark:text-white">
												Subject
											</label>
											<input
												type="text"
												name="subject"
												value={formData.subject}
												onChange={handleChange}
												required
												className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
												placeholder="Subject"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-zinc-900 dark:text-white">
												Message
											</label>
											<textarea
												name="message"
												value={formData.message}
												onChange={handleChange}
												required
												rows="5"
												className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
												placeholder="Your message"
											/>
										</div>

										<button
											type="submit"
											className="w-full rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-blue-700"
										>
											Send Message
										</button>
									</form>
								)}
							</div>
						</MotionSection>

						{/* Contact Info */}
						<MotionSection>
							<div className="space-y-8">
								<div>
									<h3 className="mb-4 text-2xl font-bold text-black dark:text-white">
										Get in Touch
									</h3>
									<p className="text-zinc-600 dark:text-zinc-400">
										We're here to help and answer any question you might have.
										Our team is ready to assist you.
									</p>
								</div>

								{[
									{
										title: "Email",
										value: "contact@waterquality.lk",
										icon: "✉️",
									},
									{
										title: "Phone",
										value: "+94 (0) 11 234 5678",
										icon: "📞",
									},
									{
										title: "Address",
										value: "123 Water Quality Lane, Colombo, Sri Lanka",
										icon: "📍",
									},
									{
										title: "Hours",
										value: "Mon - Fri: 9:00 AM - 6:00 PM (UTC+5:30)",
										icon: "🕐",
									},
								].map((contact, idx) => (
									<div key={idx} className="flex items-start gap-4">
										<div className="text-3xl">{contact.icon}</div>
										<div>
											<h4 className="font-semibold text-black dark:text-white">
												{contact.title}
											</h4>
											<p className="text-zinc-600 dark:text-zinc-400">
												{contact.value}
											</p>
										</div>
									</div>
								))}

								<div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
									<h4 className="mb-2 font-semibold text-black dark:text-white">
										Quick Response
									</h4>
									<p className="text-sm text-zinc-600 dark:text-zinc-400">
										We typically respond to inquiries within 24 hours during
										business days.
									</p>
								</div>
							</div>
						</MotionSection>
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="px-6 py-20 bg-zinc-50 dark:bg-zinc-900/20">
				<div className="mx-auto max-w-4xl">
					<MotionSection className="mb-12 text-center">
						<h2 className="mb-4 text-4xl font-extrabold text-black dark:text-white">
							Frequently Asked Questions
						</h2>
					</MotionSection>

					<div className="space-y-6">
						{[
							{
								q: "How can I use the water quality forecasting models?",
								a: "Visit our Home page and click 'Try the Model' to access our interactive platform. Our models are designed for water treatment operators and quality managers.",
							},
							{
								q: "Do you offer API access?",
								a: "Yes, we provide API access for enterprise customers. Please contact our team to discuss integration options.",
							},
							{
								q: "How accurate are your predictions?",
								a: "Our models achieve 95%+ accuracy on raw water quality forecasting with uncertainty quantification. Performance varies by parameter and location.",
							},
							{
								q: "Can you help us with water treatment at our facility?",
								a: "We're always interested in partnerships and pilot programs. Reach out to discuss your specific needs and requirements.",
							},
						].map((faq, idx) => (
							<MotionSection key={idx}>
								<div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
									<h4 className="mb-2 font-bold text-black dark:text-white">
										{faq.q}
									</h4>
									<p className="text-zinc-600 dark:text-zinc-400">{faq.a}</p>
								</div>
							</MotionSection>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
