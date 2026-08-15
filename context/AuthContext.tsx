import React, { createContext, useState, useEffect, ReactNode } from "react";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import {
	deleteSecureItem,
	getSecureItem,
	saveSecureItem,
} from "../utils/secureStorage";

interface DecodedToken {
	userId: string | number;
	issuer?: string;
	exp: string;
}

interface AuthState {
	accessToken: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	userId: string | null;
}

interface AuthContextType extends AuthState {
	setAuthState: (state: AuthState) => void;
	logout: () => Promise<void>;
	authFetch: (url: string, options?: RequestInit) => Promise<Response>;
	loading: boolean;
}

export const AuthContext = createContext<AuthContextType>(
	{} as AuthContextType
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [authState, setAuthStateInternal] = useState<AuthState>({
		accessToken: null,
		refreshToken: null,
		isAuthenticated: false,
		userId: null,
	});

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadAuthState = async () => {
			try {
				const [token, refreshToken] = await Promise.all([
					getSecureItem("accessToken"),
					getSecureItem("refreshToken"),
				]);

				if (token) {
					const decoded: DecodedToken = jwtDecode(token);
					const currentTime = Date.now() / 1000;

					if (decoded.exp && Number(decoded.exp) < currentTime) {
						await Promise.all([
							deleteSecureItem("accessToken"),
							deleteSecureItem("refreshToken"),
						]);
						setAuthStateInternal({
							accessToken: null,
							refreshToken: null,
							isAuthenticated: false,
							userId: null,
						});
					} else {
						const userId = typeof decoded.userId === 'string' || typeof decoded.userId === 'number'
							? String(decoded.userId)
							: null;

						if (!userId) {
							await deleteSecureItem("accessToken");
							setAuthStateInternal({
								accessToken: null,
								refreshToken: null,
								isAuthenticated: false,
								userId: null,
							});
							return;
						}

						setAuthStateInternal({
							accessToken: token,
							refreshToken,
							isAuthenticated: true,
							userId: userId,
						});
					}
				} else if (refreshToken) {
					// A refresh endpoint is not confirmed, so an orphaned refresh token
					// cannot safely restore the session.
					await deleteSecureItem("refreshToken");
				}
			} catch {
				await Promise.all([
					deleteSecureItem("accessToken"),
					deleteSecureItem("refreshToken"),
				]);
			} finally {
				setLoading(false);
			}
		};

		loadAuthState();
	}, []);

	const setAuthState = async (state: AuthState) => {
		setAuthStateInternal(state);
		if (state.accessToken) {
			await saveSecureItem("accessToken", state.accessToken);
		}
		if (state.refreshToken) {
			await saveSecureItem("refreshToken", state.refreshToken);
		}
	};

	const authFetch = async (url: string, options: RequestInit = {}) => {
		const token = authState.accessToken;
		if (!token) throw new Error("No access token found");

		const decoded: DecodedToken = jwtDecode(token);
		const currentTime = Date.now() / 1000;

		if (decoded.exp && Number(decoded.exp) < currentTime) {
			await logout();
			throw new Error("Token expired");
		}

		let existingHeaders: Record<string, string> = {};

		if (options.headers instanceof Headers) {
			existingHeaders = Object.fromEntries(options.headers.entries());
		} else if (Array.isArray(options.headers)) {
			existingHeaders = Object.fromEntries(options.headers);
		} else if (
			typeof options.headers === "object" &&
			options.headers !== null
		) {
			existingHeaders = options.headers as Record<string, string>;
		}

     const isFormData = options.body instanceof FormData;

		const headers: Record<string, string> = {
			...existingHeaders,
			Authorization: `Bearer ${authState.accessToken}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }), 
		};

		return fetch(url, { ...options, headers });
	};

	const logout = async () => {
		await deleteSecureItem("accessToken");
		await deleteSecureItem("refreshToken");

		setAuthStateInternal({
			accessToken: null,
			refreshToken: null,
			isAuthenticated: false,
			userId: null,
		});

		router.replace("/(auth)");
	};
	return (
		<AuthContext.Provider
			value={{ ...authState, setAuthState, logout, authFetch, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
