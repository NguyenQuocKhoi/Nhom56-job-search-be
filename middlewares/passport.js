const GooglePlusTokenStrategy = require("passport-google-plus-token");
const passport = require("passport");
const dotenv = require("dotenv");
const userModel = require("../models/User")
const jwt = require('jsonwebtoken');

dotenv.config();

passport.use(
  new GooglePlusTokenStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
          console.log('1',accessToken);
          console.log('2',refreshToken);
          console.log('3',profile);

          const user = new userModel({
            email: profile.emails[0].value,
            name: profile.displayName,
            lastLogin: Date.now(),
          });
      
           await user.save();
      } catch (error) {
        done(error, false)
      }
    }
  )
);

