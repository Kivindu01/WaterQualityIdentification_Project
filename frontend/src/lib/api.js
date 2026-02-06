import axios from "axios";

// Create axios instance with base configuration
const apiClient = axios.create({
	baseURL: "http://localhost:5001/api/v1",
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add token to all requests
apiClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("access_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Clear auth data and redirect to login
			localStorage.removeItem("access_token");
			localStorage.removeItem("user");
			// Use window.location for redirect (works in Next.js client components)
			if (typeof window !== "undefined") {
				window.location.href = "/login";
			}
		}
		return Promise.reject(error);
	},
);

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
				settled_ph: data.predicted_settled_pH,
				conformal_interval: {
					lower: data.conformal_interval.lower_pH,
					upper: data.conformal_interval.upper_pH,
				},
				safe_band: data.safe_band,
				shap_explanation: data.shap_explanation,
				explanation: data.ambatale_explanation_pre, 
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
				explanation: data.ambatale_explanation_post,
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
			const response = await apiClient.post("/classify/predict", {
				ph: parseFloat(rawWaterPH),
				turbidity: parseFloat(rawWaterTurbidity),
				conductivity: parseFloat(rawWaterConductivity),
			});
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
			const response = await apiClient.post("/normal-regression/predict", {
				ph: parseFloat(rawWaterPH),
				turbidity: parseFloat(rawWaterTurbidity),
				conductivity: parseFloat(rawWaterConductivity),
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
			const response = await apiClient.post("/advance-regression/predict", {
				ph: parseFloat(rawWaterPH),
				turbidity: parseFloat(rawWaterTurbidity),
				conductivity: parseFloat(rawWaterConductivity),
				raw_water_flow: parseFloat(rawWaterFlow),
				d_chamber_flow: parseFloat(dChamberFlow),
				aerator_flow: parseFloat(aeratorFlow),
			});
			return response.data;
		} catch (error) {
			throw new Error(
				error.response?.data?.message ||
					error.message ||
					"Failed to predict alum dosage with advanced model",
			);
		}
	},

	// Get Alum Dosing History (Advanced Model)
	getAlumHistory: async (startDate, endDate) => {
		try {
			const response = await apiClient.get("/history/advance-regression", {
				params: { start_date: startDate, end_date: endDate },
			});
			return response.data.data || [];
		} catch (error) {
			throw new Error(
				error.response?.data?.message ||
					error.message ||
					"Failed to fetch alum history",
			);
		}
	},
};

export default apiClient;