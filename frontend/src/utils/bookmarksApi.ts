import { ApiResponse } from "@/types/apiResponse";
import { bookmark, newBookmark, searchParams } from "@/types/bookmarkTypes";
import api from "./apiClient";

export async function fetchBookmarks({ pageParam = 1 }) {
  const { data } = await api.get(`/get-all-bookmarks`, {
    params: { page: pageParam, limit: 10 },
  });

  return data;
}

export async function addBookmark(
  bookmarks: newBookmark
): Promise<ApiResponse<bookmark>> {
  const { data } = await api.post<ApiResponse<bookmark>>(`/add-bookmark`, {
    url: bookmarks.url,
  });

  return data;
}

export async function searchBookmark(
  params: searchParams
): Promise<ApiResponse<bookmark[]>> {
  if (!params.query) {
    throw new Error("'query' must be provided");
  }

  const { data } = await api.get<ApiResponse<bookmark[]>>(`/search`, {
    params,
  });

  return data;
}

export async function BookmarkJobRetry(
  bookmarkId: string
): Promise<ApiResponse<undefined>> {
  const { data } = await api.post<ApiResponse<undefined>>(
    `/retry-job`,
    bookmarkId
  );

  return data;
}
