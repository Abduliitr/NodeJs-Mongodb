var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var Dishes = require('./models/dishes');

var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create,  sign and verify tokens
var FacebookTokenStrategy = require('passport-facebook-token');

var config = require('./config');

exports.local = passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user){
    return jwt.sign(user, config.secretKey, 
        {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts, 
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user)=>{
            if(err){
                return done(err, false);
            }
            else if(user){
                console.log("User checked first!")
                return done(null, user);
            }
            else{
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = function(req, res, next){
    console.log("req.user.admin: " + req.user.admin);
    User.findOne({_id: req.user._id}, (err, user) => {
        if(req.user.admin){
            next();
        }
        else{
            var err = new Error("You are not authorized to perform this operation!")
            err.status = 403;
            next(err);
        }
    })
    .catch((err) => next(err));
}

exports.verifySelf = function(req, res, next){
    // console.log("req.user._id: " + req.user._id);
    Dishes.findById(req.params.dishId)
    .then((dish)=>{

        if(dish != null && dish.comments.id(req.params.commentId)!=null){
            if(req.user._id.equals(dish.comments.id(req.params.commentId).author._id)){
                next();
            }
            else{
                var err = new Error("You are not authorized to perform this operation!")
                err.status = 403;
                next(err);
            }    
        }
        else if(dish==null){
            err = new Error('Dish '+req.params.dishId+' not Found!');
            err.statusCode = 404;
            return next(err);        
        }
        else{
            err = new Error('Comment '+req.params.commentId+' not Found!');
            err.statusCode = 404;
            return next(err); 
        }
    }, (err)=> next(err))
    .catch((err)=>{
        next(err);
    });
}

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
    }, (accessToken, refreshToken, profile, done) => {
        User.findOne({facebookId: profile.id}, (err, user) => {
            if(err){
                return done(err, false);
            }
            if(!err && user!==null){
                return done(null, user)
            }
            else{
                user = new User({username: profile.displayName});
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save((err, user) => {
                    if(err)
                        return done(err, false);
                    else    
                        return done(null, user);
                })
            }
        });
    }
));