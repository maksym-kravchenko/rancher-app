import { timingSafeEqual } from "crypto";

/**
 * Constant-time string comparison. Returns false for length mismatches
 * (length is not secret here) and avoids the timing side-channel of `===`.
 */
export function safeEqual(a: string, b: string): boolean {
    const aBuf = Buffer.from(a, "utf8");
    const bBuf = Buffer.from(b, "utf8");
    if (aBuf.length !== bBuf.length) {
        return false;
    }
    return timingSafeEqual(aBuf, bBuf);
}

/**
 * Extracts the credential from an `Authorization: Bearer <token>` header.
 * Returns null when the header is missing or malformed.
 */
export function bearerToken(header: string | null): string | null {
    if (!header) return null;
    const match = /^Bearer\s+(.+)$/i.exec(header.trim());
    return match ? match[1] : null;
}
