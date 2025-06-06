import { ErrorResponse, SuccessResponse } from "../types/apiResponse";


export function CreateSuccessResponse<T>(
  data: T,
  message?: string
): SuccessResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function CreateErrorResponse(
  code: string,
  message: string,
  details?: string
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}


