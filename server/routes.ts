import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { profiles, words } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import rateLimit from "express-rate-limit";

const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 submissions per 15 minutes
  message: "Too many submissions, please try again later"
});

export function registerRoutes(app: Express): Server {
  // Username availability check (already implemented)
  app.get("/api/check-username/:username", async (req, res) => {
    try {
      const { username } = req.params;

      if (!username || username.length < 3) {
        return res.json({ available: false, message: "Username must be at least 3 characters" });
      }

      if (username.length > 30) {
        return res.json({ available: false, message: "Username must be less than 30 characters" });
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return res.json({ available: false, message: "Only letters, numbers, underscores and dashes are allowed" });
      }

      const existing = await db
        .select()
        .from(profiles)
        .where(eq(profiles.username, username.toLowerCase()))
        .limit(1);

      return res.json({
        available: existing.length === 0,
        message: existing.length === 0 ? "Username is available!" : "Username is already taken"
      });
    } catch (error) {
      console.error("Error checking username:", error);
      res.status(500).json({ available: false, message: "Error checking username availability" });
    }
  });

  // Create profile
  app.post("/api/profiles", async (req, res) => {
    try {
      const { username } = req.body;

      if (!username) {
        return res.status(400).send("Username is required");
      }

      // Check if username is already taken
      const existing = await db
        .select()
        .from(profiles)
        .where(eq(profiles.username, username.toLowerCase()))
        .limit(1);

      if (existing.length > 0) {
        return res.status(400).send("Username is already taken");
      }

      // Create new profile
      const [profile] = await db
        .insert(profiles)
        .values({
          username: username.toLowerCase(),
          displayName: username,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        })
        .returning();

      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).send("Failed to create profile");
    }
  });

  // Get profile by username
  app.get("/api/users/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.username, username.toLowerCase()))
        .limit(1);

      if (!profile) {
        return res.status(404).send("Profile not found");
      }

      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).send("Failed to fetch profile");
    }
  });

  // Submit words for a profile
  app.post("/api/users/:username/words", submissionLimiter, async (req, res) => {
    try {
      const { username } = req.params;
      const { word1, word2, word3, anonymous, submitterName } = req.body;

      // Validate input
      if (!word1 || !word2 || !word3) {
        return res.status(400).send("All three words are required");
      }

      // Get profile
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.username, username.toLowerCase()))
        .limit(1);

      if (!profile) {
        return res.status(404).send("Profile not found");
      }

      // Create word submission
      const [submission] = await db
        .insert(words)
        .values({
          profileId: profile.id,
          submitterName: anonymous ? null : submitterName || null,
          word1,
          word2,
          word3,
          anonymous: Boolean(anonymous)
        })
        .returning();

      res.json(submission);
    } catch (error) {
      console.error("Error submitting words:", error);
      res.status(500).send("Failed to submit words");
    }
  });

  // Get words for a profile
  app.get("/api/users/:username/words", async (req, res) => {
    try {
      const { username } = req.params;

      // Get profile
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.username, username.toLowerCase()))
        .limit(1);

      if (!profile) {
        return res.status(404).send("Profile not found");
      }

      // Get words
      const submissions = await db
        .select()
        .from(words)
        .where(eq(words.profileId, profile.id))
        .orderBy(desc(words.createdAt));

      res.json(submissions);
    } catch (error) {
      console.error("Error fetching words:", error);
      res.status(500).send("Failed to fetch words");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}