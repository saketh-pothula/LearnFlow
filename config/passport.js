const passport = require("passport");
const mongoose = require("mongoose");
const { Google_client_secret, Google_client_ID } = require("./keys");

const User = mongoose.model("users");
 
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(new GoogleStrategy({
    clientID: Google_client_ID,
    clientSecret: Google_client_secret,
    callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          googleId: profile.id,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          image: profile.photos[0].value,
        };
        try {
            let user = await User.findOne({ email: newUser.email });
            if (user) {
              // User Exists
              console.log("EXISTS ", user);
              done(null, user);
            } else {
              // Sign Up for the first time
              user = await User.create(newUser);
              console.log("NEW ", user);
              done(null, user);
            }
          } catch (error) {
            console.log(error);
            done(error);
          }
        }
    )
);


//what user information should be stored in the session
passport.serializeUser((user, done) => {
    done(null, user.id); // (error, user)
});

//retrieve the full user object from the session data
passport.deserializeUser(async (id, done) => {
try {
    const user = await User.findById(id);
    done(null, user);
} catch (error) {
  done(error);
}
});


 

/*
person -> Passport -> from cookies check in session  ->if user is there then extract user details, and if not there then redirects to login page

person -> LwG -> Backend server -> Google -> email + consent --
                          |                                   |
                          |___________________________________|

person -> LwG ---success---> Passport ->  create session -> setup cookie with sid in encrpyted from 
    |_________________________________________|


*/

/*
https://console.cloud.google.com
beside google cloud ,click on project, new project , name and no organisation, open the project, API & services

Oauth consent screen :
    external , create, 
    App name - LearnNet
    User support email - rajashekarsaireddy2004@gmail.com
    Developer contact information - Email addresses - rajashekarsaireddy2004@gmail.com
    Save & continue in all next steps and then Back to dash board

Credentials
    create credentials , oauth clientID, Web application
    name - LearnNet cred , Authorized redirect URIs - http://localhost:3000/auth/google/callback , create , download JSON 

Oauth consent screen :
    publish App

Credentials - use client id , clientsecret

/auth/google -> google server, email choosing -> consent screen -> callback -> passport authenticate -> we get profile ingo 

*/