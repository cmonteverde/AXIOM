import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const manuscripts = pgTable("manuscripts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: text("title"),
  stage: text("stage").notNull(),
  helpTypes: text("help_types").array().notNull(),
  fileName: text("file_name"),
  fileKey: text("file_key"),
  previewText: text("preview_text"),
  extractionStatus: text("extraction_status").default("pending"),
  readinessScore: integer("readiness_score"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertManuscriptSchema = createInsertSchema(manuscripts).omit({
  id: true,
  readinessScore: true,
  status: true,
  createdAt: true,
  previewText: true,
  extractionStatus: true,
});

export type InsertManuscript = z.infer<typeof insertManuscriptSchema>;
export type Manuscript = typeof manuscripts.$inferSelect;

export const profileSetupSchema = z.object({
  researchLevel: z.string().min(1),
  primaryField: z.string().min(1),
  learningMode: z.string().min(1),
});

export type ProfileSetup = z.infer<typeof profileSetupSchema>;
