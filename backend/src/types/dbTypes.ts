import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  globalBookmarks,
  globalJobsBookmarks,
  userFeedback,
  usersBookmarks,
} from "../database/schema";

export type GlobalBookmarks = InferSelectModel<typeof globalBookmarks>;
export type newGlobalBookmarks = InferInsertModel<typeof globalBookmarks>;

export type UserBookmarks = InferSelectModel<typeof usersBookmarks>;
export type newUserBookmarks = InferInsertModel<typeof usersBookmarks>;

export type JobBookmarks = InferSelectModel<typeof globalJobsBookmarks>;
export type newJobBookmarks = InferInsertModel<typeof globalJobsBookmarks>;

export type feedbacks = InferSelectModel<typeof userFeedback>;
export type newFeedback = InferInsertModel<typeof userFeedback>;
