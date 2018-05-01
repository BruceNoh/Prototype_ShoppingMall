var express = require('express');
var router = express.Router();
var UserModel = require('../models/UserModel');
var CheckoutModel = require('../models/CheckoutModel');

// 크롤링(배송조회)
var request = require('request');
var cheerio = require('cheerio');
var removeEmpty = require('../libs/removeEmpty');

// 데이터를 iamporter에서 조회를 해서 위변조가 방지됐는지를 확인한다.
// iamport 사이트에서 REST API, SECRET 키를 복사해온다. 
// 결제금액 등 결제정보를 iamport 사이트에서 조회할 수 있다.
const { Iamporter, IamporterError } = require('iamporter');
const iamporter = new Iamporter(
    {
        apiKey: '1246696873599986',
        secret: 'jj65igSutn96mPW7ct19nUQoPaEDLto5Nva5M3zgqJnNyjULMVVaQLyGWdjIHINudYzZ29gtSDgrWadJ'
    }
);

// 결제하기 화면
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


// 아임포트에서 데이터를 조회해오는 함수
router.get('/complete', async (req,res)=>{

    var payData = await iamporter.findByImpUid(req.query.imp_uid);
    // 이 곳에서 아임포트와 내 디비에서 amount(총결제금액)이 일치하는지 비교하고
    // 저장처리 분기(checkout.save())
    var checkout = new CheckoutModel({
    
        imp_uid : payData.data.imp_uid,
        merchant_uid : payData.data.merchant_uid,
        paid_amount : payData.data.amount,
        apply_num : payData.data.apply_num,
        
        buyer_email : payData.data.buyer_email,
        buyer_name : payData.data.buyer_name,
        buyer_tel : payData.data.buyer_tel,
        buyer_addr : payData.data.buyer_addr,
        buyer_postcode : payData.data.buyer_postcode,
        status : "결제완료", 
    });
    
    await checkout.save();
    res.redirect('/checkout/success');
   
});

// 결제처리 프로세스
router.post('/complete', (req, res)=>{

    var checkout = new CheckoutModel({

        imp_uid : req.body.imp_uid,
        merchant_uid : req.body.merchant_uid,
        paid_amount : req.body.paid_amount,
        apply_num : req.body.apply_num,
        
        buyer_email : req.body.buyer_email,
        buyer_name : req.body.buyer_name,
        buyer_tel : req.body.buyer_tel,
        buyer_addr : req.body.buyer_addr,
        buyer_postcode : req.body.buyer_postcode,

        status : req.body.status,
    });

    checkout.save(function(err){
        
        res.json({message:"success"});
    });

});

// 모바일 결제처리
router.post('/mobile_complete', (req,res)=>{
    
    var checkout = new CheckoutModel({
        
        imp_uid : req.body.imp_uid,
        merchant_uid : req.body.merchant_uid,
        paid_amount : req.body.paid_amount,
        apply_num : req.body.apply_num,
        
        buyer_email : req.body.buyer_email,
        buyer_name : req.body.buyer_name,
        buyer_tel : req.body.buyer_tel,
        buyer_addr : req.body.buyer_addr,
        buyer_postcode : req.body.buyer_postcode,

        status : req.body.status,
    });

    checkout.save(function(err){
        res.json({message:"success"});
    });
});

// 결제완료 후
router.get('/success', function(req,res){
    res.render('checkout/success');
});

// GET 구매조회
router.get('/nomember', function(req, res){

    res.render('checkout/nomember');
});

// GET 구매조회 처리
router.get('/nomember/search', function(req, res){

    CheckoutModel.find(

        {
            buyer_email : req.query.email
        }, function(err, checkoutList){

            res.render('checkout/search', 
                {
                    checkoutList : checkoutList
                }
            );
        }
    );
});

// GET 상품위치 크롤링
// 송장번호 조회
router.get('/shipping/:invc_no', (req, res)=>{

    //대한통운의 현재 배송위치 크롤링 주소 및 송장번호(파라미터)
    var url = "https://www.doortodoor.co.kr/parcel/doortodoor.do?fsp_action=PARC_ACT_002&fsp_cmd=retrieveInvNoACT&invc_no=" + req.params.invc_no ;
    var result = []; //최종 보내는 데이터
    console.log(req.params.invc_no + 'req.params.invc_noreq.params.invc_noreq.params.invc_noreq.params.invc_no');
    if(req.params.invc_no === null){
        res.send('<script>alert("송장번호가 없습니다.")\
        location.href="/admin/order";</script>');
    }
    
    request(url, (error, response, body) => {  
        //한글 변환
        var $ = cheerio.load(body, { decodeEntities: false });
        //td의 데이터를 전부 긁어온다
        var tdElements = $(".board_area").find("table.mb15 tbody tr td"); 
        // console.log(tdElements) 로 찍어본다.

        //한 row가 4개의 칼럼으로 이루어져 있으므로
        // 4로 나눠서 각각의 줄을 저장한 한줄을 만든다
        for( var i=0 ; i<tdElements.length ; i++ ){
            
            if(i%4===0){

                var temp = {}; //임시로 한줄을 담을 변수
                temp["step"] = removeEmpty(tdElements[i].children[0].data);
                //removeEmpty의 경우 step의 경우 공백이 많이 포함됨
            
            }else if(i%4===1){
            
                temp["date"] = tdElements[i].children[0].data;
            }else if(i%4===2){
                
                //여기는 children을 1,2한게 배송상태와 두번째줄의 경우 담당자의 이름 br로 나뉘어져있다.
                // 0번째는 배송상태, 1은 br, 2는 담당자 이름
                temp["status"] = tdElements[i].children[0].data;
                // 1보다 크면 <br>태그 아래 배송상태정보가 더 있으므로 배열2의 데이터를 가져온다.
                if(tdElements[i].children.length>1){
                
                    temp["status"] += tdElements[i].children[2].data;
                }

            }else if(i%4===3){
                
                temp["location"] = tdElements[i].children[1].children[0].data;
                result.push(temp); //한줄을 다 넣으면 result의 한줄을 푸시한다
                temp = {}; //임시변수 초기화 
            }
        }

        res.render( 'checkout/shipping' , { result : result }); //최종값 전달
    });
});


module.exports = router;



