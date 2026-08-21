import { deleteSecureItem, saveSecureItem } from "../utils/secureStorage";

export interface SessionTokens {
	accessToken: string | null;
	refreshToken: string | null;
}

type TokenListener = (tokens: SessionTokens) => void;

let tokens: SessionTokens = { accessToken: null, refreshToken: null };
let expiredHandler: (() => void) | null = null;
const listeners = new Set<TokenListener>();

const notify = () => {
	listeners.forEach((listener) => listener(tokens));
};

/**
 * Holds the live access/refresh tokens outside of React so the plain
 * apiRequest() module can read the current refresh token and silently mint a
 * new access token on a 401, without importing React context. AuthContext
 * subscribes to stay in sync whenever tokens change from any source
 * (login, background refresh, or expiry).
 */
export const authSession = {
	setTokens(next: SessionTokens) {
		tokens = next;
		notify();
	},

	getTokens: (): SessionTokens => tokens,

	subscribe(listener: TokenListener): () => void {
		listeners.add(listener);
		return () => listeners.delete(listener);
	},

	setExpiredHandler(handler: (() => void) | null) {
		expiredHandler = handler;
	},

	async expire() {
		tokens = { accessToken: null, refreshToken: null };
		await Promise.all([deleteSecureItem("accessToken"), deleteSecureItem("refreshToken")]);
		notify();
		expiredHandler?.();
	},

	async setAccessToken(newAccessToken: string) {
		tokens = { ...tokens, accessToken: newAccessToken };
		await saveSecureItem("accessToken", newAccessToken);
		notify();
	},
};
