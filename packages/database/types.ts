import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { globalBookmarks, usersBookmarks } from "./schema";

export type GlobalBookmarks = InferSelectModel<typeof globalBookmarks>;
export type newGlobalBookmarks = InferInsertModel<typeof globalBookmarks>;

export type UserBookmarks = InferSelectModel<typeof usersBookmarks>;
export type newUserBookmarks = InferInsertModel<typeof usersBookmarks>;
