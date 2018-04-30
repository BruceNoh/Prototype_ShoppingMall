module.exports = function(req, res, next){

    if(!req.isAuthenticated()){
        
        res.send('<script>alert("로그인이 필요한 서비스입니다.");location.href="/accounts/login"</script>');
        // res.redirect('/accounts/login');
    }else{
        return next();
    }
};