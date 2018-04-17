var express = require('express');
var router = express.Router();
//콜백헬 개선, 페이지네이트
var co = require('co');
var paginate = require('express-paginate');
var loginRequired = require('../libs/loginRequired');
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });

// GET Question List
router.get('/list', function(req, res){

    // res.render('chat/index');
    if(!req.isAuthenticated()){

        res.send('<script>alert("로그인이 필요한 서비스입니다.");location.href="/accounts/login"</script>');
    }else{

        res.render('qna/qnalist');
    }
});

// GET Question Write
router.get('/write', loginRequired, csrfProtection, function(req, res){
    
    // res.render('bbs/qna');
    if(!req.isAuthenticated()){

        res.send('<script>alert("로그인이 필요한 서비스입니다.");location.href="/accounts/login"</script>');
    }else{

        res.render('qna/qnawrite',

            {
                qna : req.user,
                csrfToken : req.csrfToken()
            }
        );
    }
});

module.exports = router;



// 제품 등록 페이지 및 url
// router.get('/products/write', loginRequired, csrfProtection, function(req, res){
    
//     // 디렉토리 및 확장자가 ejs인 파일명
//     res.render('admin/form',

//         {
//             product : "",
//             csrfToken : req.csrfToken()
//         }
//     );
// });