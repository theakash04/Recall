type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export type SuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
};

export default ApiResponse;
