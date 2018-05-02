var express = require('express');
var router = express.Router();

const mongoose = require('mongoose')
const UserModel = require('../models/UserModel')

router.get('/' , function(req, res) {
/*    
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
*/
    try {
        UserModel.findOne(
            {
                id: req.session.passport.user.id
            },
            function(error, document) {
            if(error) res.status(500).json(error)
                else res.render('cart/index', {cartList: document.cart, totalAmount: 0})
            }
        )
    } catch(error) {
        res.redirect('accounts/login')
    }
});

router.post('/add', function(req, res) {
    UserModel.findOneAndUpdate(
        {
            id: req.session.passport.user.id
        },
        {
            $push: {
                cart: {
                    _id: new mongoose.mongo.ObjectId(),
                    id: parseInt(req.body.id),
                    name: req.body.name,
                    number: parseInt(req.body.number),
                    amount: parseInt(req.body.amount),
                    thumbnail: req.body.thumbnail
                }
            }
        },
        {
//            upsert: true
        },
        function(error) {
            if(error) res.status(500).json(error)
            else res.json({success: true})
        }
    )
})

router.delete('/delete', function(req, res) {
    UserModel.findOneAndUpdate(
        {
            id: req.session.passport.user.id
        },
        {

            $pull: {
                cart: {
                    _id: new mongoose.mongo.ObjectId(req.body.id)
                }
            }

        },
        {
//            safe: true
        },
        function(error) {
            if(error) {res.status(500).json(error); console.error(error)}
            else res.json({success: true})
        }
    )
})

router.delete('/deleteAll', function(req, res) {
    UserModel.findOneAndUpdate(
        {
            id: req.session.passport.user.id
        },
        {

            $set: {
                cart: []
            }

        },
        {
//            safe: true
        },
        function(error) {
            if(error) {res.status(500).json(error); console.error(error)}
            else res.json({success: true})
        }
    )
}) 

module.exports = router;