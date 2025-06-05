import { ApiResponse } from "@/types/apiResponse";
import { user } from "@/types/userTypes";
import axios from "axios";

export async function fetchUser(): Promise<ApiResponse<user>> {
  const res = await axios.get<ApiResponse<user>>(
    `${process.env.NEXT_PUBLIC_SERVER_API}/auth/get-user`,
    {
      withCredentials: true,
    }
  );

  return res.data;
}

export async function logoutUser(): Promise<ApiResponse<undefined>> {
  const res = await axios.get<ApiResponse<undefined>>(
    `${process.env.NEXT_PUBLIC_SERVER_API}/auth/logout`,
    {
      withCredentials: true,
    }
  );
  return res.data;
}

export async function deleteUserAccount(): Promise<ApiResponse<undefined>> {
  const res = await axios.get<ApiResponse<undefined>>(
    `${process.env.NEXT_PUBLIC_SERVER_API}/auth/delete-account`,
    {
      withCredentials: true,
    }
  );

  return res.data;
}

type userFeedbackParams = {
  rating: number;
  feedback?: string;
};

export async function addUserFeedback(
  params: userFeedbackParams
): Promise<ApiResponse<undefined>> {
  const res = await axios.post<ApiResponse<undefined>>(
    `${process.env.NEXT_PUBLIC_SERVER_API}/auth/add-feedback`,
    {
      rating: params.rating,
      feedback: params.feedback,
    },
    {
      withCredentials: true,
    }
  );

  return res.data;
}
