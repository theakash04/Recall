import { ErrorResponse, SuccessResponse } from "@repo/utils/sharedTypes";

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
