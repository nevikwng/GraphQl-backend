const db = require("../mySql-connect");
const moment = require("moment-timezone");

const GetApi = async (req) => {
    const perPage = 5;
    let page = parseInt(req.params.page) || 1;
    const output = {
        // page: page,
        perPage: perPage,
        totalRows: 0, // 總共有幾筆資料
        totalPages: 0, //總共有幾頁
        rows: [],
    };
    const [r1] = await db.query("SELECT COUNT(1) num FROM orders");
    output.totalRows = r1[0].num;
    output.totalPages = Math.ceil(output.totalRows / perPage);
    if (page < 1) page = 1;
    if (page > output.totalPages) page = output.totalPages;
    if (output.totalPages === 0) page = 0;
    output.page = page;

    if (!output.page) {
        return output;
    }
    const sql =
        "SELECT * FROM `orderitemlist` INNER JOIN `orders` WHERE `orders`.`created_at` = `orderitemlist`.`create_time`";

    const [r2] = await db.query(sql);
    if (r2) output.rows = r2;
    for (let i of r2) {
        // console.log(i.created_at)
        i.created_at = moment(i.created_at).format("YYYY-MM-DD");
    }
    return output;
};

const getapi = async (req, res) => {
    const output = await GetApi(req);
    res.json(output);
    console.log(output);
};



module.exports = {
    getapi,
};