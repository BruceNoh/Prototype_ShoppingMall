var express = require('express');
var router = express.Router();
var ProductsModel = require('../models/ProductsModel');
var CommentsModel = require('../models/CommentsModel');
var co = require('co');

// 장바구니 페이지 로드
router.get('/:id', function(req, res){
    // 콜백헬 개선을 위한 모듈
    var getData = co(function* (){
        // 반환
        return {
            // 상품정보 로드, 상품페이지에서 상품의 id값 수신
            product : yield ProductsModel.findOne(
                {
                    'id' : req.params.id
                }
            ).exec(),
            // 댓글 로드, 상품페이지에서 댓글 id값 수신
            comments : yield CommentsModel.find(
                {
                    'product_id' : req.params.id
                }
            ).exec()
        };        
    });

    getData.then(result => {

        res.render('products/detail',
            {
                product : result.product,
                comments : result.comments
            }
        );
    });
});


module.exports = router;
















