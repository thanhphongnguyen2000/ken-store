const express = require('express');
const router = express.Router();
const { database } = require('../config/helpers');

/* GET ALL PRODUCTS. */
router.get('/', function(req, res) {
    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1; // set the current page number
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 100; // set the limit of ites per page
    let startValue;
    let endValue;

    if (page > 0) {
        startValue = (page * limit) - limit; //0,10,20,30
        endValue = page * limit;
    } else {
        startValue = 0;
        endValue = 100;
    }

    database.table('sanpham as sp')
        .join([{
            table: "loaisp as lsp",
            on: `lsp.maloaisp = sp.maloaisp`
        }])
        .withFields(['lsp.tenloaisp as tenloaisp', 'lsp.maloaisp as maloaisp', 'sp.tensanpham', 'sp.mota', 'sp.dongia', 'sp.hinhanh', 'sp.soluong', 'sp.masp'])
        .slice(startValue, endValue)
        .sort({ masp: .1 })
        .getAll()
        .then(prods => {
            if (prods.length > 0) {
                res.status(200).json({
                    count: prods.length, //đếm số lượng sản phẩm
                    products: prods
                });
            } else {
                res.json({ message: 'No products founds' });
            }
        }).catch(err => console.log(err));

});

/* GET SINGLE PRODUCTS. */
router.get('/:prodId', function(req, res) {

    let productId = req.params.prodId;
    console.log(productId);

    database.table('sanpham as sp')
        .join([{
            table: 'loaisp as lsp',
            on: 'lsp.maloaisp = sp.maloaisp'
        }])
        .withFields(['lsp.tenloaisp as tenloaisp', 'lsp.maloaisp as maloaisp', 'sp.tensanpham', 'sp.mota', 'sp.dongia', 'sp.hinhanh', 'sp.soluong', 'sp.masp'])
        .filter({
            'sp.masp': productId
        })
        .get()
        .then(prod => {
            if (prod) {
                res.status(200).json(prod);
            } else {
                res.json({ message: 'No products founds with product id $productId' });
            }
        }).catch(err => console.log(err));

});

// GET ALL PRODUCTS FROM ONE PARTICULAR LOAISP
router.get('/loaisp/:tenloaisp', function(req, res) {
    // Sending Page Query Parameter is mandatory http://localhost:3636/api/products/category/categoryName?page=1
    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1; // set the current page number
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 100; // set the limit of ites per page
    let startValue;
    let endValue;

    if (page > 0) {
        startValue = (page * limit) - limit; //0,10,20,30
        endValue = page * limit;
    } else {
        startValue = 0;
        endValue = 100;
    }
    const tenloaisp_lsp = req.params.tenloaisp;

    database.table('sanpham as sp')
        .join([{
            table: "loaisp as lsp",
            on: `lsp.maloaisp = sp.maloaisp WHERE lsp.tenloaisp LIKE '%${tenloaisp_lsp}%'`
        }])
        .withFields(['lsp.tenloaisp as tenloaisp', 'sp.tensanpham', 'sp.mota', 'sp.dongia', 'sp.hinhanh', 'sp.soluong', 'sp.masp'])
        .slice(startValue, endValue)
        .sort({ masp: .1 })
        .getAll()
        .then(prods => {
            if (prods.length > 0) {
                res.status(200).json({
                    count: prods.length, //đếm số lượng sản phẩm
                    products: prods
                });
            } else {
                res.json({ message: `No products founds from $ { tenloaisp_lsp }` });
            }
        }).catch(err => console.log(err));

});

module.exports = router;