"use client";
import Bookmarks from "@/components/Bookmarks";
import useBookmarkStore from "@/store/bookmarkStore";
import { useEffect } from "react";
import { toast } from "sonner";
// import { BookmarkFormData, inputBookmarkSchema } from "@/zod/bookmarkSchema";
// import { zodResolver } from "@hookform/resolvers/zod";
// import axios from "axios";
// import { useForm } from "react-hook-form";
// import { toast } from "sonner";

export default function Page() {
  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors },
  //   reset,
  // } = useForm<BookmarkFormData>({
  //   resolver: zodResolver(inputBookmarkSchema),
  // });

  // const onSubmit = async (data: BookmarkFormData) => {
  //   console.log("Submitted URL:", data.url);
  //   const res = await axios.post(
  //     `${process.env.NEXT_PUBLIC_SERVER_API}/add-bookmark`,
  //     data,
  //     {
  //       withCredentials: true,
  //     }
  //   );
  //   console.log(res);
  //   reset();
  // };

  // const onError = (formError: typeof errors) => {
  //   const urlError = formError.url?.message;
  //   if (urlError) {
  //     toast.error("Input field Error", {
  //       description: urlError,
  //     });
  //   }
  // };
  const { getAllBookmarks } = useBookmarkStore();

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        await getAllBookmarks();
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
        toast.error("Failed to fetch bookmarks. Please try again later.");
      }
    };

    fetchBookmarks();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0 px-4 my-4">
      <div className="grid auto-rows-min gap-4 lg:grid-cols-1 grid-cols-1">
        {/* search and add */}
        <div className="flex-1 rounded-xl p-4">
          <Bookmarks />
        </div>
      </div>
    </div>
  );
}
