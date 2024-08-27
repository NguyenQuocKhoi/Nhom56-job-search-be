const passport = require('passport');
const GooglePlusTokenStrategy = require('passport-google-plus-token');
const userModel = require('../models/User');
const dotenv = require("dotenv");
dotenv.config();

passport.use('googleToken', new GooglePlusTokenStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const existingUser = await userModel.findOne({ googleId: profile.id });
        console.log(existingUser)
        if (existingUser) {
            return done(null, existingUser);
        }
        const newUser = new userModel({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            lastLogin: Date.now(),
        });

        await newUser.save();
        done(null, newUser);
    } catch (error) {
        done(error, false);
    }
}));