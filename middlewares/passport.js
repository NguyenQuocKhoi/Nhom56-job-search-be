const GooglePlusTokenStrategy = require("passport-google-plus-token");
const passport = require("passport");
const dotenv = require("dotenv");
const userModel = require("../models/User");
const jwt = require("jsonwebtoken");

dotenv.config();

passport.use(
  new GooglePlusTokenStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const { role } = req.body;
        // console.log("1", accessToken);
        // console.log("2", refreshToken);
        // console.log("3", profile);
        let user = await userModel.findOne({ email: profile.emails[0].value });
        if (!user) {
          user = new userModel({
            email: profile.emails[0].value,
            name: profile.displayName,
            lastLogin: Date.now(),
            role,
          });
        } else {
          user.lastLogin = Date.now();
        }

        await user.save();

        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
