import { ApiResponse } from "@/types/apiResponse";
import { bookmark, newBookmark } from "@/types/bookmarkTypes";
import { ErrorResponse } from "@repo/utils/sharedTypes";
import axios from "axios";

export async function fetchBookmarks(): Promise<ApiResponse<bookmark[]>> {
  const response = await axios.get<ApiResponse<bookmark[]>>(
    `${process.env.NEXT_PUBLIC_SERVER_API}/get-all-bookmarks`,
    {
      withCredentials: true,
    }
  );

  return response.data;
}

export async function addBookmark(
  bookmarks: newBookmark
): Promise<ApiResponse<bookmark>> {
  const response = await axios.post<ApiResponse<bookmark>>(
    `${process.env.NEXT_PUBLIC_SERVER_API}/add-bookmark`,
    { url: bookmarks.url },
    { withCredentials: true }
  );

  return response.data;
}

type searchParams = {
  query: string;
  search_type: string;
};

export async function searchBookmark(
  params: searchParams
): Promise<ApiResponse<bookmark[]>> {
  if (!params.query) {
    throw new Error("'query' must be provided");
  }

  const response = await axios.get<ApiResponse<bookmark[]>>(
    `${process.env.NEXT_PUBLIC_SERVER_API}/search`,
    {
      params,
      withCredentials: true,
    }
  );

  const data = response.data;

  // Handle error response shape from the backend
  if (!data.success) {
    const queryError = (data as ErrorResponse)?.error?.details;
    const message =
      queryError || data.error.message || "Search request failed unexpectedly.";

    throw new Error(message);
  }

  return data;
}

export async function BookmarkJobRetry(
  bookmarkId: string
): Promise<ApiResponse<undefined>> {
  const response = await axios.post<ApiResponse<undefined>>(
    `${process.env.NEXT_PUBLIC_SERVER_API}/retry-job`,
    bookmarkId,
    {
      withCredentials: true,
    }
  );

  return response.data;
}
