var express = require('express');
var router = express.Router();
var ProductsModel = require('../models/ProductsModel');
// 댓글을 작성해야 하므로 코멘트를 라우트로 불러와야 한다.
var CommentsModel = require('../models/CommentsModel');
var repleModel = require('../models/RepleModel');
var loginRequired = require('../libs/loginRequired');
// 콜백헬 개선
var co = require('co');
var paginate = require('express-paginate');

// csrf 셋팅
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
//이미지 저장되는 위치 설정
var path = require('path');
var uploadDir = path.join( __dirname , '../uploads' ); // 루트의 uploads위치에 저장한다.
var fs = require('fs');
// multer 셋팅
var multer = require('multer');
var storage = multer.diskStorage({
    destination : function (req, file, callback){
        callback(null, uploadDir);
    },
    filename : function (req, file, callback){
        callback(null, 'products-' + Date.now() + '.' + file.mimetype.split('/')[1]);
    }
});
var upload = multer({ storage : storage });

// 제품 등록 페이지 및 url
router.get('/products/write', loginRequired, csrfProtection, function(req, res){
    
    // 디렉토리 및 확장자가 ejs인 파일명
    res.render('admin/form',

        {
            product : "",
            csrfToken : req.csrfToken()
        }
    );
});

// form 작성 후 post 방식으로 데이터 저장을 수행할 메서드
router.post('/products/write', loginRequired, upload.single('thumbnail'), csrfProtection, function(req, res){
    // products.ejs form의 데이터를 req.body.x로 받는다.
    var product = new ProductsModel({

        name : req.body.name,
        thumbnail : (req.file) ? req.file.filename : "",
        price : req.body.price,
        description : req.body.description,
    });
    // 밸리데이션 싱크를 걸어놓는다.
    var validationError = product.validateSync();
    // 제목을 입력하지 않으면 밸리데이션 에러를 발생시킨다.
    if(validationError){
        res.send(validationError);
    }else{ // 제목입력되면 정보저장 후 프로덕트 페이지로 이동
        product.save(function(err){
            res.redirect('/admin/products');
        });
    }
    // 데이터를 받고 저장
    // product.save(function(err){
    //     // 저장 후 해당 url로 리다이렉트
    //     res.redirect('/admin/products');
    // });
});

// 제품 목록페이지
router.get('/products', paginate.middleware(5, 50), async (req,res) => {

    if(!req.isAuthenticated()){

        res.send('<script>alert("로그인이 필요한 서비스입니다.");location.href="/accounts/login"</script>');
    }else{

        const [ results, itemCount ] = await Promise.all([
            // sort : minus 하면 내림차순(날짜명)이다.
            ProductsModel.find().sort('-created_at').limit(req.query.limit).skip(req.skip).exec(),
            ProductsModel.count({})
        ]);
        const pageCount = Math.ceil(itemCount / req.query.limit);
        
        const pages = paginate.getArrayPages(req)( 4 , pageCount, req.query.page);

        res.render('admin/products', 
            { 
                products : results , 
                pages: pages,
                pageCount : pageCount,
            });
    }
});
// router.get('/products', function(req, res){

//     if(!req.isAuthenticated()){

//         res.send('<script>alert("로그인이 필요한 서비스입니다.");location.href="/accounts/login"</script>');
//     }else{
        
//         ProductsModel.find(function(err, products){

//             res.render('admin/products', 
//                 {
//                     products : products
//                 }
//             );
//         });
//     }
// });

// 상세페이지 /admin/products/detail/:id
router.get('/products/detail/:id' , function(req, res){

    var getData = async() => {
        // async()함수를 만들고 return반환 후 처리가 다 되면 getData().then이 실행된다.
        return {
            
            product : await ProductsModel.findOne( { 'id' :  req.params.id }).exec(),
            comments : await CommentsModel.find( { 'product_id' :  req.params.id }).exec(),
            reple : await repleModel.find( { 'products_id' :  req.params.id }).exec()
        };
    };
    getData().then( function(result){
        
        res.render('admin/productsdetail', { product: result.product , comments : result.comments, reples : result.reple });
    });
});

    // 두 번째 코딩
    // 디비에서 제품정보를 id값으로 받아온다.
    // ProductsModel.findOne(
    //     {   
    //         'id' : req.params.id
    //     }, function(err, products){
            
    //             CommentsModel.find(
    //                 {   // 댓글디비의 id를 제품정보 id로 조회
    //                     product_id : req.params.id
    //                 }, 
    //                 function(err, comments){
    //                     // url로 키값을 보낸다.
    //                     res.render('admin/productsDetail', 
    //                     {
    //                         product : products,
    //                         comments : comments    
    //                     }
    //                 );  
            
            // 첫 번째 코딩          
            // res.render로 해당 ejs 파일에 보내준다.
            // res.render('admin/productsDetail', 
            // {
            //     product : product
            // });
    //     });
    // });

