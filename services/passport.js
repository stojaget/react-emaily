const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const keys = require("../config/keys");
const mongoose = require("mongoose");

const User = mongoose.model("users");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ googleId: profile.id }).then(
        (existingUser) => {
          if (existingUser) {
            // znači već imamo taj zapis, zovemo done metodu da signaliziramo kraj
            done(null, existingUser);
          } else {
            // ne postoji pa ga kreiraj
            new User({
              googleId: profile.id,
            })
              .save()
              .then((user) => done(null, user));
          }
        }

        // dohvati user details
        // console.log("accessToken", accessToken);
        // console.log("refreshToken", refreshToken);
        // console.log("profile", profile);
      );
    }
  )
);
