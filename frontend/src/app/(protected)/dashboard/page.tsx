"use client";
import Bookmarks from "@/components/Bookmarks";

export default function Page() {
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
