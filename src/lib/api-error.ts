import { NextResponse } from "next/server";

/**
 * API Error class with status code
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Common API errors
 */
export const Errors = {
  unauthorized: () => new ApiError("Nicht autorisiert", 401, "UNAUTHORIZED"),
  forbidden: () => new ApiError("Zugriff verweigert", 403, "FORBIDDEN"),
  notFound: (resource = "Ressource") => 
    new ApiError(`${resource} nicht gefunden`, 404, "NOT_FOUND"),
  badRequest: (message = "Ungültige Anfrage") => 
    new ApiError(message, 400, "BAD_REQUEST"),
  validation: (message: string) => 
    new ApiError(message, 422, "VALIDATION_ERROR"),
  internal: (message = "Interner Serverfehler") => 
    new ApiError(message, 500, "INTERNAL_ERROR"),
  conflict: (message = "Ressource existiert bereits") =>
    new ApiError(message, 409, "CONFLICT"),
  rateLimit: () => 
    new ApiError("Zu viele Anfragen. Bitte warten Sie einen Moment.", 429, "RATE_LIMIT"),
} as const;

/**
 * API response helper
 */
export function apiResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * API error response helper
 */
export function apiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { 
        error: error.message, 
        code: error.code 
      },
      { status: error.statusCode }
    );
  }

  // Log unexpected errors
  console.error("Unexpected API error:", error);
  
  return NextResponse.json(
    { 
      error: "Ein unerwarteter Fehler ist aufgetreten", 
      code: "INTERNAL_ERROR" 
    },
    { status: 500 }
  );
}

/**
 * Wrap API handler with error handling
 */
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | { error: string; code?: string }>> {
  return handler().catch((error) => apiError(error));
}

/**
 * Extract error message for client display
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Ein unerwarteter Fehler ist aufgetreten";
}
