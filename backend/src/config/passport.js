const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.model"); // chỉnh lại đường dẫn nếu khác

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // kiểm tra user đã tồn tại hay chưa
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
          });
        }
        return done(null, user);
      } catch (err) {
        console.error("Google login error:", err);
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
