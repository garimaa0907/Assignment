
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const userModel = require('./models/userModel');

// The function is used for authentication using passport.js

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'Secret key',
};
module.exports = function(passport){
passport.use(
  new JwtStrategy(options, async (payload, done) => {
    try {
      const user = await userModel.findById(payload?.userId);
      if (user) {
        return done(null, user);
      }
      return done(null, false); 
    } catch (error) {
      return done(error, false);
    }
  })
);
}