// 제품 수정페이지
router.get('/products/edit/:id', loginRequired, csrfProtection, function(req, res){
    // 수정할 제품을 찾는다.
    ProductsModel.findOne(
        {   // 아이디 값으로 찾는다.
            id : req.params.id
        }, function(err, product){

            res.render('admin/formedit', 
        {
            product : product,
            csrfToken : req.csrfToken()
        });
    });
});

// 제품 수정처리 라우트
router.post('/products/edit/:id', loginRequired, upload.single('thumbnail'), csrfProtection, function(req, res){

    ProductsModel.findOne( 
            {
                id : req.params.id
            }, function(err, product){
                
                if(req.file && product.thumbnail){  //요청중에 파일이 존재 할시 이전이미지 지운다.
                    
                    fs.unlinkSync( uploadDir + '/' + product.thumbnail );
                }
                // req.file[0] 첫번째 -> upload.single말고 이미지가 여러개일 때 upload.array            
        // query 변수값을 세팅한다.
        var query = {

            name : req.body.name,
            // 파일요청이면 새로운 파일을 파일요청이 아니면 기존 디비에 저장된 이미지 파일경로를 불러온다.
            thumbnail : (req.file) ? req.file.filename : product.thumbnail,
            price : req.body.price,
            description : req.body.description
        };
            // update의 첫 번째 인자는 조건, 두 번째 인자는 바뀔 값들
            ProductsModel.update(
                {   // query 변수를 적용할 제품의 아이디
                    id : req.params.id
                },
                {   // query 변수로 해당 업데이트 수행
                    $set : query
                }, function(err){
                
                    // 제품 수정 후 수정된 제품의 상세페이지 이동
                    res.redirect('/admin/products/detail/' + req.params.id);
                }
            ); 
    });      
});

// 제품 삭제 처리
router.get('/products/delete/:id', function(req, res){
    // 모델객체에서 데이터 삭제
    ProductsModel.remove(
        {   // 페이지에서 제품 아이디값 전달받는다
            id : req.params.id
        }, function(err){
            // 삭제 후 제품목록으로 이동
            res.redirect('/admin/products');
        }
    );
});

// 댓글작성, 자바스크립트 ajax url과 매핑되면서 처리되는 객체
router.post('/products/ajax_comment/insert', function(req, res){
    
    // 디비객체 변수
    var comment = new CommentsModel({
        // 디비 타입 및 받아오는 데이터
        content : req.body.content,
        // 댓글 product_id에 제품정보 아이디값을 받는다., product_id는 폼의 name
        product_id : parseInt(req.body.product_id)
    });

    // 코멘트도 save 메서드로 저장처리
    comment.save(function(err, comment){

        res.json({
            // 향후에 삭제하기 위해 댓글 id를 불러온다.
            id : comment.id,
            content : comment.content,
            message : "success"
        });
    });
});

// 리플작성, 자바스크립트 ajax url과 매핑되면서 처리되는 객체
router.post('/products/ajax_comment/repleinsert', function(req, res){
    console.log(req.body.product_id+'product_idproduct_idproduct_idproduct_id');
    // 디비객체 변수
    var reple = new repleModel({
        // 디비 타입 및 받아오는 데이터
        content : req.body.reple2,
        // 댓글에 리플을 달고 이를 View화면에 출력해주기 위해서 제품의 아이디값도 받아온다.
        products_id : parseInt(req.body.product_id),
        // 댓글 comment_id에 댓글 아이디값을 받는다.
        comments_id : parseInt(req.body.comment_id),
        limit_reple : 1
    });
    
    // 리플도 save 메서드로 저장처리
    reple.save(function(err, reple){

        res.json({
            // 향후에 삭제하기 위해 댓글 id를 불러온다.
            id : reple.id,
            content : reple.content,
            products_id : reple.products_id,
            comments_id : reple.comments_id,
            limit_reple : reple.limit_reple,
            message : "success"
        });
    });
});

// 댓글삭제 라우트
router.post('/products/ajax_comment/delete', function(req, res){

    CommentsModel.remove(
        {
            id : req.body.comment_id
        }, function(err){

            res.json(
                {
                    message : "success"
                }
            );
        });
});


// 리플삭제 라우트
router.post('/products/ajax_comment/repledelete', function(req, res){

    repleModel.remove(
        {
            id : req.body.reple_id
        }, function(err){

            res.json(
                {
                    message : "success"
                }
            );
        });
});

// 위지윅에디터 이미지 업로드 라우팅 구현
router.post('/products/ajax_summernote', loginRequired, upload.single('thumbnail'), function(req, res){

    res.send('/uploads/' + req.file.filename);
});

module.exports = router;

