var express = require('express');
var router = express.Router();
var ProductsModel = require('../models/ProductsModel');
//콜백헬 개선, 페이지네이트
var co = require('co');
var paginate = require('express-paginate');



// GET Collection
router.get('/collections', paginate.middleware(30, 50), async (req, res) => {

    const [results, itemCount ] = await Promise.all([

        ProductsModel.find().sort('-created_at').limit(req.query.limit).skip(req.skip).exec(),
        ProductsModel.count({})
    ]);
    
    const pageCount = Math.ceil(itemCount / req.query.limit);
    const pages = paginate.getArrayPages(req)(3, pageCount, req.query.page);
    console.log(pageCount);
        console.log(req.query.page);
        console.log(pages);

    res.render('collections',

        {
            products : results,
            pages : pages,
            pageCount : pageCount
        }
    );
});
// router.get('/', function(req, res){

//     ProductsModel.find(function(err, products){

//         res.render('home',
//             {
//                 products : products // 디비에서 받은 상품정보를 키:밸류로 내보낸다.
//             }
//         );
//     });
// });


module.exports = router;
