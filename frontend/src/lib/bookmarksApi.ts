import { ApiResponse } from "@/types/apiResponse";
import { bookmark, newBookmark, searchParams } from "@/types/bookmarkTypes";
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

  return response.data;
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
