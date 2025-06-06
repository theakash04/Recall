import { ApiResponse } from "@/types/apiResponse";
import { bookmark, newBookmark, searchParams } from "@/types/bookmarkTypes";
import axios from "axios";

// type getBookmarkResponse = {
//   data: bookmark[];
//   pagination: {
//     currentPage: number;
//     limit: number;
//     hasNextPage: boolean;
//     nextPage: number | null;
//   };
// };

export async function fetchBookmarks({ pageParam = 1 }) {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_API}/get-all-bookmarks?page=${pageParam}&limit=12`,
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
