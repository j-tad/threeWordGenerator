import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { users } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { type User as SelectUser } from "@db/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID || "threewords-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    }),
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sessionSettings.cookie = { 
      ...sessionSettings.cookie,
      secure: true,
      sameSite: 'none'
    };
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Get the full Replit URL for the callback
  const getCallbackUrl = () => {
    if (!process.env.REPL_SLUG || !process.env.REPL_OWNER) {
      console.error("Missing REPL_SLUG or REPL_OWNER environment variables");
      return null;
    }

    const replitDomain = `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
    const callbackUrl = `https://${replitDomain}/api/auth/google/callback`;
    console.log('Google callback URL:', callbackUrl);
    return callbackUrl;
  };

  // Only set up Google auth if credentials are present
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const callbackURL = getCallbackUrl();
    if (callbackURL) {
      passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL,
        proxy: true
      }, async (_accessToken, _refreshToken, profile, done) => {
        try {
          console.log('Google authentication callback received for user:', profile.emails?.[0]?.value);

          let [user] = await db
            .select()
            .from(users)
            .where(eq(users.googleId, profile.id))
            .limit(1);

          if (!user) {
            console.log('Creating new user for Google user:', profile.displayName);
            [user] = await db
              .insert(users)
              .values({
                googleId: profile.id,
                username: profile.emails?.[0]?.value?.split('@')[0] || `user${profile.id}`,
                displayName: profile.displayName,
                avatarUrl: profile.photos?.[0]?.value || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`
              })
              .returning();
          }

          return done(null, user);
        } catch (err) {
          console.error('Error in Google authentication callback:', err);
          return done(err);
        }
      }));

      passport.serializeUser((user, done) => {
        done(null, user.id);
      });

      passport.deserializeUser(async (id: number, done) => {
        try {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);
          done(null, user);
        } catch (err) {
          done(err);
        }
      });

      app.get("/api/auth/google", (req, res, next) => {
        console.log('Starting Google authentication process');
        passport.authenticate("google", { 
          scope: ['profile', 'email'],
          failWithError: true
        })(req, res, next);
      });

      app.get("/api/auth/google/callback",
        passport.authenticate("google", {
          successRedirect: "/",
          failureRedirect: "/login",
          failWithError: true
        })
      );
    }
  } else {
    console.log("Google OAuth credentials not configured. Authentication will not be available.");
    const callbackUrl = getCallbackUrl();
    if (callbackUrl) {
      console.log("To enable Google auth, add these credentials and use this callback URL:", callbackUrl);
    }
  }

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).send("Logout failed");
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    res.status(401).send("Not logged in");
  });
}