var express = require('express');
var router = express.Router();
var moment = require('moment');
const bodyParser = require('body-parser');
moment().format();

//------BODY PARSER-----------\\
// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
router.use(bodyParser.json())
//----------END BP----------\\

/* GET home page. */
module.exports = (pool) => {

  router.get('/', function (req, res, next) {
    const { ck1, ck2, ck3, ck4, ck5, ck6, nmid, nmstring, nminteger, nmfloat, nmdatestart, nmdateend,
      nmboolean } = req.query;

    // data untuk menampung filter
    let temp = []

    let stat = false

    // ---------------------------- function filter ----------------------------
    if (ck1 && nmid) {
      temp.push(`id = ${nmid}`)
      stat = true
    }

    if (ck2 && nmstring) {
      temp.push(`"dataString" = '${nmstring}'`)
      stat = true
    }

    if (ck3 && nminteger) {
      temp.push(`"dataInteger" = ${nminteger}`)
      stat = true
    }

    if (ck4 && nmfloat) {
      temp.push(`"dataFloat" = ${nmfloat}`)
      stat = true
    }

    if (ck5 && nmdatestart && nmdateend) {
      temp.push(`"dataDate" BETWEEN '${nmdatestart}' and '${nmdateend}'`)
      stat = true
    }

    if (ck6 && nmboolean) {
      temp.push(`"dataBoolean" = '${nmboolean}'`)
      stat = true
    }
    //------------------------------------------------------------------------------------ 
    // conversi dari array ke string
    let joindata = temp.join(' and ');

    console.log(joindata);

    let sql = `SELECT count(*) as total FROM inputan`;
    //  kondisi ketika filter
    if (stat == true) {
      sql += ` where ${joindata} `
    }
    pool.query(sql, [], (err, count) => {
      let rows = count.rows[0].total //jumlah data dalam table
      console.log(count[0]);
      
      let page = req.query.page || 1; // nilai awal page
      let limit = 3; // batas data yang di tampilkan 
      let totalPage = Math.ceil(rows / limit) // mencari jumlah data
      let pages = (page - 1) * limit
      let queries = req.url === '/' ? '/?page=1' : req.url;
      let Query = req.query;

      sql = `select * from inputan`;
      if (stat == true) {
        sql += ` where ${joindata} `
      }
      sql += ` LIMIT ${limit} OFFSET ${pages}`

      pool.query(sql, [], (err, row) => {

        console.log(row.rows);
        res.render('index', { data: row.rows, moment, pages: totalPage, current: page, query:queries, Query:Query});

      })


    });
    //---------ADD-----------\\
    router.get('/add', (req, row) => row.render('add'))
    router.post('/add', (req, res) => {
      const sqladd = `INSERT INTO inputan ("dataString", "dataInteger", "dataFloat", "dataBoolean", "dataDate") VALUES($1,$2,$3,$4,$5)`
      pool.query(sqladd, [req.body.dataString, parseInt(req.body.dataInteger), parseFloat(req.body.dataFloat), JSON.parse(req.body.dataBoolean), req.body.dataDate], (err) => {
        if (err) throw err;

        console.log('Susccess add inputan');
        res.redirect('/');
      })

    });


    //------------------EDIT------------\\
    router.get('/edit/:id', (req, res) => {
      let edit = parseInt(req.params.id);
      let sqlgetedit = `SELECT * FROM inputan WHERE id=$1`;
      // let edit = req.params;
      console.log(sqlgetedit);


      pool.query(sqlgetedit, [edit], (err, data) => {
        if (err) throw err;
        // console.log(row[0])
        console.log('suksess edit');

        res.render('edit', { item: data.rows[0], moment })//... membuat memori baru
      })
    })
    router.post('/edit/:id', (req, res) => {
      let id = req.params.id;
      let sqlpostedit = `UPDATE inputan 
  SET "dataString" =$1, "dataInteger"=$2, "dataFloat" =$3, "dataDate"=$4, "dataBoolean"=$5 WHERE id=$6`

      pool.query(sqlpostedit, [req.body.dataString, parseInt(req.body.dataInteger), parseFloat(req.body.dataFloat), req.body.dataDate, JSON.parse(req.body.dataBoolean), id], (err, row) => {
        if (err) throw err;

        res.redirect('/');
      })

    })
  });

    //--------DELETED--------\\
    // app.get('/deleted/:id', (req, res) => res.render('deleted'))
    router.get('/deleted/:id', (req, res) => {
      let sqldeleted = `DELETE FROM inputan WHERE id=$1`;
      let deleted = parseInt(req.params.id);
      console.log(deleted);


      pool.query(sqldeleted, [deleted], (err) => {
        if (err) throw err;
        console.log('susccess deleted!')
        res.redirect('/');
      })


    })


    return router;

  }
