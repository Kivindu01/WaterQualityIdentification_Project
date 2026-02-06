"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Check if user and token are already logged in
		const savedUser = localStorage.getItem("user");
		const savedToken = localStorage.getItem("access_token");
		if (savedUser && savedToken) {
			try {
				setUser(JSON.parse(savedUser));
				setToken(savedToken);
			} catch (error) {
				console.error("Failed to parse user/token from localStorage:", error);
				localStorage.removeItem("user");
				localStorage.removeItem("access_token");
			}
		}
		setLoading(false);
	}, []);

	const register = async (email, password, name) => {
		try {
			const response = await fetch(
				"http://localhost:5001/api/v1/auth/register",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email,
						password,
					}),
				},
			);

			if (!response.ok) {
				const errorData = await response.json();
				return {
					success: false,
					error: errorData.message || "Registration failed",
				};
			}

			const data = await response.json();
			return { success: true };
		} catch (error) {
			console.error("Registration error:", error);
			return { success: false, error: error.message };
		}
	};

	const login = async (email, password) => {
		try {
			const response = await fetch("http://localhost:5001/api/v1/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					password,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				return {
					success: false,
					error: errorData.message || "Login failed",
				};
			}

			const data = await response.json();
			const accessToken = data.data.access_token;
			const userEmail = data.data.email;

			const userData = {
				email: userEmail,
				name: userEmail.split("@")[0],
				loginTime: new Date().toISOString(),
			};

			localStorage.setItem("user", JSON.stringify(userData));
			localStorage.setItem("access_token", accessToken);
			setUser(userData);
			setToken(accessToken);

			return { success: true };
		} catch (error) {
			console.error("Login error:", error);
			return { success: false, error: error.message };
		}
	};

	const logout = () => {
		localStorage.removeItem("user");
		localStorage.removeItem("access_token");
		setUser(null);
		setToken(null);
	};

	return (
		<AuthContext.Provider
			value={{ user, token, loading, login, register, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}
