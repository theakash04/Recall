import { Chat } from "@/components/Chat/chat";
import SearchBookmarks from "@/components/SearchBookmarks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 pt-0 px-4 my-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-1 mb-4">
        <form className="flex items-center flex-col gap-4 md:flex-row">
          <Input placeholder="Place your link here..." className="py-6" />
          <Button variant="default" className="py-6 px-8" type="submit">
            Add Bookmark
          </Button>
        </form>
      </div>
      <div className="grid auto-rows-min gap-4 lg:grid-cols-2 grid-cols-1 h-max">
        {/* search */}
        <div className="flex-1 rounded-xl p-4 md:h-[75vh] h-max border">
          <SearchBookmarks />
        </div>
        {/* Saved bookmarks */}
        <div className="bg-muted/50 flex-1 rounded-xl p-4 h-[75vh] lg:flex hidden border">
          <Chat />
        </div>
      </div>
    </div>
  );
}
