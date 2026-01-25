"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Area,
	AreaChart,
	ComposedChart,
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

export default function PreLimePage() {
	const [activeTab, setActiveTab] = useState("pre-lime");
	const [formData, setFormData] = useState({
		rawWaterPH: "",
		rawWaterTurbidity: "",
		rawWaterConductivity: "",
	});

	const [postLimeFormData, setPostLimeFormData] = useState({
		rawWaterPH: "",
		rawWaterTurbidity: "",
		rawWaterConductivity: "",
	});

	const [predictions, setPredictions] = useState(null);
	const [postLimePredictions, setPostLimePredictions] = useState(null);
	const [loading, setLoading] = useState(false);
	const [postLimeLoading, setPostLimeLoading] = useState(false);
	const [error, setError] = useState(null);
	const [postLimeError, setPostLimeError] = useState(null);
	const [historyLoading, setHistoryLoading] = useState(false);
	const [historyData, setHistoryData] = useState([]);
	const [postLimeHistoryLoading, setPostLimeHistoryLoading] = useState(false);
	const [postLimeHistoryData, setPostLimeHistoryData] = useState([]);

	// Get first day of current month and today's date
	const getMonthDateRange = () => {
		const now = new Date();
		const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
			.toISOString()
			.split("T")[0];
		const today = now.toISOString().split("T")[0];
		return { firstDay, today };
	};

	const { firstDay, today } = getMonthDateRange();
	const [startDate, setStartDate] = useState(firstDay);
	const [endDate, setEndDate] = useState(today);
	const resultsRef = require("react").useRef(null);

	// Auto-fetch historical data on component mount
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		const autoFetchHistory = async () => {
			setHistoryLoading(true);
			try {
				const data = await API.getPreLimeHistory(firstDay, today);
				const sortedData = data.sort(
					(a, b) => new Date(a.created_at) - new Date(b.created_at),
				);
				const chartData = sortedData.map((item) => ({
					timestamp: new Date(item.created_at).toLocaleString(),
					date: new Date(item.created_at).toLocaleDateString(),
					settledPH: parseFloat(
						item.prediction.predicted_settled_pH.toFixed(2),
					),
					dose: parseFloat(item.prediction.recommended_dose_ppm.toFixed(2)),
					rawPH: parseFloat(item.raw_inputs.raw_ph.toFixed(2)),
					rawTurbidity: parseFloat(item.raw_inputs.raw_turbidity.toFixed(2)),
					lowerPH: parseFloat(
						item.prediction.conformal_interval.lower_pH.toFixed(2),
					),
					upperPH: parseFloat(
						item.prediction.conformal_interval.upper_pH.toFixed(2),
					),
				}));
				setHistoryData(chartData);
			} catch (err) {
				console.error("Error fetching initial history:", err);
			} finally {
				setHistoryLoading(false);
			}
		};
		autoFetchHistory();
	}, []);

	// Auto-fetch post-lime historical data when tab switches to post-lime
	useEffect(() => {
		if (activeTab === "post-lime") {
			const autoFetchPostLimeHistory = async () => {
				setPostLimeHistoryLoading(true);
				try {
					const data = await API.getPostLimeHistory(firstDay, today);
					const sortedData = data.sort(
						(a, b) => new Date(a.created_at) - new Date(b.created_at),
					);
					const chartData = sortedData.map((item) => ({
						timestamp: new Date(item.created_at).toLocaleString(),
						date: new Date(item.created_at).toLocaleDateString(),
						finalPH: parseFloat(
							item.prediction.predicted_final_pH_sph2.toFixed(2),
						),
						dose: parseFloat(
							item.prediction.recommended_post_lime_dose_ppm.toFixed(2),
						),
						rawPH: parseFloat(item.raw_inputs.raw_ph.toFixed(2)),
						rawTurbidity: parseFloat(item.raw_inputs.raw_turbidity.toFixed(2)),
						lowerPH: parseFloat(
							item.prediction.conformal_interval.lower_pH.toFixed(2),
						),
						upperPH: parseFloat(
							item.prediction.conformal_interval.upper_pH.toFixed(2),
						),
					}));
					setPostLimeHistoryData(chartData);
				} catch (err) {
					console.error("Error fetching post-lime history on tab switch:", err);
					setPostLimeError(err.message || "Failed to fetch historical data");
				} finally {
					setPostLimeHistoryLoading(false);
				}
			};
			autoFetchPostLimeHistory();
		}
	}, [activeTab]);

	const fetchHistoricalData = async () => {
		setHistoryLoading(true);
		try {
			const data = await API.getPreLimeHistory(startDate, endDate);
			// Transform data for chart
			const sortedData = data.sort(
				(a, b) => new Date(a.created_at) - new Date(b.created_at),
			);
			const chartData = sortedData.map((item) => ({
				timestamp: new Date(item.created_at).toLocaleString(),
				settledPH: parseFloat(item.prediction.predicted_settled_pH.toFixed(2)),
				dose: parseFloat(item.prediction.recommended_dose_ppm.toFixed(2)),
				rawPH: parseFloat(item.raw_inputs.raw_ph.toFixed(2)),
				rawTurbidity: parseFloat(item.raw_inputs.raw_turbidity.toFixed(2)),
				lowerPH: parseFloat(
					item.prediction.conformal_interval.lower_pH.toFixed(2),
				),
				upperPH: parseFloat(
					item.prediction.conformal_interval.upper_pH.toFixed(2),
				),
			}));
			setHistoryData(chartData);
		} catch (err) {
			console.error("Error fetching history:", err);
			setError(err.message || "Failed to fetch historical data");
		} finally {
			setHistoryLoading(false);
		}
	};

	const fetchPostLimeHistoricalData = async () => {
		setPostLimeHistoryLoading(true);
		try {
			const data = await API.getPostLimeHistory(startDate, endDate);
			// Transform data for chart
			const sortedData = data.sort(
				(a, b) => new Date(a.created_at) - new Date(b.created_at),
			);
			const chartData = sortedData.map((item) => ({
				timestamp: new Date(item.created_at).toLocaleString(),
				finalPH: parseFloat(item.prediction.predicted_final_pH_sph2.toFixed(2)),
				dose: parseFloat(
					item.prediction.recommended_post_lime_dose_ppm.toFixed(2),
				),
				rawPH: parseFloat(item.raw_inputs.raw_ph.toFixed(2)),
				rawTurbidity: parseFloat(item.raw_inputs.raw_turbidity.toFixed(2)),
				lowerPH: parseFloat(
					item.prediction.conformal_interval.lower_pH.toFixed(2),
				),
				upperPH: parseFloat(
					item.prediction.conformal_interval.upper_pH.toFixed(2),
				),
			}));
			setPostLimeHistoryData(chartData);
		} catch (err) {
			console.error("Error fetching post-lime history:", err);
			setPostLimeError(err.message || "Failed to fetch historical data");
		} finally {
			setPostLimeHistoryLoading(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setError(null);
	};

	const handlePostLimeInputChange = (e) => {
		const { name, value } = e.target;
		setPostLimeFormData((prev) => ({ ...prev, [name]: value }));
		setPostLimeError(null);
	};

	const handlePredict = async (e) => {
		e.preventDefault();

		if (
			!formData.rawWaterPH ||
			!formData.rawWaterTurbidity ||
			!formData.rawWaterConductivity
		) {
			setError("Please fill in all fields");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const result = await API.predictPreLime(
				formData.rawWaterPH,
				formData.rawWaterTurbidity,
				formData.rawWaterConductivity,
			);

			setPredictions({
				recommendedDose: result.recommended_dose?.toFixed(1) || "0",
				settledPH: result.settled_turbidity?.toFixed(1) || "0",
				conformalInterval: result.conformal_interval?.upper
					? (
							result.conformal_interval.upper - result.conformal_interval.lower
						).toFixed(2)
					: "0.15",
				inputs: { ...formData },
				isSpike:
					parseFloat(result.settled_turbidity) < 6.0 ||
					parseFloat(result.settled_turbidity) > 6.6,
				explanation:
					"The pre-lime dosing model analyzes the input raw water parameters to predict the optimal lime dosage required to achieve the target settled pH. Based on the current raw water pH of " +
					formData.rawWaterPH +
					" and turbidity of " +
					formData.rawWaterTurbidity +
					" NTU, the model recommends " +
					result.recommended_dose?.toFixed(1) +
					" mg/L of pre-lime. This dosage is expected to result in a settled pH of approximately " +
					result.settled_turbidity?.toFixed(1) +
					" with a conformal prediction interval of ±" +
					(result.conformal_interval?.upper
						? (
								result.conformal_interval.upper -
								result.conformal_interval.lower
							).toFixed(2)
						: "0.15") +
					" pH. The model uses machine learning trained on historical water treatment data to provide this recommendation.",
			});
		} catch (err) {
			setError(err.message || "Failed to make prediction. Please try again.");
			console.error("Prediction error:", err);
		} finally {
			setLoading(false);
		}
	};

	const handlePostLimePredict = async (e) => {
		e.preventDefault();

		if (
			!postLimeFormData.rawWaterPH ||
			!postLimeFormData.rawWaterTurbidity ||
			!postLimeFormData.rawWaterConductivity
		) {
			setPostLimeError("Please fill in all fields");
			return;
		}

		setPostLimeLoading(true);
		setPostLimeError(null);

		try {
			const result = await API.predictPostLime(
				postLimeFormData.rawWaterPH,
				postLimeFormData.rawWaterTurbidity,
				postLimeFormData.rawWaterConductivity,
			);

			// Check for spike detection (pH < 6.8 or pH > 7.2)
			const isSpike =
				parseFloat(result.final_ph) < 6.8 || parseFloat(result.final_ph) > 7.2;

			setPostLimePredictions({
				recommendedDose: result.recommended_dose?.toFixed(1) || "0",
				finalPH: result.final_ph?.toFixed(2) || "0",
				conformalInterval: result.conformal_interval?.upper
					? (
							result.conformal_interval.upper - result.conformal_interval.lower
						).toFixed(2)
					: "0.18",
				inputs: { ...postLimeFormData },
				isSpike,
				explanation:
					"The post-lime dosing model analyzes the input raw water parameters to predict the optimal lime dosage required for pH stabilization. Based on the current raw water pH of " +
					postLimeFormData.rawWaterPH +
					" and turbidity of " +
					postLimeFormData.rawWaterTurbidity +
					" NTU, the model recommends " +
					result.recommended_dose?.toFixed(1) +
					" mg/L of post-lime. This dosage is expected to result in a final pH of approximately " +
					result.final_ph?.toFixed(2) +
					" with a conformal prediction interval of ±" +
					(result.conformal_interval?.upper
						? (
								result.conformal_interval.upper -
								result.conformal_interval.lower
							).toFixed(2)
						: "0.18") +
					" pH. The model uses machine learning trained on historical water treatment data to provide this recommendation.",
			});
		} catch (err) {
			setPostLimeError(
				err.message || "Failed to make prediction. Please try again.",
			);
			console.error("Post-lime prediction error:", err);
		} finally {
			setPostLimeLoading(false);
		}
	};

	const generatePDFReport = async () => {
		if (!predictions) return;

		try {
			const pdf = new jsPDF({
				orientation: "portrait",
				unit: "mm",
				format: "a4",
			});

			const pageWidth = pdf.internal.pageSize.getWidth();
			const pageHeight = pdf.internal.pageSize.getHeight();
			let yPosition = 20;

			// Header
			pdf.setFontSize(24);
			pdf.setFont(undefined, "bold");
			pdf.setTextColor(0, 0, 0);
			pdf.text("Pre-Lime Dosage Report", pageWidth / 2, yPosition, {
				align: "center",
			});
			yPosition += 15;

			// Date
			pdf.setFontSize(10);
			pdf.setFont(undefined, "normal");
			pdf.text(
				`Generated: ${new Date().toLocaleString()}`,
				pageWidth / 2,
				yPosition,
				{ align: "center" },
			);
			yPosition += 12;

			// Section: Input Parameters
			pdf.setFontSize(14);
			pdf.setFont(undefined, "bold");
			pdf.setTextColor(0, 0, 0);
			pdf.text("Input Parameters", 20, yPosition);
			yPosition += 10;

			pdf.setFontSize(11);
			pdf.setFont(undefined, "normal");
			pdf.setTextColor(40, 40, 40);
			pdf.text(`Raw Water pH: ${predictions.inputs.rawWaterPH}`, 25, yPosition);
			yPosition += 7;
			pdf.text(
				`Raw Water Turbidity: ${predictions.inputs.rawWaterTurbidity} NTU`,
				25,
				yPosition,
			);
			yPosition += 7;
			pdf.text(
				`Raw Water Conductivity: ${predictions.inputs.rawWaterConductivity} µS/cm`,
				25,
				yPosition,
			);
			yPosition += 12;

			// Section: Prediction Results
			pdf.setFontSize(14);
			pdf.setFont(undefined, "bold");
			pdf.setTextColor(0, 0, 0);
			pdf.text("Prediction Results", 20, yPosition);
			yPosition += 10;

			// Results boxes
			pdf.setFillColor(200, 230, 255);
			pdf.rect(20, yPosition, (pageWidth - 40) / 3 - 3, 25, "F");
			pdf.setFontSize(9);
			pdf.setFont(undefined, "normal");
			pdf.setTextColor(60, 60, 60);
			pdf.text("Recommended Dose", 20 + 5, yPosition + 4);
			pdf.setFont(undefined, "bold");
			pdf.setFontSize(14);
			pdf.setTextColor(0, 100, 200);
			pdf.text(predictions.recommendedDose + " mg/L", 20 + 5, yPosition + 14);

			pdf.setFillColor(200, 230, 255);
			pdf.rect(
				20 + (pageWidth - 40) / 3 + 2,
				yPosition,
				(pageWidth - 40) / 3 - 3,
				25,
				"F",
			);
			pdf.setFontSize(9);
			pdf.setFont(undefined, "normal");
			pdf.setTextColor(60, 60, 60);
			pdf.text(
				"Predicted Settled pH",
				20 + (pageWidth - 40) / 3 + 7,
				yPosition + 4,
			);
			pdf.setFont(undefined, "bold");
			pdf.setFontSize(14);
			pdf.setTextColor(0, 100, 200);
			pdf.text(
				predictions.settledPH,
				20 + (pageWidth - 40) / 3 + 7,
				yPosition + 14,
			);

			pdf.setFillColor(200, 230, 255);
			pdf.rect(
				20 + 2 * ((pageWidth - 40) / 3 + 2),
				yPosition,
				(pageWidth - 40) / 3 - 3,
				25,
				"F",
			);
			pdf.setFontSize(9);
			pdf.setFont(undefined, "normal");
			pdf.setTextColor(60, 60, 60);
			pdf.text(
				"Conformal Interval",
				20 + 2 * ((pageWidth - 40) / 3 + 2) + 5,
				yPosition + 4,
			);
			pdf.setFont(undefined, "bold");
			pdf.setFontSize(14);
			pdf.setTextColor(0, 100, 200);
			pdf.text(
				"±" + predictions.conformalInterval + " pH",
				20 + 2 * ((pageWidth - 40) / 3 + 2) + 5,
				yPosition + 14,
			);

			yPosition += 35;

			// Section: Dose Sensitivity Data Table
			pdf.setFontSize(12);
			pdf.setFont(undefined, "bold");
			pdf.setTextColor(0, 0, 0);
			pdf.text("Historical Data", 20, yPosition);
			yPosition += 8;

			// Table header
			pdf.setFontSize(9);
			pdf.setFont(undefined, "bold");
			pdf.setTextColor(255, 255, 255);
			pdf.setFillColor(0, 100, 200);
			pdf.rect(20, yPosition - 4, 35, 6, "F");
			pdf.rect(55, yPosition - 4, 20, 6, "F");
			pdf.rect(75, yPosition - 4, 20, 6, "F");
			pdf.rect(95, yPosition - 4, 20, 6, "F");
			pdf.text("Timestamp", 21, yPosition);
			pdf.text("Raw pH", 57, yPosition);
			pdf.text("Dose", 76, yPosition);
			pdf.text("Settled pH", 96, yPosition);
			yPosition += 8;

			// Table rows (historical data)
			pdf.setFont(undefined, "normal");
			pdf.setTextColor(60, 60, 60);
			pdf.setFontSize(8);
			historyData.slice(0, 15).forEach((row, idx) => {
				if (yPosition > pageHeight - 30) {
					pdf.addPage();
					yPosition = 20;
				}
				pdf.rect(20, yPosition - 3, 100, 5);
				pdf.text(row.timestamp.substring(0, 16), 21, yPosition);
				pdf.text(String(row.rawPH), 57, yPosition);
				pdf.text(String(row.dose), 76, yPosition);
				pdf.text(String(row.settledPH), 96, yPosition);
				yPosition += 5;
			});

			yPosition += 5;

			// Section: Explanation
			pdf.setFontSize(12);
			pdf.setFont(undefined, "bold");
			pdf.setTextColor(0, 0, 0);
			pdf.text("Model Explanation (LIME)", 20, yPosition);
			yPosition += 8;

			pdf.setFontSize(9);
			pdf.setFont(undefined, "normal");
			pdf.setTextColor(60, 60, 60);
			const explanationLines = pdf.splitTextToSize(
				predictions.explanation,
				pageWidth - 40,
			);
			pdf.text(explanationLines, 20, yPosition);
			yPosition += explanationLines.length * 4 + 5;

			// Section: Recommendations
			if (yPosition < pageHeight - 40) {
				pdf.setFontSize(12);
				pdf.setFont(undefined, "bold");
				pdf.setTextColor(0, 0, 0);
				pdf.text("Recommendations", 20, yPosition);
				yPosition += 8;

				pdf.setFontSize(9);
				pdf.setFont(undefined, "normal");
				pdf.setTextColor(60, 60, 60);
				const recommendations = [
					"Apply the recommended pre-lime dose of " +
						predictions.recommendedDose +
						" mg/L to the raw water.",
					"Monitor the settled pH closely during the initial application to verify prediction accuracy.",
					"The conformal prediction interval of ±" +
						predictions.conformalInterval +
						" pH indicates the range of uncertainty.",
					"If actual pH deviates from prediction, adjust dose incrementally and recalibrate the model.",
					"Document all treatment parameters for continuous model improvement.",
				];

				recommendations.forEach((rec, idx) => {
					if (yPosition > pageHeight - 20) {
						pdf.addPage();
						yPosition = 20;
					}
					const recLines = pdf.splitTextToSize(
						idx + 1 + ". " + rec,
						pageWidth - 40,
					);
					pdf.text(recLines, 20, yPosition);
					yPosition += recLines.length * 4 + 2;
				});
			}

			// Footer
			pdf.setFontSize(8);
			pdf.setFont(undefined, "normal");
			pdf.setTextColor(100, 100, 100);
			pdf.text(
				"Water Quality Identification Platform - Confidential",
				pageWidth / 2,
				pageHeight - 10,
				{
					align: "center",
				},
			);

			pdf.save(`Pre-Lime-Report-${new Date().toISOString().split("T")[0]}.pdf`);
		} catch (err) {
			console.error("Error generating PDF:", err);
			alert(
				"Failed to generate PDF report. Please check the console for details.",
			);
		}
	};

	const generatePostLimePDFReport = async () => {
		if (!postLimePredictions) return;

		try {
			const pdf = new jsPDF({
				orientation: "portrait",
				unit: "mm",
				format: "a4",
			});

			const pageWidth = pdf.internal.pageSize.getWidth();
			const pageHeight = pdf.internal.pageSize.getHeight();
			let yPosition = 20;

			// Header
			pdf.setFontSize(24);
			pdf.setFont(undefined, "bold");
			pdf.setTextColor(0, 0, 0);
			pdf.text("Post-Lime Dosage Report", pageWidth / 2, yPosition, {
				align: "center",
			});
			yPosition += 15;

			// Date
			pdf.setFontSize(10);
			pdf.setFont(undefined, "normal");
			pdf.text(
				`Generated: ${new Date().toLocaleString()}`,
				pageWidth / 2,
				yPosition,
				{ align: "center" },
			);
			yPosition += 12;

			// Spike Alert if detected
			if (postLimePredictions.isSpike) {
				pdf.setFillColor(255, 200, 200);
				pdf.rect(20, yPosition, pageWidth - 40, 15, "F");
				pdf.setFontSize(11);
				pdf.setFont(undefined, "bold");
				pdf.setTextColor(200, 0, 0);
				pdf.text(
					"SPIKE DETECTED: Final pH is out of safe range (6.8 - 7.2)",
					20 + 5,
					yPosition + 8,
				);
				yPosition += 20;
			}

			// Section: Input Parameters
			pdf.setFontSize(14);
			pdf.setFont(undefined, "bold");
			pdf.setTextColor(0, 0, 0);
			pdf.text("Input Parameters", 20, yPosition);
			yPosition += 10;

			pdf.setFontSize(11);
			pdf.setFont(undefined, "normal");
			pdf.setTextColor(40, 40, 40);
			pdf.text(
				`Raw Water pH: ${postLimePredictions.inputs.rawWaterPH}`,
				25,
				yPosition,
			);
			yPosition += 7;
			pdf.text(
				`Raw Water Turbidity: ${postLimePredictions.inputs.rawWaterTurbidity} NTU`,
				25,
				yPosition,
			);
			yPosition += 7;
			pdf.text(
				`Raw Water Conductivity: ${postLimePredictions.inputs.rawWaterConductivity} µS/cm`,
				25,
				yPosition,
			);
			yPosition += 12;

			// Section: Prediction Results
			pdf.setFontSize(14);
			pdf.setFont(undefined, "bold");
			pdf.setTextColor(0, 0, 0);
			pdf.text("Prediction Results", 20, yPosition);
			yPosition += 10;

			// Results boxes
			pdf.setFillColor(200, 230, 255);
			pdf.rect(20, yPosition, (pageWidth - 40) / 3 - 3, 25, "F");
			pdf.setFontSize(9);
			pdf.setFont(undefined, "normal");
			pdf.setTextColor(60, 60, 60);
			pdf.text("Recommended Dose", 20 + 5, yPosition + 4);
			pdf.setFont(undefined, "bold");
			pdf.setFontSize(14);
			pdf.setTextColor(0, 100, 200);
			pdf.text(
				postLimePredictions.recommendedDose + " mg/L",
				20 + 5,
				yPosition + 14,
			);

			pdf.setFillColor(200, 230, 255);
			pdf.rect(
				20 + (pageWidth - 40) / 3 + 2,
				yPosition,
				(pageWidth - 40) / 3 - 3,
				25,
				"F",
			);
			pdf.setFontSize(9);
			pdf.setFont(undefined, "normal");
			pdf.setTextColor(60, 60, 60);
			pdf.text(
				"Predicted Final pH",
				20 + (pageWidth - 40) / 3 + 7,
				yPosition + 4,
			);
			pdf.setFont(undefined, "bold");
			pdf.setFontSize(14);
			if (postLimePredictions.isSpike) {
				pdf.setTextColor(200, 0, 0);
			} else {
				pdf.setTextColor(0, 100, 200);
			}
			pdf.text(
				postLimePredictions.finalPH,
				20 + (pageWidth - 40) / 3 + 7,
				yPosition + 14,
			);

			pdf.setFillColor(200, 230, 255);
			pdf.rect(
				20 + 2 * ((pageWidth - 40) / 3 + 2),
				yPosition,
				(pageWidth - 40) / 3 - 3,
				25,
				"F",
			);
			pdf.setFontSize(9);
			pdf.setFont(undefined, "normal");
			pdf.setTextColor(60, 60, 60);
			pdf.text(
				"Conformal Interval",
				20 + 2 * ((pageWidth - 40) / 3 + 2) + 5,
				yPosition + 4,
			);
			pdf.setFont(undefined, "bold");
			pdf.setFontSize(14);
			pdf.setTextColor(0, 100, 200);
			pdf.text(
				"±" + postLimePredictions.conformalInterval + " pH",
				20 + 2 * ((pageWidth - 40) / 3 + 2) + 5,
				yPosition + 14,
			);

			yPosition += 35;

			// Section: Dose Sensitivity Data Table
			pdf.setFontSize(12);
			pdf.setFont(undefined, "bold");
			pdf.setTextColor(0, 0, 0);
			pdf.text("Historical Data", 20, yPosition);
			yPosition += 8;

			// Table header
			pdf.setFontSize(9);
			pdf.setFont(undefined, "bold");
			pdf.setTextColor(255, 255, 255);
			pdf.setFillColor(0, 100, 200);
			pdf.rect(20, yPosition - 4, 35, 6, "F");
			pdf.rect(55, yPosition - 4, 20, 6, "F");
			pdf.rect(75, yPosition - 4, 20, 6, "F");
			pdf.rect(95, yPosition - 4, 20, 6, "F");
			pdf.text("Timestamp", 21, yPosition);
			pdf.text("Raw pH", 57, yPosition);
			pdf.text("Dose", 76, yPosition);
			pdf.text("Final pH", 96, yPosition);
			yPosition += 8;

			// Table rows (historical data)
			pdf.setFont(undefined, "normal");
			pdf.setTextColor(60, 60, 60);
			pdf.setFontSize(8);
			postLimeHistoryData.slice(0, 15).forEach((row, idx) => {
				if (yPosition > pageHeight - 30) {
					pdf.addPage();
					yPosition = 20;
				}
				pdf.rect(20, yPosition - 3, 100, 5);
				pdf.text(row.timestamp.substring(0, 16), 21, yPosition);
				pdf.text(String(row.rawPH), 57, yPosition);
				pdf.text(String(row.dose), 76, yPosition);
				pdf.text(String(row.finalPH), 96, yPosition);
				yPosition += 5;
			});

			yPosition += 5;

			// Section: Explanation
			pdf.setFontSize(12);
			pdf.setFont(undefined, "bold");
			pdf.setTextColor(0, 0, 0);
			pdf.text("Model Explanation (LIME)", 20, yPosition);
			yPosition += 8;

			pdf.setFontSize(9);
			pdf.setFont(undefined, "normal");
			pdf.setTextColor(60, 60, 60);
			const explanationLines = pdf.splitTextToSize(
				postLimePredictions.explanation,
				pageWidth - 40,
			);
			pdf.text(explanationLines, 20, yPosition);
			yPosition += explanationLines.length * 4 + 5;

			// Section: Recommendations
			if (yPosition < pageHeight - 40) {
				pdf.setFontSize(12);
				pdf.setFont(undefined, "bold");
				pdf.setTextColor(0, 0, 0);
				pdf.text("Recommendations", 20, yPosition);
				yPosition += 8;

				pdf.setFontSize(9);
				pdf.setFont(undefined, "normal");
				pdf.setTextColor(60, 60, 60);
				const recommendations = [
					"Apply the recommended post-lime dose of " +
						postLimePredictions.recommendedDose +
						" mg/L for pH stabilization.",
					"Monitor the final pH closely during the initial application to verify prediction accuracy.",
					"The conformal prediction interval of ±" +
						postLimePredictions.conformalInterval +
						" pH indicates the range of uncertainty.",
					postLimePredictions.isSpike
						? "ALERT: The predicted final pH is out of safe range (6.8 - 7.2). Review dosing parameters immediately."
						: "The predicted final pH is within the safe range (6.8 - 7.2).",
					"Document all treatment parameters for continuous model improvement.",
				];

				recommendations.forEach((rec, idx) => {
					if (yPosition > pageHeight - 20) {
						pdf.addPage();
						yPosition = 20;
					}
					const recLines = pdf.splitTextToSize(
						idx + 1 + ". " + rec,
						pageWidth - 40,
					);
					pdf.text(recLines, 20, yPosition);
					yPosition += recLines.length * 4 + 2;
				});
			}

			// Footer
			pdf.setFontSize(8);
			pdf.setFont(undefined, "normal");
			pdf.setTextColor(100, 100, 100);
			pdf.text(
				"Water Quality Identification Platform - Confidential",
				pageWidth / 2,
				pageHeight - 10,
				{
					align: "center",
				},
			);

			pdf.save(
				`Post-Lime-Report-${new Date().toISOString().split("T")[0]}.pdf`,
			);
		} catch (err) {
			console.error("Error generating PDF:", err);
			alert(
				"Failed to generate PDF report. Please check the console for details.",
			);
		}
	};

	return (
		<div className="min-h-screen bg-white dark:bg-black">
			{/* Header */}
			<section className="border-b border-zinc-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-12 dark:border-zinc-700 dark:from-blue-950 dark:to-cyan-950">
				<div className="mx-auto max-w-6xl">
					<h1 className="mb-2 text-4xl font-extrabold text-black dark:text-white">
						Lime Dosing Optimization
					</h1>
					<p className="text-lg text-zinc-700 dark:text-zinc-300">
						Predict optimal lime dosage for precise pH control
					</p>
				</div>
			</section>

			{/* Tabs */}
			<section className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
				<div className="mx-auto max-w-6xl flex gap-4">
					<button
						onClick={() => setActiveTab("pre-lime")}
						className={`px-6 py-3 font-semibold transition-all ${
							activeTab === "pre-lime"
								? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
								: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
						}`}
					>
						Pre-Lime
					</button>
					<button
						onClick={() => setActiveTab("post-lime")}
						className={`px-6 py-3 font-semibold transition-all ${
							activeTab === "post-lime"
								? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
								: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
						}`}
					>
						Post-Lime
					</button>
				</div>
			</section>

			{/* Main Content */}
			{activeTab === "pre-lime" && (
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
								<div className="rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-900 mb-6">
									<h2 className="mb-6 text-2xl font-bold text-black dark:text-white">
										Pre-Lime Configuration
									</h2>

									<form onSubmit={handlePredict} className="space-y-5">
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

										<div>
											<label className="block text-sm font-medium text-zinc-900 dark:text-white">
												Raw Water Conductivity (µS/cm)
											</label>
											<input
												type="number"
												name="rawWaterConductivity"
												step="1"
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
											{loading ? "Predicting..." : "PREDICT PRE-LIME DOSE"}
										</button>
									</form>

									{predictions && (
										<motion.button
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											onClick={generatePDFReport}
											className="mt-4 w-full rounded-lg border-2 border-blue-600 px-6 py-2 font-semibold text-blue-600 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20"
										>
											📥 Download Pre-Lime Report
										</motion.button>
									)}
								</div>

								{/* Explanation */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: 0.3 }}
									className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900"
								>
									<h3 className="mb-4 text-lg font-bold text-black dark:text-white">
										Pre-Lime Explanation (LIME)
									</h3>
									<p className="leading-relaxed text-zinc-700 dark:text-zinc-300">
										{predictions?.explanation}
									</p>
									<div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
										<p className="text-sm text-blue-700 dark:text-blue-400">
											💡 <strong>Tip:</strong> The conformal prediction interval
											represents the uncertainty in our prediction. Wider
											intervals indicate higher uncertainty due to input
											variations.
										</p>
									</div>
								</motion.div>
							</motion.div>

							{/* Date Range and Charts Section */}
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.6 }}
								className="lg:col-span-2"
							>
								{/* Results Section */}
								{predictions && (
									<motion.div
										ref={resultsRef}
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.6 }}
										className="lg:col-span-2"
									>
										<div className="space-y-6" id="dose-chart-container">
											{predictions?.isSpike && (
												<motion.div
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4 dark:bg-red-900/20"
												>
													<div className="flex items-start gap-3">
														<span className="text-2xl">⚠️</span>
														<div>
															<h4 className="font-bold text-red-800 dark:text-red-300">
																Spike Detected!
															</h4>
															<p className="mt-1 text-sm text-red-700 dark:text-red-400">
																Settled pH is out of safe range (6.0 - 6.6).
																Recommended action: Review your water treatment
																parameters.
															</p>
														</div>
													</div>
												</motion.div>
											)}
											{/* Prediction Results Cards */}
											<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
												<motion.div
													whileHover={{ y: -4 }}
													className="rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 dark:border-blue-800 dark:from-blue-900/30 dark:to-cyan-900/30"
												>
													<p className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
														Recommended Pre-Lime Dose
													</p>
													<p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
														{predictions.recommendedDose}
													</p>
													<p className="text-sm text-zinc-600 dark:text-zinc-400">
														mg/L
													</p>
												</motion.div>

												<motion.div
													whileHover={{ y: -4 }}
													className="rounded-lg border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-teal-50 p-6 dark:border-cyan-800 dark:from-cyan-900/30 dark:to-teal-900/30"
												>
													<p className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
														Predicted Settled pH
													</p>
													<p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
														{predictions.settledPH}
													</p>
													<p className="text-sm text-zinc-600 dark:text-zinc-400">
														pH units
													</p>
												</motion.div>

												<motion.div
													whileHover={{ y: -4 }}
													className="rounded-lg border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-6 dark:border-emerald-800 dark:from-emerald-900/30 dark:to-green-900/30"
												>
													<p className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
														Conformal Interval
													</p>
													<p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
														±{predictions.conformalInterval}
													</p>
													<p className="text-sm text-zinc-600 dark:text-zinc-400">
														pH
													</p>
												</motion.div>
											</div>
										</div>
										<br />
									</motion.div>
								)}

								{/* Date Range Picker */}
								<div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
									<h3 className="mb-4 text-lg font-bold text-black dark:text-white">
										Historical Data
									</h3>
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										<div>
											<label className="block text-sm font-medium text-zinc-900 dark:text-white">
												Start Date
											</label>
											<input
												type="date"
												value={startDate}
												onChange={(e) => setStartDate(e.target.value)}
												className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-zinc-900 dark:text-white">
												End Date
											</label>
											<input
												type="date"
												value={endDate}
												onChange={(e) => setEndDate(e.target.value)}
												className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
											/>
										</div>
									</div>
									<button
										onClick={fetchHistoricalData}
										disabled={historyLoading}
										className="mt-4 w-full rounded-lg border-2 border-blue-600 px-6 py-2 font-semibold text-blue-600 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
									>
										{historyLoading ? "Loading..." : "📊 Load Historical Data"}
									</button>
								</div>

								{/* Charts and Explanation */}
								<div className="space-y-6 mb-6" id="dose-chart-container">
									{/* Chart */}
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: 0.2 }}
										className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900"
										id="dose-chart"
									>
										<h3 className="mb-4 text-lg font-bold text-black dark:text-white">
											Dose Sensitivity Curve
										</h3>
										<ResponsiveContainer width="100%" height={350}>
											<ComposedChart
												data={historyData}
												margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
											>
												<defs>
													<linearGradient
														id="colorSettledPH"
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
													dataKey="timestamp"
													label={{
														value: "Date",
														position: "insideBottom",
														offset: -5,
													}}
													stroke="#999"
													tickFormatter={(value) => {
														if (typeof value === "string") {
															return value.split(",")[0];
														}
														return value;
													}}
												/>
												<YAxis
													label={{
														value: "pH",
														angle: -90,
														position: "insideLeft",
													}}
													stroke="#999"
												/>
												<Tooltip
													contentStyle={{
														backgroundColor: "rgba(0, 0, 0, 0.95)",
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
													dataKey="settledPH"
													fill="url(#colorSettledPH)"
													stroke="#3b82f6"
													strokeWidth={2}
													name="Settled pH"
												/>
												<Area
													type="monotone"
													dataKey="rawPH"
													fill="#e0e7ff"
													stroke="#e0e7ff"
													strokeWidth={2}
													name="Raw pH"
												/>
											</ComposedChart>
										</ResponsiveContainer>
									</motion.div>
								</div>

								{/* Empty State */}
								{/* {!predictions && (
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
											PRE-LIME DOSE&quot; to generate predictions
										</p>
									</div>
								</motion.div>
							)} */}
							</motion.div>
						</div>
					</div>
				</section>
			)}

			{activeTab === "post-lime" && (
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
										Post-Lime Configuration
									</h2>

									<form onSubmit={handlePostLimePredict} className="space-y-5">
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
												value={postLimeFormData.rawWaterPH}
												onChange={handlePostLimeInputChange}
												placeholder="e.g., 7.2"
												className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
												required
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-zinc-900 dark:text-white">
												Raw Water Turbidity (NTU)
											</label>
											<input
												type="number"
												name="rawWaterTurbidity"
												step="0.1"
												min="0"
												value={postLimeFormData.rawWaterTurbidity}
												onChange={handlePostLimeInputChange}
												placeholder="e.g., 5.5"
												className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
												required
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-zinc-900 dark:text-white">
												Raw Water Conductivity (µS/cm)
											</label>
											<input
												type="number"
												name="rawWaterConductivity"
												step="1"
												min="0"
												value={postLimeFormData.rawWaterConductivity}
												onChange={handlePostLimeInputChange}
												placeholder="e.g., 450"
												className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
												required
											/>
										</div>

										{postLimeError && (
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
											>
												{postLimeError}
											</motion.div>
										)}

										<button
											type="submit"
											disabled={postLimeLoading}
											className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
										>
											{postLimeLoading
												? "Analyzing..."
												: "PREDICT POST-LIME DOSE"}
										</button>
									</form>

									{postLimePredictions && (
										<motion.button
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											onClick={generatePostLimePDFReport}
											className="mt-4 w-full rounded-lg border-2 border-blue-600 px-6 py-2 font-semibold text-blue-600 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20"
										>
											📥 Download Post-Lime Report
										</motion.button>
									)}
								</div>

								{/* Explanation */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: 0.3 }}
									className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900 mt-6"
								>
									<h3 className="mb-4 text-lg font-bold text-black dark:text-white">
										Post-Lime Explanation (LIME)
									</h3>
									<p className="leading-relaxed text-zinc-700 dark:text-zinc-300">
										{postLimePredictions?.explanation}
									</p>
									<div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
										<p className="text-sm text-blue-700 dark:text-blue-400">
											💡 <strong>Tip:</strong> The conformal prediction interval
											represents the uncertainty in our prediction. Wider
											intervals indicate higher uncertainty due to input
											variations.
										</p>
									</div>
								</motion.div>
							</motion.div>

							{/* Date Range and Charts Section */}
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.6 }}
								className="lg:col-span-2"
							>
								{/* Results Section */}
								{postLimePredictions && (
									<motion.div
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.6 }}
										className="lg:col-span-2"
									>
										<div className="space-y-6">
											{/* Spike Detection Alert */}
											{postLimePredictions.isSpike && (
												<motion.div
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4 dark:bg-red-900/20"
												>
													<div className="flex items-start gap-3">
														<span className="text-2xl">⚠️</span>
														<div>
															<h4 className="font-bold text-red-800 dark:text-red-300">
																Spike Detected!
															</h4>
															<p className="mt-1 text-sm text-red-700 dark:text-red-400">
																Final pH is out of safe range (6.8 - 7.2).
																Recommended action: Review your water treatment
																parameters.
															</p>
														</div>
													</div>
												</motion.div>
											)}

											{/* Prediction Results Cards */}
											<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
												<motion.div
													whileHover={{ y: -4 }}
													className="rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 dark:border-blue-800 dark:from-blue-900/30 dark:to-cyan-900/30"
												>
													<p className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
														Recommended Post-Lime Dose
													</p>
													<p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
														{postLimePredictions.recommendedDose}
													</p>
													<p className="text-sm text-zinc-600 dark:text-zinc-400">
														mg/L
													</p>
												</motion.div>

												<motion.div
													whileHover={{ y: -4 }}
													className={`rounded-lg border-2 p-6 ${
														postLimePredictions.isSpike
															? "border-red-200 bg-gradient-to-br from-red-50 to-orange-50 dark:border-red-800 dark:from-red-900/30 dark:to-orange-900/30"
															: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 dark:border-emerald-800 dark:from-emerald-900/30 dark:to-green-900/30"
													}`}
												>
													<p className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
														Predicted Final pH
													</p>
													<p
														className={`text-3xl font-bold ${
															postLimePredictions.isSpike
																? "text-red-600 dark:text-red-400"
																: "text-emerald-600 dark:text-emerald-400"
														}`}
													>
														{postLimePredictions.finalPH}
													</p>
													<p className="text-sm text-zinc-600 dark:text-zinc-400">
														pH units
													</p>
												</motion.div>

												<motion.div
													whileHover={{ y: -4 }}
													className="rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 dark:border-purple-800 dark:from-purple-900/30 dark:to-pink-900/30"
												>
													<p className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
														Conformal Interval
													</p>
													<p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
														±{postLimePredictions.conformalInterval}
													</p>
													<p className="text-sm text-zinc-600 dark:text-zinc-400">
														pH
													</p>
												</motion.div>
											</div>
											<br />
										</div>
									</motion.div>
								)}

								{/* Date Range Picker */}
								<div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
									<h3 className="mb-4 text-lg font-bold text-black dark:text-white">
										Historical Data
									</h3>
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										<div>
											<label className="block text-sm font-medium text-zinc-900 dark:text-white">
												Start Date
											</label>
											<input
												type="date"
												value={startDate}
												onChange={(e) => setStartDate(e.target.value)}
												className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-zinc-900 dark:text-white">
												End Date
											</label>
											<input
												type="date"
												value={endDate}
												onChange={(e) => setEndDate(e.target.value)}
												className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
											/>
										</div>
									</div>
									<button
										onClick={fetchPostLimeHistoricalData}
										disabled={postLimeHistoryLoading}
										className="mt-4 w-full rounded-lg border-2 border-blue-600 px-6 py-2 font-semibold text-blue-600 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
									>
										{postLimeHistoryLoading
											? "Loading..."
											: "📊 Load Historical Data"}
									</button>
								</div>

								{/* Charts Section */}
								<div className="space-y-6 mb-6" id="post-lime-chart-container">
									{/* Chart */}
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: 0.2 }}
										className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900"
										id="post-lime-chart"
									>
										<h3 className="mb-4 text-lg font-bold text-black dark:text-white">
											pH Trend
										</h3>
										<ResponsiveContainer width="100%" height={350}>
											<ComposedChart
												data={postLimeHistoryData}
												margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
											>
												<defs>
													<linearGradient
														id="colorFinalPH"
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
													dataKey="timestamp"
													label={{
														value: "Date",
														position: "insideBottom",
														offset: -5,
													}}
													stroke="#999"
													tickFormatter={(value) => {
														if (typeof value === "string") {
															return value.split(",")[0];
														}
														return value;
													}}
												/>
												<YAxis
													label={{
														value: "pH",
														angle: -90,
														position: "insideLeft",
													}}
													stroke="#999"
												/>
												<Tooltip
													contentStyle={{
														backgroundColor: "rgba(0, 0, 0, 0.95)",
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
													dataKey="finalPH"
													fill="url(#colorFinalPH)"
													stroke="#3b82f6"
													strokeWidth={2}
													name="Final pH"
												/>
												<Area
													type="monotone"
													dataKey="rawPH"
													fill="#e0e7ff"
													stroke="#e0e7ff"
													strokeWidth={2}
													name="Raw pH"
												/>
											</ComposedChart>
										</ResponsiveContainer>
									</motion.div>
								</div>
							</motion.div>

							{/* {!postLimePredictions && (
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
											POST-LIME DOSE&quot; to generate predictions
										</p>
									</div>
								</motion.div>
							)} */}
						</div>
					</div>
				</section>
			)}
		</div>
	);
}
