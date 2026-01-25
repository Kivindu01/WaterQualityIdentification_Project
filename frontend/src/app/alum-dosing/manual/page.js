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
import { API } from "@/lib/api";

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

	const [advancedFormData, setAdvancedFormData] = useState({
		rawWaterTurbidity: "",
		rawWaterPH: "",
		conductivity: "",
		rawWaterFlow: "",
		dChamberFlow: "",
		aeratorFlow: "",
	});

	const [predictions, setPredictions] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [classificationResult, setClassificationResult] = useState(null);
	const chartRef = useRef(null);

	// Handle form input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		setClassificationResult(null);
		setPredictions(null);
	};

	// Handle advanced form input changes
	const handleAdvancedInputChange = (e) => {
		const { name, value } = e.target;
		setAdvancedFormData((prev) => ({
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
			// First, call classification API
			const classificationData = await API.classifyWaterQuality(
				formData.rawWaterPH,
				formData.rawWaterTurbidity,
				formData.rawWaterConductivity,
			);

			setClassificationResult(classificationData);

			// If ABNORMAL, show warning and require advanced fields
			if (classificationData.classification === "ABNORMAL") {
				setLoading(false);
				setPredictions(null);
				return;
			}

			// If NORMAL, proceed with alum dose prediction
			const response = await API.predictAlumDoseBasic(
				formData.rawWaterPH,
				formData.rawWaterTurbidity,
				formData.rawWaterConductivity,
			);

			// Extract data from new response structure
			const responseData = response.data;
			const predictedTurbidityValue = responseData.predicted_turbidity || 0;
			const confidenceInterval = responseData.confidence_interval;

			// Generate chart data showing dose vs turbidity trends
			const doseRange = Array.from({ length: 30 }, (_, i) => (i + 1) * 2);
			const chartData = doseRange.map((dose) => {
				const improvementFactor = Math.min(
					(dose / (predictedTurbidityValue || 1)) * 1.2,
					1.5,
				);
				const predictedTurbidity = Math.max(
					predictedTurbidityValue / improvementFactor,
					0.1,
				);

				return {
					dose: dose,
					turbidity: parseFloat(predictedTurbidity.toFixed(2)),
					recommendedPoint:
						dose === Math.round(predictedTurbidityValue)
							? predictedTurbidityValue
							: null,
				};
			});

			setPredictions({
				predictedTurbidity: parseFloat(
					responseData.predicted_turbidity.toFixed(2),
				),
				confidenceInterval: confidenceInterval,
				rawInputs: { ...formData },
				chartData,
			});
		} catch (err) {
			console.error("Prediction error:", err);
			setError(
				err.message || "Error generating predictions. Please try again.",
			);
		} finally {
			setLoading(false);
		}
	};

	// Handle advanced prediction (when ABNORMAL is detected)
	const handleAdvancedPredict = async (e) => {
		e.preventDefault();
		setError("");

		// Validation for all advanced fields
		if (
			!advancedFormData.rawWaterTurbidity ||
			!advancedFormData.rawWaterPH ||
			!advancedFormData.conductivity ||
			!advancedFormData.rawWaterFlow ||
			!advancedFormData.dChamberFlow ||
			!advancedFormData.aeratorFlow
		) {
			setError("Please fill in all advanced fields");
			return;
		}

		setLoading(true);

		try {
			// Call advanced prediction API (6-parameter model)
			const response = await API.predictAlumDoseAdvanced(
				advancedFormData.rawWaterPH,
				advancedFormData.rawWaterTurbidity,
				advancedFormData.conductivity,
				advancedFormData.rawWaterFlow,
				advancedFormData.dChamberFlow,
				advancedFormData.aeratorFlow,
			);

			// Extract data from new response structure
			const responseData = response.data;
			const predictedDose = responseData.predicted_alum_dosage_ppm;
			const doseRange = responseData.dose_range_ppm;

			// Generate chart data
			const doseArray = Array.from({ length: 30 }, (_, i) => (i + 1) * 2);
			const chartData = doseArray.map((dose) => {
				const improvementFactor = Math.min(
					(dose / (predictedDose || 1)) * 1.2,
					1.5,
				);
				const predictedTurbidity = Math.max(
					parseFloat(advancedFormData.rawWaterTurbidity) / improvementFactor,
					0.1,
				);

				return {
					dose: dose,
					turbidity: parseFloat(predictedTurbidity.toFixed(2)),
					recommendedPoint:
						dose === Math.round(predictedDose) ? predictedTurbidity : null,
				};
			});

			setPredictions({
				predictedAlumDose: parseFloat(predictedDose.toFixed(2)),
				doseRange: doseRange,
				advancedInputs: { ...advancedFormData },
				chartData,
				isAdvanced: true,
				shapExplanation: responseData.shap_explanation,
			});

			setClassificationResult(null);
		} catch (err) {
			console.error("Advanced prediction error:", err);
			setError(
				err.message || "Error in advanced prediction. Please try again.",
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
						2,
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
					2,
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
				`Alum_Dosing_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
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
										className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50 "
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

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.3 }}
								className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900 mt-6"
							>
								<h3 className="mb-4 text-lg font-bold text-black dark:text-white">
									{predictions?.isAdvanced
										? "Advanced Analysis Explanation (SHAP)"
										: "Model Explanation (LIME)"}
								</h3>
								<div className="space-y-3 text-zinc-700 dark:text-zinc-300">
									{predictions?.isAdvanced ? (
										<>
											<p>
												This advanced 6-parameter model provides a more precise
												alum dosage prediction by incorporating operational flow
												rates alongside raw water quality parameters. The model
												analyzed your inputs: Turbidity of{" "}
												<strong>
													{predictions?.advancedInputs.rawWaterTurbidity} NTU
												</strong>
												, pH of{" "}
												<strong>
													{predictions?.advancedInputs.rawWaterPH}
												</strong>
												, Conductivity of{" "}
												<strong>
													{predictions?.advancedInputs.conductivity} µS/cm
												</strong>
												, and flow rates (Raw Water:{" "}
												<strong>
													{predictions?.advancedInputs.rawWaterFlow} M³/H
												</strong>
												, D-Chamber:{" "}
												<strong>
													{predictions?.advancedInputs.dChamberFlow} L/M
												</strong>
												, Aerator:{" "}
												<strong>
													{predictions?.advancedInputs.aeratorFlow} L/M
												</strong>
												).
											</p>
											<p>
												The recommended alum dosage is{" "}
												<strong>{predictions?.predictedAlumDose} ppm</strong>,
												with a dose range of [
												<strong>
													{predictions?.doseRange.min.toFixed(2)},{" "}
													{predictions?.doseRange.max.toFixed(2)}
												</strong>
												] ppm. This range accounts for system variability and
												operational conditions.
											</p>
											<p>
												The SHAP explanation reveals the feature importance in
												the model's decision, showing which parameters had the
												greatest impact on the dosage recommendation. This
												transparency helps operators understand the driving
												factors behind the prediction.
											</p>
										</>
									) : (
										<>
											<p>
												Alum (aluminum sulfate) is a widely used coagulant in
												water treatment to remove turbidity and suspended solids
												through a coagulation and flocculation process. Based on
												your raw water parameters with pH of{" "}
												<strong>{predictions?.rawInputs.rawWaterPH}</strong> and
												turbidity of{" "}
												<strong>
													{predictions?.rawInputs.rawWaterTurbidity} NTU
												</strong>
												, this model predicts a turbidity level of{" "}
												<strong>{predictions?.predictedTurbidity} NTU</strong>{" "}
												after treatment.
											</p>
											<p>
												The confidence interval [{" "}
												<strong>
													{predictions?.confidenceInterval.lower.toFixed(2)},{" "}
													{predictions?.confidenceInterval.upper.toFixed(2)}
												</strong>
												] NTU provides a 95% confidence range for the
												prediction, accounting for natural variations in water
												quality and treatment processes.
											</p>
											<p>
												This standard 3-parameter model is suitable for routine
												predictions when water quality conditions are within
												normal operating ranges. For abnormal conditions or when
												higher precision is required, consider using the
												advanced 6-parameter model.
											</p>
										</>
									)}
								</div>
							</motion.div>
						</motion.div>

						{predictions && (
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.6 }}
								className="lg:col-span-2"
							>
								<div className="space-y-6">
									{/* Recommendation Card */}
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										className="rounded-lg border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 dark:border-blue-800 dark:from-blue-900/30 dark:to-cyan-900/30"
									>
										<div className="text-center">
											<p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
												{predictions?.isAdvanced
													? "Advanced Model Recommendation"
													: "Recommended Alum Dosage"}
											</p>
											<p className="mt-4 text-5xl font-bold text-blue-700 dark:text-blue-300">
												{predictions?.isAdvanced
													? predictions?.predictedAlumDose
													: predictions?.predictedTurbidity}
											</p>
											<p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
												{predictions?.isAdvanced ? "ppm" : "NTU"}
											</p>
											<p className="mt-4 border-t border-blue-200 pt-4 text-sm text-zinc-600 dark:text-zinc-300">
												{predictions?.isAdvanced
													? `Target: Alum dosage range [${predictions?.doseRange.min.toFixed(2)}, ${predictions?.doseRange.max.toFixed(2)}] ppm`
													: "Target: Settled water turbidity ≤ 5 NTU"}
											</p>
											{!predictions?.isAdvanced && (
												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													transition={{ delay: 0.3 }}
													className="mt-3 inline-block rounded-full bg-green-100 px-4 py-2 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400"
												>
													✓ CONFIDENT: Use {predictions?.predictedTurbidity} NTU
													(meets target)
												</motion.div>
											)}
										</div>
									</motion.div>

									{/* Predicted Turbidity Card */}
									{!predictions?.isAdvanced && (
										<motion.div
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.1 }}
											className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900"
										>
											<p className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
												Predicted Settled Water Turbidity
											</p>
											<p className="mt-4 text-center text-4xl font-bold text-zinc-800 dark:text-zinc-100">
												{predictions?.predictedTurbidity} NTU
											</p>
											<p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-300">
												Confidence Range:
											</p>
											<p className="text-center text-lg font-semibold text-blue-600 dark:text-blue-400">
												{predictions?.confidenceInterval.lower.toFixed(2)} -{" "}
												{predictions?.confidenceInterval.upper.toFixed(2)} NTU
											</p>
										</motion.div>
									)}

									{/* Analysis Based On */}
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.2 }}
										className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900"
									>
										<p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
											Analysis Based On
										</p>
										<div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
											{predictions?.isAdvanced ? (
												<>
													<div>
														<p className="text-xs text-zinc-500 dark:text-zinc-400">
															Raw Water Turbidity
														</p>
														<p className="mt-1 font-semibold text-zinc-900 dark:text-white">
															{predictions?.advancedInputs.rawWaterTurbidity}{" "}
															NTU
														</p>
													</div>
													<div>
														<p className="text-xs text-zinc-500 dark:text-zinc-400">
															Raw Water pH
														</p>
														<p className="mt-1 font-semibold text-zinc-900 dark:text-white">
															{predictions?.advancedInputs.rawWaterPH}
														</p>
													</div>
													<div>
														<p className="text-xs text-zinc-500 dark:text-zinc-400">
															Conductivity
														</p>
														<p className="mt-1 font-semibold text-zinc-900 dark:text-white">
															{predictions?.advancedInputs.conductivity} µS/cm
														</p>
													</div>
													<div>
														<p className="text-xs text-zinc-500 dark:text-zinc-400">
															Raw Water Flow
														</p>
														<p className="mt-1 font-semibold text-zinc-900 dark:text-white">
															{predictions?.advancedInputs.rawWaterFlow} M³/H
														</p>
													</div>
													<div>
														<p className="text-xs text-zinc-500 dark:text-zinc-400">
															D-Chamber Flow
														</p>
														<p className="mt-1 font-semibold text-zinc-900 dark:text-white">
															{predictions?.advancedInputs.dChamberFlow} L/M
														</p>
													</div>
													<div>
														<p className="text-xs text-zinc-500 dark:text-zinc-400">
															Aerator Flow
														</p>
														<p className="mt-1 font-semibold text-zinc-900 dark:text-white">
															{predictions?.advancedInputs.aeratorFlow} L/M
														</p>
													</div>
												</>
											) : (
												<>
													<div>
														<p className="text-xs text-zinc-500 dark:text-zinc-400">
															Raw Water Turbidity
														</p>
														<p className="mt-1 font-semibold text-zinc-900 dark:text-white">
															{predictions?.rawInputs.rawWaterTurbidity} NTU
														</p>
													</div>
													<div>
														<p className="text-xs text-zinc-500 dark:text-zinc-400">
															Raw Water pH
														</p>
														<p className="mt-1 font-semibold text-zinc-900 dark:text-white">
															{predictions?.rawInputs.rawWaterPH}
														</p>
													</div>
													<div>
														<p className="text-xs text-zinc-500 dark:text-zinc-400">
															Raw Water Conductivity
														</p>
														<p className="mt-1 font-semibold text-zinc-900 dark:text-white">
															{predictions?.rawInputs.rawWaterConductivity}{" "}
															µS/cm
														</p>
													</div>
												</>
											)}
										</div>
									</motion.div>

									{/* Chart */}
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: 0.3 }}
										className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900"
										ref={chartRef}
									>
										<h3 className="mb-4 text-lg font-bold text-black dark:text-white">
											Alum Dose Sensitivity Curve
										</h3>
										<ResponsiveContainer width="100%" height={350}>
											<ComposedChart
												data={predictions?.chartData}
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
								</div>
							</motion.div>
						)}
						{/* Results Section */}
						{classificationResult ? (
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.6 }}
								className="lg:col-span-2"
							>
								<div className="space-y-6">
									{/* ABNORMAL Classification Warning */}
									{classificationResult &&
										classificationResult.classification === "ABNORMAL" && (
											<motion.div
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												className="rounded-lg border-l-4 border-red-600 bg-red-50 p-4 dark:bg-red-900/20"
											>
												<div className="flex items-start gap-3">
													<span className="text-2xl">●</span>
													<div className="flex-1">
														<h3 className="font-bold text-red-700 dark:text-red-400">
															ABNORMAL SPIKE DETECTED
														</h3>
														<p className="mt-2 text-sm text-red-600 dark:text-red-300">
															Probability of Abnormality
														</p>
														<div className="mt-1 flex items-center gap-2">
															<div className="h-2 w-32 bg-red-300 rounded">
																<div
																	className="h-full bg-red-600 rounded"
																	style={{
																		width: `${Math.min(classificationResult.abnormal_probability * 100, 100)}%`,
																	}}
																></div>
															</div>
															<span className="text-sm font-semibold text-red-700 dark:text-red-300">
																{(
																	classificationResult.abnormal_probability *
																	100
																).toFixed(1)}
																%
															</span>
														</div>
														<p className="mt-2 text-xs text-red-600 dark:text-red-300">
															Safety Threshold: {classificationResult.threshold}
														</p>
														<p className="mt-3 border-l-2 border-red-400 pl-3 text-sm text-red-700 dark:text-red-400">
															<strong>Warning:</strong> Abnormal water quality
															detected. Parameters exceed safety thresholds.
														</p>
														<p className="mt-2 text-sm font-medium text-red-700 dark:text-red-300">
															Immediate attention required. Consider advanced
															analysis for detailed assessment.
														</p>
													</div>
												</div>

												{/* Advanced Analysis Fields */}
												<div className="mt-4 rounded-lg bg-red-100/50 dark:bg-red-900/30 p-4">
													<h4 className="font-semibold text-red-700 dark:text-red-300 mb-3">
														Advanced Analysis (6-Parameter Model)
													</h4>
													<form
														onSubmit={handleAdvancedPredict}
														className="space-y-3"
													>
														<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
															{/* Raw Water Turbidity */}
															<div>
																<label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
																	Raw Water Turbidity (NTU)
																</label>
																<input
																	type="number"
																	name="rawWaterTurbidity"
																	step="0.1"
																	min="0"
																	value={advancedFormData.rawWaterTurbidity}
																	onChange={handleAdvancedInputChange}
																	placeholder="e.g., 95.3"
																	className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
																/>
															</div>

															{/* Raw Water PH */}
															<div>
																<label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
																	Raw Water PH
																</label>
																<input
																	type="number"
																	name="rawWaterPH"
																	step="0.1"
																	min="0"
																	max="14"
																	value={advancedFormData.rawWaterPH}
																	onChange={handleAdvancedInputChange}
																	placeholder="e.g., 6.2"
																	className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
																/>
															</div>

															{/* Conductivity */}
															<div>
																<label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
																	Conductivity (µS/cm)
																</label>
																<input
																	type="number"
																	name="conductivity"
																	step="0.1"
																	min="0"
																	value={advancedFormData.conductivity}
																	onChange={handleAdvancedInputChange}
																	placeholder="e.g., 35.0"
																	className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
																/>
															</div>

															{/* Raw Water Flow */}
															<div>
																<label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
																	Raw Water Flow (M³/H)
																</label>
																<input
																	type="number"
																	name="rawWaterFlow"
																	step="0.1"
																	min="0"
																	value={advancedFormData.rawWaterFlow}
																	onChange={handleAdvancedInputChange}
																	placeholder="e.g., 12441"
																	className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
																/>
															</div>

															{/* D-Chamber Flow */}
															<div>
																<label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
																	D-Chamber Flow (L/M)
																</label>
																<input
																	type="number"
																	name="dChamberFlow"
																	step="0.1"
																	min="0"
																	value={advancedFormData.dChamberFlow}
																	onChange={handleAdvancedInputChange}
																	placeholder="e.g., 36.0"
																	className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
																/>
															</div>

															{/* Aerator Flow */}
															<div className="sm:col-span-2">
																<label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
																	Aerator Flow (L/M)
																</label>
																<input
																	type="number"
																	name="aeratorFlow"
																	step="0.1"
																	min="0"
																	value={advancedFormData.aeratorFlow}
																	onChange={handleAdvancedInputChange}
																	placeholder="e.g., 20.0"
																	className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
																/>
															</div>
														</div>

														<button
															type="submit"
															disabled={loading}
															className="w-full rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50 text-sm"
														>
															{loading
																? "Analyzing..."
																: "OPEN ADVANCED ANALYSIS (6-PARAMETER MODEL)"}
														</button>
													</form>
												</div>
											</motion.div>
										)}

									{!classificationResult && (
										<button
											type="submit"
											disabled={loading}
											className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
										>
											{loading ? "Predicting..." : "PREDICT ALUM DOSE"}
										</button>
									)}

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
						) : predictions === null ? (
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
										Fill in the input parameters and click &quot;PREDICT ALUM
										DOSE&quot; to generate predictions
									</p>
								</div>
							</motion.div>
						) : null}
					</div>
				</div>
			</section>
		</div>
	);
}
