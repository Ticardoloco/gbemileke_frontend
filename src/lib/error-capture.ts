interface CapturedError {
  error: unknown;
  at: number;
}

const TTL_MS = 5_000;

// Attach to globalThis to preserve reference across HMR updates in development
const globalForError = globalThis as unknown as {
  _lastCapturedError?: CapturedError;
};

function record(error: unknown) {
  globalForError._lastCapturedError = { error, at: Date.now() };
}

// Hook into global runtime unhandled rejections/uncaught errors
if (typeof window === "undefined") {
  process.on("uncaughtException", (error) => {
    record(error);
    // Note: It's good practice to log or crash here, but we record for the consumer first
  });

  process.on("unhandledRejection", (reason) => {
    record(reason);
  });
} else if (typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (event) => record(event.error ?? event));
  globalThis.addEventListener("unhandledrejection", (event) => record(event.reason));
}

export function consumeLastCapturedError(): unknown {
  const lastError = globalForError._lastCapturedError;
  if (!lastError) return undefined;

  if (Date.now() - lastError.at > TTL_MS) {
    globalForError._lastCapturedError = undefined;
    return undefined;
  }

  const { error } = lastError;
  globalForError._lastCapturedError = undefined;
  return error;
}