var express = require('express');
var router = express.Router();

router.get('/' , function(req, res){
    
    var totalAmount = 0; //총결제금액
    var cartList = {}; //장바구니 리스트
    //쿠키가 있는지 확인해서 뷰로 넘겨준다
    if( typeof(req.cookies.cartList) !== 'undefined'){
        //장바구니데이터, 백엔드에서는 req.cookies에 접근이 가능하다.
        // 그리고 카트리스트를 JSON.parse로 cartList 변수로 받아온다.
        var cartList = JSON.parse(unescape(req.cookies.cartList));

        //총가격을 더해서 전달해준다.
        // 반복문을 통해 총 가격을 더해준다.
        for( var key in cartList){

            totalAmount += parseInt(cartList[key].amount);
        }
    }
    res.render('cart/index', { cartList : cartList , totalAmount : totalAmount } );
});


module.exports = router;