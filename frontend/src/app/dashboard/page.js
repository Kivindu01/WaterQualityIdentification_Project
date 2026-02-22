"use client";

import React, { useState, useEffect, useCallback } from "react";
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
} from "recharts";
import { BsWifi, BsCheck } from "react-icons/bs";
import { MdHistory } from "react-icons/md";
import { API } from "@/lib/api";

export default function Dashboard() {
	const [timeRange, setTimeRange] = useState("15 min");
	const [dashboardData, setDashboardData] = useState(null);
	const [sensorData, setSensorData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [trendsData, setTrendsData] = useState([]);
	const [postlmeSensorData, setPostLmeSensorData] = useState([]);
	const [alumSensorData, setAlumSensorData] = useState([]);
	const [isMounted, setIsMounted] = useState(false);
	const [showLimeDialog, setShowLimeDialog] = useState(false);
	const [showAlumDialog, setShowAlumDialog] = useState(false);

	// Fetch sensor data from API
	const fetchSensorData = useCallback(async () => {
		try {
			const now = new Date();

			// Calculate time range based on selection
			let startDate;
			switch (timeRange) {
				case "15 min":
					startDate = new Date(now.getTime() - 15 * 60 * 1000);
					break;
				case "1 hr":
					startDate = new Date(now.getTime() - 60 * 60 * 1000);
					break;
				case "24 hr":
					startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
					break;
				default:
					startDate = new Date(now.getTime() - 15 * 60 * 1000);
			}

			const startDateStr = startDate.toISOString().split(".")[0];
			const endDateStr = now.toISOString().split(".")[0];

			// const startDateStr = "2026-02-01T00:00:00";
			// const endDateStr = "2026-02-22T23:59:59";

			const response = await API.getSensorData(startDateStr, endDateStr);
			const dataArray = response?.data || [];

			if (!Array.isArray(dataArray) || dataArray.length === 0) return;

			// Fetch Alum and PostLime data
			let latestAlum = null;
			let latestPostLime = null;

			try {
				const alumResponse = await API.getAlumSensorData?.(
					startDateStr,
					endDateStr,
				);
				const alumData = alumResponse?.data || [];
				if (Array.isArray(alumData)) {
					// Store latest data at index 0, but reverse for chart display
					latestAlum = alumData[0];
					const reversedAlum = [...alumData].reverse();
					// Keep latest at front for easy access in displays
					setAlumSensorData([...alumData]);
				}
			} catch (err) {
				console.error("Error fetching alum sensor data:", err);
			}

			try {
				const postLimeResponse = await API.getPostLimeSensorData?.(
					startDateStr,
					endDateStr,
				);
				const postLimeData = postLimeResponse?.data || [];
				if (Array.isArray(postLimeData)) {
					// Store latest data at index 0, but reverse for chart display
					latestPostLime = postLimeData[0];
					const reversedPostLime = [...postLimeData].reverse();
					// Keep latest at front for easy access in displays
					setPostLmeSensorData([
						latestPostLime,
						...reversedPostLime.slice(0, -1),
					]);
				}
			} catch (err) {
				console.error("Error fetching post-lime sensor data:", err);
			}

			// ✅ Reverse array to show latest first (descending order)
			const reversedData = [...dataArray].reverse();

			// ✅ Use first item (which is latest after reverse)
			const latestData = dataArray[0];

			// Store latest at index 0 for easy access, then reversed array for chart
			setSensorData([latestData, ...reversedData.slice(0, -1)]);

			const rawInputs = latestData.raw_inputs || {};
			const prediction = latestData.prediction || {};

			setDashboardData({
				lastUpdate: latestData.predicted_at,
				status: "Connected",
				ph: rawInputs.raw_ph?.toFixed(2) || "---",
				turbidity: rawInputs.raw_turbidity?.toFixed(2) || "---",
				conductivity: rawInputs.raw_conductivity?.toFixed(0) || "---",
				recommendedDose: prediction.recommended_dose_ppm?.toFixed(2) || "---",
				settledPH: prediction.predicted_settled_pH?.toFixed(3) || "---",
				conformalInterval: prediction.conformal_interval?.upper_pH
					? (
							prediction.conformal_interval.upper_pH -
							prediction.conformal_interval.lower_pH
						).toFixed(3)
					: "---",
				alumRecommendedDose:
					latestAlum?.prediction?.recommended_dose_ppm?.toFixed(2) || "---",
				postLimeRecommendedDose:
					latestPostLime?.prediction?.recommended_post_lime_dose_ppm?.toFixed(2) || "---",
			});

			// ✅ Always create new array reference - no need to reverse again since already reversed
			const chartData = reversedData.map((item) => {
				const time = new Date(item.predicted_at);
				// Add 5 hours and 30 minutes
				time.setTime(time.getTime() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000);
				return {
					time: time,
					timeString: time.toLocaleTimeString(),
					pH: item.raw_inputs?.raw_ph ?? 0,
					Turbidity: item.raw_inputs?.raw_turbidity ?? 0,
					Conductivity: item.raw_inputs?.raw_conductivity ?? 0,
				};
			});
			setTrendsData([...chartData]);

			setLoading(false);
		} catch (error) {
			console.error("Error fetching sensor data:", error);
			setLoading(false);
		}
	}, [timeRange]);

	// Set up interval to fetch data every 10 seconds
	useEffect(() => {
		let isMountedLocal = true;

		const initData = async () => {
			if (isMountedLocal) {
				setIsMounted(true);
				await fetchSensorData();
			}
		};

		initData();

		const interval = setInterval(() => {
			if (isMountedLocal) {
				fetchSensorData();
			}
		}, 10000);

		return () => {
			isMountedLocal = false;
			clearInterval(interval);
		};
	}, [fetchSensorData]);

	const metrics = [
		{
			name: "pH Level",
			value: dashboardData?.ph || "---",
			unit: "",
			status: "Normal",
			statusColor: "text-blue-600 dark:text-blue-400",
			borderColor: "border-blue-200 dark:border-blue-800",
			bgColor:
				"bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30",
		},
		{
			name: "Turbidity",
			value: dashboardData?.turbidity || "---",
			unit: "NTU",
			status: "High",
			statusColor: "text-cyan-600 dark:text-cyan-400",
			borderColor: "border-cyan-200 dark:border-cyan-800",
			bgColor:
				"bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/30 dark:to-teal-900/30",
		},
		{
			name: "Conductivity",
			value: dashboardData?.conductivity || "---",
			unit: "μS/cm",
			status: "Stable",
			statusColor: "text-emerald-600 dark:text-emerald-400",
			borderColor: "border-emerald-200 dark:border-emerald-800",
			bgColor:
				"bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30",
		},
	];

	const dosingCards = [
		{
			title: "Raw Water Forecaster",
			suggestedDose: "---",
			bgGradient: "from-blue-400 to-blue-600",
		},
		{
			title: "Chlorine Dosing",
			suggestedDose: "---",
			bgGradient: "from-yellow-400 to-orange-500",
		},
		{
			title: "Alum Dosing",
			suggestedDose: dashboardData?.alumRecommendedDose || "---",
			unit: "mg/L",
			bgGradient: "from-purple-400 to-purple-600",
		},
		{
			title: "Lime Dosing",
			preLimeDose: dashboardData?.recommendedDose || "---",
			postLimeDose: dashboardData?.postLimeRecommendedDose || "---",
			unit: "ppm",
			bgGradient: "from-cyan-400 to-blue-500",
		},
	];

	const tabs = ["Raw Water Forecaster", "Pre-Lime", "Post-Lime", "Chlorine"];

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.2,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5, ease: "easeOut" },
		},
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="min-h-screen bg-white dark:bg-black transition-colors duration-300"
		>
			{/* Header */}
			<div className="border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950 dark:to-black px-6 py-6">
				<div className="mx-auto max-w-7xl">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-extrabold text-black dark:text-white">
								🏠 Ambathale Water Plant Dashboard
							</h1>
						</div>
						<div className="flex items-center gap-8 text-sm">
							<div className="flex items-center gap-2">
								<span className="text-zinc-600 dark:text-zinc-400">
									Last Update:
								</span>
								<span className="font-semibold text-black dark:text-white">
									{isMounted && dashboardData?.lastUpdate
										? new Date(dashboardData.lastUpdate).toLocaleTimeString()
										: "---"}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-zinc-600 dark:text-zinc-400">
									Status:
								</span>
								<span className="font-semibold text-green-600 flex items-center gap-1">
									<BsCheck className="w-4 h-4" />{" "}
									{dashboardData?.status || "Loading"}
								</span>
							</div>
							<BsWifi className="w-5 h-5 text-blue-600" />
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="mx-auto max-w-7xl px-6 py-8">
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="space-y-8"
				>
					{/* Metrics Cards */}
					<motion.div className="grid grid-cols-1 gap-6 md:grid-cols-3">
						{metrics.map((metric, idx) => (
							<motion.div
								key={idx}
								variants={itemVariants}
								whileHover={{ y: -4 }}
								className={`${metric.bgColor} rounded-lg border-2 ${metric.borderColor} p-4 shadow-sm hover:shadow-md transition-shadow`}
							>
								<h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
									{metric.name}
								</h3>
								<div className="flex items-end justify-between">
									<div>
										<div className={`text-6xl font-bold ${metric.statusColor}`}>
											{metric.value}
										</div>
										<div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
											{metric.unit}
										</div>
									</div>
									<div
										className={`text-xs font-semibold ${metric.statusColor}`}
									>
										{metric.status}
									</div>
								</div>
							</motion.div>
						))}
					</motion.div>

					{/* Water Quality Trends */}
					<motion.div
						variants={itemVariants}
						className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-900 shadow-sm"
					>
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-bold text-black dark:text-white">
								Water Quality Trends
							</h2>
							<div className="flex gap-2">
								{["15 min", "1 hr", "24 hr"].map((range) => (
									<button
										key={range}
										onClick={() => setTimeRange(range)}
										value={timeRange}
										className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
											timeRange === range
												? "bg-blue-600 text-white"
												: "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700"
										}`}
									>
										{range}
									</button>
								))}
							</div>
						</div>

						<ResponsiveContainer width="100%" height={300}>
							<LineChart key={trendsData.length} data={trendsData}>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="#e4e4e7"
									className="dark:stroke-zinc-700"
								/>
								<XAxis
									dataKey="timeString"
									stroke="#71717a"
									className="dark:stroke-zinc-500"
								/>
								<YAxis stroke="#71717a" className="dark:stroke-zinc-500" />
								<Tooltip
									contentStyle={{
										backgroundColor: "#fff",
										border: "1px solid #e4e4e7",
										borderRadius: "8px",
									}}
									className="dark:bg-zinc-900 dark:border-zinc-700"
								/>
								<Legend />
								<Line
									type="monotone"
									dataKey="pH"
									stroke="#3b82f6"
									dot={false}
									strokeWidth={2}
								/>
								<Line
									type="monotone"
									dataKey="Turbidity"
									stroke="#ef4444"
									dot={false}
									strokeWidth={2}
								/>
								<Line
									type="monotone"
									dataKey="Conductivity"
									stroke="#8b5cf6"
									dot={false}
									strokeWidth={2}
								/>
							</LineChart>
						</ResponsiveContainer>
					</motion.div>

					{/* Dosing Suggestion Cards */}
					<motion.div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
						{dosingCards.map((card, idx) => (
							<motion.div
								key={idx}
								variants={itemVariants}
								className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-zinc-900"
							>
								<div
									className={`bg-gradient-to-r ${card.bgGradient} h-20 flex items-center justify-center`}
								>
									<h3 className="text-white text-center font-semibold text-sm px-2">
										{card.title}
									</h3>
								</div>
								<div className="p-4">
									{card.title === "Lime Dosing" ? (
										// Lime Dosing: Show Pre and Post Lime
										<div className="mb-4">
											<div className="mb-3">
												<p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
													Pre-Lime Dose:
												</p>
												<p className="text-lg font-bold text-blue-600 dark:text-blue-400">
													{card.preLimeDose} {card.unit}
												</p>
											</div>
											<div>
												<p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
													Post-Lime Dose:
												</p>
												<p className="text-lg font-bold text-blue-600 dark:text-blue-400">
													{card.postLimeDose} {card.unit}
												</p>
											</div>
										</div>
									) : (
										// Other cards: Show Suggested Dose
										<div className="mb-4">
											<p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
												Suggested Dose:
											</p>
											<p className="text-lg font-bold text-black dark:text-white">
												{card.suggestedDose}
											</p>
											{card.unit && (
												<p className="text-xs text-zinc-500 dark:text-zinc-400">
													{card.unit}
												</p>
											)}
										</div>
									)}
									<button
										onClick={() => {
											if (card.title === "Lime Dosing") {
												setShowLimeDialog(true);
											} else if (card.title === "Alum Dosing") {
												setShowAlumDialog(true);
											}
										}}
										className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm font-medium"
									>
										<MdHistory className="w-4 h-4" />
										Compare History
									</button>
								</div>
							</motion.div>
						))}
					</motion.div>
				</motion.div>
			</div>

			{/* Lime Dosing History Dialog */}
			{showLimeDialog && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
					>
						<div className="sticky top-0 bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
							<h2 className="text-2xl font-bold text-white">
								Lime Dosing History
							</h2>
							<button
								onClick={() => setShowLimeDialog(false)}
								className="text-white hover:text-zinc-200 text-2xl"
							>
								×
							</button>
						</div>

						<div className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
								{/* Pre-Lime Section */}
								<div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
									<h3 className="text-lg font-bold text-black dark:text-white mb-4">
										Pre-Lime Data
									</h3>
									<div className="space-y-3">
										<div>
											<p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
												Recommended Pre-Lime Dose
											</p>
											<p className="text-lg font-bold text-blue-600 dark:text-blue-400">
												{sensorData[0]?.prediction?.recommended_dose_ppm?.toFixed(
													2,
												) || "---"}{" "}
												ppm
											</p>
										</div>
										<div>
											<p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
												Predicted Settled pH
											</p>
											<p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
												{sensorData[0]?.prediction?.predicted_settled_pH?.toFixed(
													3,
												) || "---"}
											</p>
										</div>
										<div>
											<p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
												Conformal Interval
											</p>
											<p className="text-lg font-bold text-teal-600 dark:text-teal-400">
												{sensorData[0]?.prediction?.conformal_interval
													?.upper_pH &&
												sensorData[0]?.prediction?.conformal_interval?.lower_pH
													? (
															sensorData[0].prediction.conformal_interval
																.upper_pH -
															sensorData[0].prediction.conformal_interval
																.lower_pH
														).toFixed(3)
													: "---"}
											</p>
										</div>
									</div>
								</div>

								{/* Post-Lime Section */}
								<div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
									<h3 className="text-lg font-bold text-black dark:text-white mb-4">
										Post-Lime Data
									</h3>
									<div className="space-y-3">
										<div>
											<p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
												Recommended Post-Lime Dose
											</p>
											<p className="text-lg font-bold text-purple-600 dark:text-purple-400">
												{postlmeSensorData[0]?.prediction?.recommended_post_lime_dose_ppm?.toFixed(
													2,
												) || "---"}{" "}
												ppm
											</p>
										</div>
										<div>
											<p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
												Predicted Final pH
											</p>
											<p className="text-lg font-bold text-pink-600 dark:text-pink-400">
												{postlmeSensorData[0]?.prediction?.predicted_final_pH_sph2?.toFixed(
													3,
												) || "---"}
											</p>
										</div>
										<div>
											<p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
												Conformal Interval
											</p>
											<p className="text-lg font-bold text-rose-600 dark:text-rose-400">
												{postlmeSensorData[0]?.prediction?.conformal_interval
													?.upper_pH &&
												postlmeSensorData[0]?.prediction?.conformal_interval
													?.lower_pH
													? (
															postlmeSensorData[0].prediction.conformal_interval
																.upper_pH -
															postlmeSensorData[0].prediction.conformal_interval
																.lower_pH
														).toFixed(3)
													: "---"}
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* History Chart */}
							<div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-900">
								<h3 className="text-lg font-bold text-black dark:text-white mb-4">
									pH Level Trends - Pre vs Post Lime
								</h3>
								<ResponsiveContainer width="100%" height={300}>
									<LineChart data={sensorData}>
										<CartesianGrid
											strokeDasharray="3 3"
											stroke="#e4e4e7"
											className="dark:stroke-zinc-700"
										/>
										<XAxis
											dataKey={(item) => {
												const date = new Date(item.predicted_at);
												date.setTime(
													date.getTime() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000,
												);
												return date.toLocaleTimeString();
											}}
											stroke="#71717a"
											className="dark:stroke-zinc-500"
										/>
										<YAxis stroke="#71717a" className="dark:stroke-zinc-500" />
										<Tooltip
											contentStyle={{
												backgroundColor: "#fff",
												border: "1px solid #e4e4e7",
												borderRadius: "8px",
											}}
											className="dark:bg-zinc-900 dark:border-zinc-700"
										/>
										<Legend />
										<Line
											type="monotone"
											dataKey={(item) => item.raw_inputs?.raw_ph ?? 0}
											name="Raw pH"
											stroke="#3b82f6"
											dot={false}
											strokeWidth={2}
										/>
										<Line
											type="monotone"
											dataKey={(item) =>
												item.prediction?.predicted_settled_pH ?? 0
											}
											name="Settled pH"
											stroke="#8b5cf6"
											dot={false}
											strokeWidth={2}
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</div>
					</motion.div>
				</div>
			)}

			{/* Alum Dosing History Dialog */}
			{showAlumDialog && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
					>
						<div className="sticky top-0 bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
							<h2 className="text-2xl font-bold text-white">
								Alum Dosing History
							</h2>
							<button
								onClick={() => setShowAlumDialog(false)}
								className="text-white hover:text-zinc-200 text-2xl"
							>
								×
							</button>
						</div>

						<div className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
								{/* Recommended Alum Dosage */}
								<div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
									<h3 className="text-lg font-bold text-black dark:text-white mb-4">
										Recommended Alum Dosage
									</h3>
									<p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
										{alumSensorData[0]?.prediction?.recommended_dose_ppm?.toFixed(
											2,
										) || "---"}{" "}
										ppm
									</p>
									<p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
										Current dosage recommendation
									</p>
								</div>

								{/* Predicted Settled Water Turbidity */}
								<div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
									<h3 className="text-lg font-bold text-black dark:text-white mb-4">
										Turbidity (Settled)
									</h3>
									<p className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">
										{alumSensorData[0]?.prediction?.predicted_settled_turbidity?.toFixed(
											2,
										) || "---"}{" "}
										NTU
									</p>
									<p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
										Predicted settled water turbidity
									</p>
								</div>

								{/* Comparison Info */}
								<div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
									<h3 className="text-lg font-bold text-black dark:text-white mb-4">
										Dosage Comparison
									</h3>
									<div className="space-y-2">
										<p className="text-sm">
											<span className="font-semibold text-orange-600 dark:text-orange-400">
												9 ppm:
											</span>
											<span className="ml-2">
												{alumSensorData[0]?.prediction?.predictions?.dose_9_turbidity?.toFixed(
													2,
												) || "---"}{" "}
											</span>
										</p>
										<p className="text-sm">
											<span className="font-semibold text-yellow-600 dark:text-yellow-400">
												10 ppm:
											</span>
											<span className="ml-2">
												{alumSensorData[0]?.prediction?.predictions?.dose_10_turbidity?.toFixed(
													2,
												) || "---"}{" "}
											</span>
										</p>
										<p className="text-4xl font-bold text-cyan-600 dark:text-orange-400">
											{alumSensorData[0]?.prediction?.recommended_dose_ppm?.toFixed(
												1,
											) || "---"}{" "}
											ppm
										</p>
										<p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
											Recommended dose (ppm)
										</p>
									</div>
								</div>
							</div>

							{/* Turbidity Trends Chart */}
							<div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-900">
								<h3 className="text-lg font-bold text-black dark:text-white mb-4">
									Turbidity Reduction Over Time
								</h3>
								<ResponsiveContainer width="100%" height={300}>
									<LineChart data={alumSensorData}>
										<CartesianGrid
											strokeDasharray="3 3"
											stroke="#e4e4e7"
											className="dark:stroke-zinc-700"
										/>
										<XAxis
											dataKey={(item) => {
												const date = new Date(item.predicted_at);
												date.setTime(
													date.getTime() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000,
												);
												return date.toLocaleTimeString();
											}}
											stroke="#71717a"
											className="dark:stroke-zinc-500"
										/>
										<YAxis stroke="#71717a" className="dark:stroke-zinc-500" />
										<Tooltip
											contentStyle={{
												backgroundColor: "#fff",
												border: "1px solid #e4e4e7",
												borderRadius: "8px",
											}}
											className="dark:bg-zinc-900 dark:border-zinc-700"
										/>
										<Legend />
										<Line
											type="monotone"
											dataKey={(item) => item.raw_inputs?.turbidity ?? 0}
											name="Raw Turbidity (NTU)"
											stroke="#ef4444"
											dot={false}
											strokeWidth={2}
										/>
										<Line
											type="monotone"
											dataKey={(item) =>
												item.prediction?.recommended_dose_ppm ?? 0
											}
											name="Recommended Dose (ppm)"
											stroke="#8b5cf6"
											dot={false}
											strokeWidth={2}
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</motion.div>
	);
}
