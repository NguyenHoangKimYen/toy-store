const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.model");

//Hàm làm sạch chuỗi để tạo username an toàn
const sanitize = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/_{2,}/g, "_");

//Tạo username duy nhất
const generateUniqueUsername = async (profile) => {
  const email = profile.emails?.[0]?.value || "";
  const fromEmail = email.split("@")[0];
  const fromName =
    profile.displayName ||
    `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim();

  let base = sanitize(fromEmail) || sanitize(fromName) || `google${profile.id}`;
  if (!base) base = `google${profile.id}`;

  let candidate = base;
  let attempt = 0;

  while (await User.exists({ username: candidate })) {
    attempt += 1;
    candidate = `${base}${attempt}`;
  }

  return candidate;
};

//Cấu hình Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        new URL(
          "/api/auth/google/callback",
          process.env.BASE_URL || "http://localhost:8080"
        ).toString(),
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          socialProvider: "google",
          socialId: profile.id,
        });

        //Ảnh mặc định khi Google không có ảnh
        const DEFAULT_AVATAR =
          process.env.DEFAULT_AVATAR_URL ||
          "https://toy-store-project-of-springwang.s3.ap-southeast-2.amazonaws.com/defaults/unknownAvatar.png";

        //Nếu user chưa tồn tại → tạo mới
        if (!user) {
          const email = profile.emails?.[0]?.value;
          if (!email)
            return done(
              new Error("Google account does not expose an email address."),
              null
            );

          const username = await generateUniqueUsername(profile);
          const fullName =
            profile.displayName ||
            `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim() ||
            email ||
            username;

          //Lấy avatar từ Google profile (nếu có)
          const avatar =
            profile.photos?.[0]?.value?.replace("=s96-c", "=s400-c") ||
            DEFAULT_AVATAR;

          user = await User.create({
            socialProvider: "google",
            socialId: profile.id,
            email,
            fullName,
            username,
            phone: null,
            avatar,
            isVerified: profile.emails?.[0]?.verified ?? true,
          });
        } else {
          //Nếu user đã tồn tại mà chưa có avatar → thêm ảnh mặc định
          if (!user.avatar) {
            user.avatar =
              profile.photos?.[0]?.value?.replace("=s96-c", "=s400-c") ||
              DEFAULT_AVATAR;
            await user.save();
          }
        }

        return done(null, user);
      } catch (err) {
        console.error("GOOGLE LOGIN ERROR:", err);
        return done(err, null);
      }
    }
  )
);

//Serialize / Deserialize
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;