//const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const userModel = require('./models/userModel');


const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'Secret key',
};
module.exports = function(passport){
    console.log("helooooo" + options)
passport.use(
  new JwtStrategy(options, async (payload, done) => {
    console.log(payload + "here")
    try {
      const user = await userModel.findById(payload?.userId);
      if (user) {
        console.log("user",user)
        return done(null, user);
      }
      return done(null, false); 
    } catch (error) {
      return done(error, false);
    }
  })
);
}

