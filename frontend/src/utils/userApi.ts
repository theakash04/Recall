import { ApiResponse } from "@/types/apiResponse";
import { testimonials } from "@/types/userTypes";
import api from "./apiClient";


export async function deleteUserAccount(): Promise<ApiResponse<undefined>> {
  const { data } = await api.get<ApiResponse<undefined>>(
    `/auth/delete-account`
  );

  return data;
}

type userFeedbackParams = {
  rating: number;
  feedback?: string;
};

export async function addUserFeedback(
  params: userFeedbackParams
): Promise<ApiResponse<undefined>> {
  const { data } = await api.post<ApiResponse<undefined>>(
    `/auth/add-feedback`,
    {
      rating: params.rating,
      feedback: params.feedback,
    }
  );

  return data;
}

export async function getUserTestimonials(): Promise<
  ApiResponse<testimonials[]>
> {
  const { data } = await api.get<ApiResponse<testimonials[]>>(
    `/auth/get-feedbacks`,
    {
      withCredentials: true,
    }
  );
  return data;
}
