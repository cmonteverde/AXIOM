import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, integer, text } from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  researchLevel: text("research_level"),
  primaryField: text("primary_field"),
  learningMode: text("learning_mode"),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  streak: integer("streak").notNull().default(0),
  lastActiveDate: text("last_active_date"),
  achievements: jsonb("achievements").default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
  authProvider: text("auth_provider").default("replit"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
