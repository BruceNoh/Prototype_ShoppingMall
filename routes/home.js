var express = require('express');
var router = express.Router();
var ProductsModel = require('../models/ProductsModel');
//콜백헬 개선, 페이지네이트
var co = require('co');
var paginate = require('express-paginate');



// GET Home
router.get('/', paginate.middleware(8, 50), async (req, res) => {

    const [results, itemCount ] = await Promise.all([

        ProductsModel.find().sort('-created_at').limit(req.query.limit).skip(req.skip).exec(),
        ProductsModel.count({})
    ]);
    
    const pageCount = Math.ceil(itemCount / req.query.limit);
    const pages = paginate.getArrayPages(req)(3, pageCount, req.query.page);
    console.log(pageCount);
        console.log(req.query.page);
        console.log(pages);

    res.render('home',

        {
            products : results,
            pages : pages,
            pageCount : pageCount
        }
    );
});

module.exports = router;