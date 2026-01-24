"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Check if user is already logged in
		const savedUser = localStorage.getItem("user");
		if (savedUser) {
			try {
				setUser(JSON.parse(savedUser));
			} catch (error) {
				console.error("Failed to parse user from localStorage:", error);
				localStorage.removeItem("user");
			}
		}
		setLoading(false);
	}, []);

	const register = async (email, password, name) => {
		try {
			// Mock registration - in production, call your API
			const newUser = {
				id: Date.now().toString(),
				email,
				name,
				createdAt: new Date().toISOString(),
			};
			localStorage.setItem("user", JSON.stringify(newUser));
			setUser(newUser);
			return { success: true };
		} catch (error) {
			console.error("Registration error:", error);
			return { success: false, error: error.message };
		}
	};

	const login = async (email, password) => {
		try {
			// Mock login - in production, call your API
			// For now, accept any email/password combination
			const user = {
				id: Date.now().toString(),
				email,
				name: email.split("@")[0],
				loginTime: new Date().toISOString(),
			};
			localStorage.setItem("user", JSON.stringify(user));
			setUser(user);
			return { success: true };
		} catch (error) {
			console.error("Login error:", error);
			return { success: false, error: error.message };
		}
	};

	const logout = () => {
		localStorage.removeItem("user");
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
