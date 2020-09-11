
const express = require("express");
const {
    getapi,
} = require("../controller/orderCtl");

const router = express.Router();

router.get('/api/OrderListDeatail', getapi)




module.exports = router;
