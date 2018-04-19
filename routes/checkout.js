var express = require('express');
var router = express.Router();
var UserModel = require('../models/UserModel');

router.get('/' , function(req, res){
    
    var totalAmount = 0; //총결제금액
    var cartList = {}; //장바구니 리스트
    //쿠키가 있는지 확인해서 뷰로 넘겨준다
    if( typeof(req.cookies.cartList) !== 'undefined'){
        //장바구니데이터
        var cartList = JSON.parse(unescape(req.cookies.cartList));

        //총가격을 더해서 전달해준다.
        for( let key in cartList){
            totalAmount += parseInt(cartList[key].amount);
        }
    }     
    UserModel.findOne(
        {
            user_id : req.user.user_id
        }, function(err, user){
        
            res.render('checkout/index', { cartList : cartList , totalAmount : totalAmount, user : user } );
        }
    );
        
    
    // res.render('checkout/index', { cartList : cartList , totalAmount : totalAmount, user : req.user } );
});


module.exports = router;


