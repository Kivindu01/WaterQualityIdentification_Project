import axios from "axios";

// Create axios instance with base configuration
const apiClient = axios.create({
	baseURL: "http://localhost:5001/api/v1",
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 30000, // 30 seconds timeout
});

// API Endpoints
export const API = {
	// Pre-Lime Dosing
	predictPreLime: async (
		rawWaterPH,
		rawWaterTurbidity,
		rawWaterConductivity,
	) => {
		try {
			const response = await apiClient.post("/pre-lime/predict", {
				raw_ph: parseFloat(rawWaterPH),
				raw_turbidity: parseFloat(rawWaterTurbidity),
				raw_conductivity: parseFloat(rawWaterConductivity),
			});

			// Extract and format the response data
			const data = response.data.data;
			return {
				recommended_dose: data.recommended_dose_ppm,
				settled_turbidity: data.predicted_settled_pH,
				conformal_interval: {
					lower: data.conformal_interval.lower_pH,
					upper: data.conformal_interval.upper_pH,
				},
				safe_band: data.safe_band,
				shap_explanation: data.shap_explanation,
			};
		} catch (error) {
			throw new Error(
				error.response?.data?.message ||
					error.message ||
					"Failed to predict pre-lime dosage",
			);
		}
	},

	// Post-Lime Dosing
	predictPostLime: async (
		rawWaterPH,
		rawWaterTurbidity,
		rawWaterConductivity,
	) => {
		try {
			const response = await apiClient.post("/post-lime/predict", {
				raw_ph: parseFloat(rawWaterPH),
				raw_turbidity: parseFloat(rawWaterTurbidity),
				raw_conductivity: parseFloat(rawWaterConductivity),
			});

			// Extract and format the response data
			const data = response.data.data;
			return {
				recommended_dose: data.recommended_post_lime_dose_ppm,
				final_ph: data.predicted_final_pH_sph2,
				conformal_interval: {
					lower: data.conformal_interval.lower_pH,
					upper: data.conformal_interval.upper_pH,
				},
				safe_band: data.safe_band,
				shap_explanation: data.shap_explanation,
			};
		} catch (error) {
			throw new Error(
				error.response?.data?.message ||
					error.message ||
					"Failed to predict post-lime dosage",
			);
		}
	},

	// Alum Dosing
	predictAlumDose: async (
		rawWaterPH,
		rawWaterTurbidity,
		rawWaterConductivity,
	) => {
		try {
			const response = await apiClient.post("/alum-dose/predict", {
				rawWaterPH: parseFloat(rawWaterPH),
				rawWaterTurbidity: parseFloat(rawWaterTurbidity),
				rawWaterConductivity: parseFloat(rawWaterConductivity),
			});
			return response.data;
		} catch (error) {
			throw new Error(
				error.response?.data?.message ||
					error.message ||
					"Failed to predict alum dosage",
			);
		}
	},

	// Get Pre-Lime History
	getPreLimeHistory: async (startDate, endDate) => {
		try {
			const response = await apiClient.get("/history/pre-lime", {
				params: {
					start_date: startDate,
					end_date: endDate,
				},
			});
			return response.data.data || [];
		} catch (error) {
			throw new Error(
				error.response?.data?.message ||
					error.message ||
					"Failed to fetch pre-lime history",
			);
		}
	},

	// Get Post-Lime History
	getPostLimeHistory: async (startDate, endDate) => {
		try {
			const response = await apiClient.get("/history/post-lime", {
				params: {
					start_date: startDate,
					end_date: endDate,
				},
			});
			return response.data.data || [];
		} catch (error) {
			throw new Error(
				error.response?.data?.message ||
					error.message ||
					"Failed to fetch post-lime history",
			);
		}
	},

	// Classify Water Quality (Alum Dosing)
	classifyWaterQuality: async (
		rawWaterPH,
		rawWaterTurbidity,
		rawWaterConductivity,
	) => {
		try {
			const response = await apiClient.post(
				"/classify/predict",
				{
					ph: parseFloat(rawWaterPH),
					turbidity: parseFloat(rawWaterTurbidity),
					conductivity: parseFloat(rawWaterConductivity),
				},
			);
			return response.data.data;
		} catch (error) {
			throw new Error(
				error.response?.data?.message ||
					error.message ||
					"Failed to classify water quality",
			);
		}
	},

	// Alum Dose Prediction (3-Parameter Model)
	predictAlumDoseBasic: async (
		rawWaterPH,
		rawWaterTurbidity,
		rawWaterConductivity,
	) => {
		try {
			const response = await apiClient.post(
				"/normal-regression/predict",
				{
					ph: parseFloat(rawWaterPH),
					turbidity: parseFloat(rawWaterTurbidity),
					conductivity: parseFloat(rawWaterConductivity),
				},
			);
			return response.data;
		} catch (error) {
			throw new Error(
				error.response?.data?.message ||
					error.message ||
					"Failed to predict alum dosage",
			);
		}
	},

	// Alum Dose Prediction (6-Parameter Advanced Model)
	predictAlumDoseAdvanced: async (
		rawWaterPH,
		rawWaterTurbidity,
		rawWaterConductivity,
		rawWaterFlow,
		dChamberFlow,
		aeratorFlow,
	) => {
		try {
			const response = await apiClient.post(
				"/advance-regression/predict",
				{
					ph: parseFloat(rawWaterPH),
					turbidity: parseFloat(rawWaterTurbidity),
					conductivity: parseFloat(rawWaterConductivity),
					raw_water_flow: parseFloat(rawWaterFlow),
					d_chamber_flow: parseFloat(dChamberFlow),
					aerator_flow: parseFloat(aeratorFlow),
				},
			);
			return response.data;
		} catch (error) {
			throw new Error(
				error.response?.data?.message ||
					error.message ||
					"Failed to predict alum dosage with advanced model",
			);
		}
	},
};

export default apiClient;
