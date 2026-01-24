"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
	ComposedChart,
	Line,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";

const MotionSection = ({ children, className = "" }) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
			className={className}
		>
			{children}
		</motion.div>
	);
};

export default function ManualAlumDosingPage() {
	const [formData, setFormData] = useState({
		rawWaterPH: "",
		rawWaterTurbidity: "",
		rawWaterConductivity: "",
	});

	const [predictions, setPredictions] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const chartRef = useRef(null);

	// Handle form input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// Handle form submission and predictions
	const handlePredict = async (e) => {
		e.preventDefault();
		setError("");

		// Validation
		if (
			!formData.rawWaterPH ||
			!formData.rawWaterTurbidity ||
			!formData.rawWaterConductivity
		) {
			setError("Please fill in all fields");
			return;
		}

		setLoading(true);

		try {
			// Call backend API for alum dose prediction
			const response = await axios.post(
				"http://localhost:5000/predict/alum-dose",
				{
					raw_water_ph: parseFloat(formData.rawWaterPH),
					raw_water_turbidity: parseFloat(formData.rawWaterTurbidity),
					raw_water_conductivity: parseFloat(formData.rawWaterConductivity),
				}
			);

			// Generate chart data showing dose vs turbidity trends
			const doseRange = Array.from({ length: 30 }, (_, i) => (i + 1) * 2); // 2-60 ppm
			const recommendedDose = response.data.recommended_dose;
			const settledTurbidity = response.data.settled_turbidity;
			const conformalInterval = response.data.conformal_interval;

			// Create trend data for visualization
			const chartData = doseRange.map((dose) => {
				// Simulate how turbidity improves with dose
				const improvementFactor = Math.min((dose / recommendedDose) * 1.2, 1.5);
				const predictedTurbidity = Math.max(
					settledTurbidity / improvementFactor,
					0.1
				);

				return {
					dose: dose,
					turbidity: parseFloat(predictedTurbidity.toFixed(2)),
					recommendedPoint:
						dose === Math.round(recommendedDose) ? settledTurbidity : null,
				};
			});

			setPredictions({
				recommendedDose: parseFloat(response.data.recommended_dose.toFixed(2)),
				settledTurbidity: parseFloat(
					response.data.settled_turbidity.toFixed(2)
				),
				conformalInterval: response.data.conformal_interval,
				rawInputs: { ...formData },
				chartData,
			});
		} catch (err) {
			console.error("Prediction error:", err);
			setError(
				err.response?.data?.message ||
					"Error generating predictions. Please try again."
			);
		} finally {
			setLoading(false);
		}
	};

	// Generate PDF report
	const generatePDFReport = async () => {
		if (!predictions) return;

		try {
			const pdf = new jsPDF();
			const pageWidth = pdf.internal.pageSize.getWidth();
			const pageHeight = pdf.internal.pageSize.getHeight();
			let yPosition = 20;

			// Title
			pdf.setFontSize(22);
			pdf.setTextColor(37, 99, 235); // Blue
			pdf.text("Manual Alum Dosing Report", pageWidth / 2, yPosition, {
				align: "center",
			});
			yPosition += 15;

			// Divider line
			pdf.setDrawColor(219, 234, 254);
			pdf.line(20, yPosition, pageWidth - 20, yPosition);
			yPosition += 10;

			// Input Section
			pdf.setFontSize(14);
			pdf.setTextColor(0, 0, 0);
			pdf.text("Raw Water Quality Inputs:", 20, yPosition);
			yPosition += 8;

			pdf.setFontSize(11);
			const inputData = [
				["Raw Water pH:", predictions.rawInputs.rawWaterPH],
				["Raw Water Turbidity (NTU):", predictions.rawInputs.rawWaterTurbidity],
				[
					"Raw Water Conductivity (µS/cm):",
					predictions.rawInputs.rawWaterConductivity,
				],
			];

			inputData.forEach(([label, value]) => {
				pdf.text(label, 25, yPosition);
				pdf.setTextColor(59, 130, 246);
				pdf.text(String(value), 100, yPosition);
				pdf.setTextColor(0, 0, 0);
				yPosition += 7;
			});

			yPosition += 5;

			// Predictions Section
			pdf.setFontSize(14);
			pdf.text("Alum Dosing Predictions:", 20, yPosition);
			yPosition += 8;

			pdf.setFontSize(11);
			const predictionData = [
				[
					"Recommended Alum Dose (ppm):",
					predictions.recommendedDose.toString(),
				],
				[
					"Predicted Settled Turbidity (NTU):",
					predictions.settledTurbidity.toString(),
				],
				[
					"Conformal Prediction Interval:",
					`[${predictions.conformalInterval.lower.toFixed(
						2
					)}, ${predictions.conformalInterval.upper.toFixed(2)}]`,
				],
			];

			predictionData.forEach(([label, value]) => {
				pdf.text(label, 25, yPosition);
				pdf.setTextColor(59, 130, 246);
				pdf.text(String(value), 100, yPosition);
				pdf.setTextColor(0, 0, 0);
				yPosition += 7;
			});

			// Alum Explanation
			yPosition += 8;
			pdf.setFontSize(12);
			pdf.setTextColor(0, 0, 0);
			pdf.text("Alum Dosing Explanation:", 20, yPosition);
			yPosition += 6;

			pdf.setFontSize(10);
			const explanation =
				`Alum (aluminum sulfate) is a coagulant used in water treatment to remove turbidity and suspended solids. ` +
				`The recommended dose of ${predictions.recommendedDose} ppm is optimal for your raw water quality parameters. ` +
				`This dose will reduce turbidity from ${predictions.rawInputs.rawWaterTurbidity} NTU to approximately ${predictions.settledTurbidity} NTU. ` +
				`The conformal prediction interval [${predictions.conformalInterval.lower.toFixed(
					2
				)}, ${predictions.conformalInterval.upper.toFixed(2)}] NTU ` +
				`provides a confidence range for the settled turbidity prediction.`;

			const wrappedText = pdf.splitTextToSize(explanation, pageWidth - 40);
			pdf.text(wrappedText, 25, yPosition);
			yPosition += wrappedText.length * 5 + 10;

			// Capture and add chart
			if (chartRef.current) {
				// New page for chart
				if (yPosition > pageHeight - 100) {
					pdf.addPage();
					yPosition = 20;
				}

				try {
					const canvas = await html2canvas(chartRef.current, {
						backgroundColor: "#ffffff",
						scale: 2,
					});

					const imgData = canvas.toDataURL("image/png");
					const chartWidth = pageWidth - 40;
					const chartHeight = (canvas.height / canvas.width) * chartWidth;

					pdf.text("Alum Dose vs Settled Turbidity Trend:", 20, yPosition);
					yPosition += 10;

					pdf.addImage(imgData, "PNG", 20, yPosition, chartWidth, chartHeight);
				} catch (chartErr) {
					console.error("Chart capture error:", chartErr);
				}
			}

			// Download PDF
			pdf.save(
				`Alum_Dosing_Report_${new Date().toISOString().slice(0, 10)}.pdf`
			);
		} catch (err) {
			console.error("PDF generation error:", err);
			alert("Error generating PDF report");
		}
	};

	return (
		<div className="min-h-screen bg-white dark:bg-black">
			{/* Header */}
			<section className="border-b border-zinc-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-12 dark:border-zinc-700 dark:from-blue-950 dark:to-cyan-950">
				<div className="mx-auto max-w-6xl">
					<h1 className="mb-2 text-4xl font-extrabold text-black dark:text-white">
						Manual Alum Dosing
					</h1>
					<p className="text-lg text-zinc-700 dark:text-zinc-300">
						Optimize alum dosage for efficient coagulation and flocculation
					</p>
				</div>
			</section>

			{/* Main Content */}
			<section className="px-6 py-12">
				<div className="mx-auto max-w-6xl">
					<div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
						{/* Form Section */}
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6 }}
							className="lg:col-span-1"
						>
							<div className="rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-900">
								<h2 className="mb-6 text-2xl font-bold text-black dark:text-white">
									Configuration
								</h2>

								<form onSubmit={handlePredict} className="space-y-5">
									{/* Raw Water pH */}
									<div>
										<label className="block text-sm font-medium text-zinc-900 dark:text-white">
											Raw Water pH
										</label>
										<input
											type="number"
											name="rawWaterPH"
											step="0.1"
											min="0"
											max="14"
											value={formData.rawWaterPH}
											onChange={handleInputChange}
											placeholder="e.g., 7.2"
											className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
										/>
									</div>

									{/* Raw Water Turbidity */}
									<div>
										<label className="block text-sm font-medium text-zinc-900 dark:text-white">
											Raw Water Turbidity (NTU)
										</label>
										<input
											type="number"
											name="rawWaterTurbidity"
											step="0.1"
											min="0"
											value={formData.rawWaterTurbidity}
											onChange={handleInputChange}
											placeholder="e.g., 5.5"
											className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
										/>
									</div>

									{/* Raw Water Conductivity */}
									<div>
										<label className="block text-sm font-medium text-zinc-900 dark:text-white">
											Raw Water Conductivity (µS/cm)
										</label>
										<input
											type="number"
											name="rawWaterConductivity"
											step="0.1"
											min="0"
											value={formData.rawWaterConductivity}
											onChange={handleInputChange}
											placeholder="e.g., 450"
											className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
										/>
									</div>

									{error && (
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
										>
											{error}
										</motion.div>
									)}

									<button
										type="submit"
										disabled={loading}
										className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
									>
										{loading ? "Predicting..." : "PREDICT ALUM DOSE"}
									</button>
								</form>

								{predictions && (
									<motion.button
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										onClick={generatePDFReport}
										className="mt-4 w-full rounded-lg border-2 border-blue-600 px-6 py-2 font-semibold text-blue-600 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20"
									>
										📥 Download Alum Report
									</motion.button>
								)}
							</div>
						</motion.div>

						{/* Results Section */}
						{predictions ? (
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.6 }}
								className="lg:col-span-2"
							>
								<div className="space-y-6">
									{/* Prediction Results Cards */}
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
										{/* Recommended Dose Card */}
										<motion.div
											whileHover={{ y: -4 }}
											className="rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 dark:border-blue-800 dark:from-blue-900/30 dark:to-cyan-900/30"
										>
											<p className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
												Recommended Alum Dose
											</p>
											<p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
												{predictions.recommendedDose}
											</p>
											<p className="text-sm text-zinc-600 dark:text-zinc-400">
												ppm
											</p>
										</motion.div>

										{/* Settled Turbidity Card */}
										<motion.div
											whileHover={{ y: -4 }}
											className="rounded-lg border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-teal-50 p-6 dark:border-cyan-800 dark:from-cyan-900/30 dark:to-teal-900/30"
										>
											<p className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
												Predicted Settled Turbidity
											</p>
											<p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
												{predictions.settledTurbidity}
											</p>
											<p className="text-sm text-zinc-600 dark:text-zinc-400">
												NTU
											</p>
										</motion.div>

										{/* Conformal Interval Card */}
										<motion.div
											whileHover={{ y: -4 }}
											className="rounded-lg border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-6 dark:border-emerald-800 dark:from-emerald-900/30 dark:to-green-900/30"
										>
											<p className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
												Conformal Interval
											</p>
											<p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
												[{predictions.conformalInterval.lower.toFixed(2)},{" "}
												{predictions.conformalInterval.upper.toFixed(2)}]
											</p>
											<p className="text-sm text-zinc-600 dark:text-zinc-400">
												NTU
											</p>
										</motion.div>
									</div>

									{/* Chart */}
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: 0.2 }}
										className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900"
										ref={chartRef}
									>
										<h3 className="mb-4 text-lg font-bold text-black dark:text-white">
											Alum Dose Sensitivity Curve
										</h3>
										<ResponsiveContainer width="100%" height={350}>
											<ComposedChart
												data={predictions.chartData}
												margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
											>
												<defs>
													<linearGradient
														id="colorTurbidity"
														x1="0"
														y1="0"
														x2="0"
														y2="1"
													>
														<stop
															offset="5%"
															stopColor="#3b82f6"
															stopOpacity={0.8}
														/>
														<stop
															offset="95%"
															stopColor="#3b82f6"
															stopOpacity={0}
														/>
													</linearGradient>
												</defs>
												<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
												<XAxis
													dataKey="dose"
													label={{
														value: "Alum Dose (ppm)",
														position: "insideBottom",
														offset: -5,
													}}
													stroke="#999"
												/>
												<YAxis
													label={{
														value: "Settled Turbidity (NTU)",
														angle: -90,
														position: "insideLeft",
													}}
													stroke="#999"
												/>
												<Tooltip
													contentStyle={{
														backgroundColor: "rgba(255, 255, 255, 0.95)",
														border: "1px solid #ccc",
														borderRadius: "8px",
													}}
													formatter={(value) =>
														typeof value === "number" ? value.toFixed(2) : value
													}
												/>
												<Legend />
												<Area
													type="monotone"
													dataKey="turbidity"
													stroke="#3b82f6"
													fillOpacity={1}
													fill="url(#colorTurbidity)"
													name="Turbidity Reduction"
												/>
												<Line
													type="monotone"
													dataKey="recommendedPoint"
													stroke="#ef4444"
													strokeWidth={2}
													dot={{ r: 6, fill: "#ef4444" }}
													name="Recommended Dose"
												/>
											</ComposedChart>
										</ResponsiveContainer>
									</motion.div>

									{/* Explanation */}
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: 0.3 }}
										className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900"
									>
										<h3 className="mb-4 text-lg font-bold text-black dark:text-white">
											Model Explanation (LIME)
										</h3>
										<div className="space-y-3 text-zinc-700 dark:text-zinc-300">
											<p>
												Alum (aluminum sulfate) is a widely used coagulant in
												water treatment to remove turbidity and suspended solids
												through a coagulation and flocculation process. Based on
												your raw water parameters with pH of{" "}
												{predictions.rawInputs.rawWaterPH} and turbidity of{" "}
												{predictions.rawInputs.rawWaterTurbidity} NTU, the model
												recommends{" "}
												<strong>{predictions.recommendedDose} ppm</strong> of
												alum dosage.
											</p>
											<p>
												At this dose, the alum will effectively reduce turbidity
												to approximately{" "}
												<strong>{predictions.settledTurbidity} NTU</strong>,
												which meets typical water quality standards for treated
												water.
											</p>
											<p>
												The conformal prediction interval [
												<strong>
													{predictions.conformalInterval.lower.toFixed(2)},{" "}
													{predictions.conformalInterval.upper.toFixed(2)}
												</strong>
												] NTU provides a 95% confidence range for the
												prediction, accounting for natural variations in water
												quality and treatment processes.
											</p>
										</div>
									</motion.div>

									{/* Generate Report Button */}
									<motion.button
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: 0.4 }}
										onClick={generatePDFReport}
										className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700"
									>
										📥 Generate Alum Report
									</motion.button>
								</div>
							</motion.div>
						) : (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.3 }}
								className="lg:col-span-2 flex items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 dark:border-zinc-600 dark:bg-zinc-900/50"
							>
								<div className="text-center">
									<p className="mb-2 text-lg font-semibold text-zinc-700 dark:text-zinc-300">
										📊 Results will appear here
									</p>
									<p className="text-zinc-600 dark:text-zinc-400">
										Fill in the input parameters and click &quot;PREDICT
										ALUM DOSE&quot; to generate predictions
									</p>
								</div>
							</motion.div>
						)}
					</div>
				</div>
			</section>
		</div>
	);
}
