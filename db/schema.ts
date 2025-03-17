import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// Define the profiles table for user profiles
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Define the words table for submitted words
export const words = pgTable("words", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => profiles.id).notNull(),
  submitterName: text("submitter_name"),
  word1: text("word1").notNull(),
  word2: text("word2").notNull(),
  word3: text("word3").notNull(),
  anonymous: boolean("anonymous").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Define the relationships between tables
export const profilesRelations = relations(profiles, ({ many }) => ({
  words: many(words)
}));

export const wordsRelations = relations(words, ({ one }) => ({
  profile: one(profiles, {
    fields: [words.profileId],
    references: [profiles.id]
  })
}));

// Create Zod schemas for validation
export const insertProfileSchema = createInsertSchema(profiles);
export const selectProfileSchema = createSelectSchema(profiles);
export const insertWordSchema = createInsertSchema(words);
export const selectWordSchema = createSelectSchema(words);

// Export types for use in the application
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;
export type Word = typeof words.$inferSelect;
export type InsertWord = typeof words.$inferInsert;