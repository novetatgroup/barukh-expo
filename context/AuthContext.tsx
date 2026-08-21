import React, { createContext, useState, useEffect, ReactNode } from "react";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { refreshAccessToken } from "../services/api";
import { authSession } from "../services/authSession";
import { getSecureItem } from "../utils/secureStorage";

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

const extractUserId = (token: string): string | null => {
	const decoded: DecodedToken = jwtDecode(token);
	return typeof decoded.userId === "string" || typeof decoded.userId === "number"
		? String(decoded.userId)
		: null;
};

const LOGGED_OUT_STATE: AuthState = {
	accessToken: null,
	refreshToken: null,
	isAuthenticated: false,
	userId: null,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [authState, setAuthStateInternal] = useState<AuthState>(LOGGED_OUT_STATE);
	const [loading, setLoading] = useState(true);

	// authSession is the single source of truth for the live tokens (it's what
	// apiRequest's 401-retry logic reads/writes, since that plain module can't
	// use React context). Whenever it changes - from login, a silent
	// background refresh, or expiry - mirror it into React state here.
	useEffect(() => {
		const unsubscribe = authSession.subscribe(({ accessToken, refreshToken }) => {
			if (!accessToken) {
				setAuthStateInternal(LOGGED_OUT_STATE);
				return;
			}
			const userId = extractUserId(accessToken);
			setAuthStateInternal({
				accessToken,
				refreshToken,
				isAuthenticated: Boolean(userId),
				userId,
			});
		});

		authSession.setExpiredHandler(() => {
			router.replace("/(auth)");
		});

		return () => {
			unsubscribe();
			authSession.setExpiredHandler(null);
		};
	}, []);

	useEffect(() => {
		const loadAuthState = async () => {
			try {
				const [token, refreshToken] = await Promise.all([
					getSecureItem("accessToken"),
					getSecureItem("refreshToken"),
				]);

				authSession.setTokens({ accessToken: token, refreshToken });

				if (token) {
					const decoded: DecodedToken = jwtDecode(token);
					const currentTime = Date.now() / 1000;
					const isExpired = Boolean(decoded.exp && Number(decoded.exp) < currentTime);

					if (!isExpired) return; // subscriber above already applied the state

					// The access token has expired (e.g. the app was killed and reopened
					// after enough time passed) - try the refresh token before forcing a
					// fresh login. Only clears the session if refreshing actually fails.
					await refreshAccessToken();
					return;
				}

				if (refreshToken) {
					await refreshAccessToken();
				}
			} catch {
				await authSession.expire();
			} finally {
				setLoading(false);
			}
		};

		loadAuthState();
	}, []);

	const setAuthState = async (state: AuthState) => {
		authSession.setTokens({ accessToken: state.accessToken, refreshToken: state.refreshToken });
	};

	const authFetch = async (url: string, options: RequestInit = {}) => {
		let token = authSession.getTokens().accessToken;
		if (!token) throw new Error("No access token found");

		const decoded: DecodedToken = jwtDecode(token);
		const currentTime = Date.now() / 1000;

		if (decoded.exp && Number(decoded.exp) < currentTime) {
			const refreshed = await refreshAccessToken();
			if (!refreshed) throw new Error("Token expired");
			token = refreshed;
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
			Authorization: `Bearer ${token}`,
			...(isFormData ? {} : { "Content-Type": "application/json" }),
		};

		return fetch(url, { ...options, headers });
	};

	const logout = async () => {
		await authSession.expire();
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
