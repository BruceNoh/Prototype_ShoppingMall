// amdin 분기를 위한 모듈
module.exports = function(req, res, next) {

    if (!req.isAuthenticated()){ 
    
        res.redirect('/admin/adminlogin');
    }else{
    
        if(req.user.username !== req.user.username){
    
            res.send('<script>alert("관리자만 접근가능합니다.");\
                      location.href="/admin/adminlogin";</script>');
        }else{

            return next();
        }
    }
};