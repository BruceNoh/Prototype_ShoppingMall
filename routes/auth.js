var express = require('express');
var router = express.Router();
var UserModel = require('../models/UserModel');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;



passport.serializeUser(function (user, done){

    done(null, user);
});

passport.deserializeUser(function (user, done){

    done(null, user);
});

passport.use(new FacebookStrategy({

    // https://developers.facebook.com에서 appId 및 secretID 발급
    clientID: "986023264890438", //입력하세요
    clientSecret: "d4f5ff8e75d0ca2cf3bc944f72582245", //입력하세요.
    callbackURL: "https://localhost:3001/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
    }, function(accessToken, refreshToken, profile, done){

        // console.log(profile);
        // console.log(profile.displayName);
        // console.log(profile.emails[0].value);
        // console.log(profile._raw);
        // console.log(profile._json);
        
        UserModel.findOne({ user_id : "fb_" + profile.id }, function(err, user){
            
            if(!user){  //없으면 회원가입 후 로그인 성공페이지 이동
                
                var regData = { //DB에 등록 및 세션에 등록될 데이터
                    user_id :  "fb_" + profile.id,
                    password : "facebook_login",
                    displayname : profile.displayName
                };
                // 받아온 페이스북 데이터를 User 객체에 저장한 디비에 세이브해준다.
                var User = new UserModel(regData);
                User.save(function(err){ //DB저장

                    done(null, regData); //세션 등록
                });
            }else{ //있으면 DB에서 가져와서 세션등록

                done(null, user);
            }
        });
    }
));

// https://localhost:3001/auth/facebook 접근시 facebook으로 넘길 url 작성
router.get('/facebook', passport.authenticate('facebook', 

    {
        scope : 'email'
    }
));

// 인증 후 페이스북에서 이 주소로 리턴해줌, 상단에 작은 callbackURL과 일치
router.get('/facebook/callback', 

    passport.authenticate('facebook', 
        {
            successRedirect : '/home',
            failureRedirect : '/auth/facebook/fail'
            // failureRedirect : '/account/login'
        }
    )
);

// 로그인 성공시 이동할 주소
router.get('/facebook/success', function(req, res){
    
    res.send(req.user);
});

router.get('/facebook/fail', function(req, res){
    
    res.send('facebook login fail');
});

module.exports = router;
















