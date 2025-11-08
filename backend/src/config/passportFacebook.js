const passportFacebook = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user.model');

module.exports = function setupFacebookPassport() {
  console.log("🔍 FACEBOOK_CALLBACK_URL in runtime:", process.env.FACEBOOK_CALLBACK_URL);
  passportFacebook.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'displayName', 'emails', 'picture.type(large)'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const socialId = profile.id;
          const email = profile.emails?.[0]?.value?.toLowerCase() || null;
          const fullName = profile.displayName || 'Facebook User';
          const avatar = profile.photos?.[0]?.value;

          // 🔍 1. Kiểm tra nếu user đã có qua Facebook
          let user = await User.findOne({ socialId, socialProvider: 'facebook' });

          // 🔍 2. Nếu chưa có, kiểm tra trùng email (nếu có)
          if (!user && email) {
            user = await User.findOne({ email });
            if (user) {
              // Merge tài khoản cũ (thêm social info)
              user.socialProvider = 'facebook';
              user.socialId = socialId;
              await user.save();
            }
          }

          // 🔍 3. Nếu vẫn chưa có -> tạo mới
          if (!user) {
            // ⚠️ username phải unique => tự sinh
            const baseUsername = fullName.replace(/\s+/g, '').toLowerCase();
            let candidate = baseUsername;
            let attempt = 0;

            // Đảm bảo username unique
            while (await User.exists({ username: candidate })) {
              attempt += 1;
              candidate = `${baseUsername}${attempt}`;
            }

            user = await User.create({
              fullName,
              username: candidate,
              email,
              socialProvider: 'facebook',
              socialId,
              isVerified: true, // MXH đã xác thực email rồi
            });
          }

          return done(null, user);
        } catch (err) {
          console.error('Facebook login error:', err);
          return done(err, null);
        }
      }
    )
  );
};
