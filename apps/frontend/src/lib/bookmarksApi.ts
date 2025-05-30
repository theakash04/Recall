import { bookmark, newBookmark } from "@/types/bookmarkTypes";
import axios from "axios";

export async function fetchBookmarks(): Promise<bookmark[]> {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_API}/get-all-bookmarks`,
    {
      withCredentials: true,
    }
  );

  return response.data.data;
}

export async function addBookmark(bookmarks: newBookmark): Promise<bookmark> {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_SERVER_API}/add-bookmark`,
    { url: bookmarks.url },
    { withCredentials: true }
  );

  return response.data.data;
}

type searchParams = {
  query: string;
  search_type: string;
};

export async function searchBookmark(
  params: searchParams
): Promise<bookmark[]> {
  if (!params.query) {
    throw new Error("'query' must be provided");
  }

  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_API}/search`,
    {
      params: {
        query: params.query,
        search_type: params.search_type,
      },
      withCredentials: true,
    }
  );

  const data = response.data;

  if (response.status >= 400 || data?.error) {
    // Extract a more useful message
    const queryError = data?.error?.query?._errors?.[0];
    const generalError = data?.error?._errors?.[0];

    const message =
      queryError || generalError || "Search request failed unexpectedly.";

    throw new Error(message);
  }

  return data.data;
}
