export async function withRetry(fn, { attempts = 3, backoffMs = 500 } = {}) {
    let lastErr;
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn(i);
        } catch (err) {
            lastErr = err;
            if (i < attempts - 1) await new Promise(r => setTimeout(r, backoffMs * Math.pow(2, i)));
        }
    }
    throw lastErr;
}