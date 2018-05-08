var express = require('express');
var router = express.Router();
//콜백헬 개선, 페이지네이트
var co = require('co');
var paginate = require('express-paginate');
var loginRequired = require('../libs/loginRequired');
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });

const QnAModel = require('../models/QnAModel')

// GET Question List
router.get('/list', function(req, res){

    // res.render('chat/index');
    if(!req.isAuthenticated()){

        res.send('<script>alert("로그인이 필요한 서비스입니다.");location.href="/accounts/login"</script>');
    }else{
      QnAModel.find({})
        .sort({time: -1})
        .exec(function(error, documents) {
          if(error) res.status(500).json(error)
          else res.render('qna/qnalist', {documents: documents})
        })
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

router.post('/write', function(req, res) {
  if(!req.isAuthenticated()) {
    res.json({success: false, reason: 'auth'})
    return
  }
  var secret = (req.body.qnasecret === 'secret') ? true : false
  new QnAModel({
    uid: req.session.passport.user._id,
    name: req.body.qnaname,
    category: req.body.qnacategory,
    email: req.body.qnaemail,
    phoneNumber: req.body.qnaphone,
    title: req.body.qnatitle,
    content: req.body.qnacontent,
    secret: secret
  }).save(function(error, document) {
    if(error) res.status(500).json(error)
    else res.redirect(document._id)
  })
})

router.get('/:id', function(req, res) {
  QnAModel.findOne(
    {_id: req.params.id},
    function(error, document) {
      if(error) res.status(500).json(error)
      else {
        /* 권한 관리 수정 필요 */
        if(req.session.passport.user._id != '5ae816dc2920612ed44cbe01') {
          if(document.secret && document.uid == req.session.passport.user._id) res.render('qna/qna', {document: document, user: null})
          else if(document.secret && document.uid != req.session.passport.user._id) res.redirect('list')
          else res.render('qna/qna', {document: document, user: null})
        } else {
          res.render('qna/qna', {document: document, user: req.session.passport.user})
        }
      }
    }
  )
})

router.post('/answer', function(req, res) {
  /* 권한 관리 수정 필요 */
  if(req.session.passport.user._id == '5ae816dc2920612ed44cbe01') {
    QnAModel.findOneAndUpdate(
      {
        _id: req.body.id
      },
      {
        $set: {
          answer: {
            user: {
              id: req.session.passport.user._id,
              name: req.session.passport.user.user_name
            },
            content: req.body.content,
            time: new Date()
          }
        }
      },
      function(error, document) {
        if(error) res.status(500).json(error)
        else res.json({success: true})
        // else {
        //   var answer = {
        //     user: {
        //       id: req.session.passport.user._id,
        //       name: req.session.passport.user.user_name
        //     },
        //     content: req.body.content
        //   }
        //   console.log(answer)
        //   document.answer = answer
        //   res.json({success: true})
        // }
      }
    )
  } else {
    res.json({success: false, reason: 'auth'})
  }
})

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
