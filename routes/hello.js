var express = require('express');
var router = express.Router();
var mysql = require('mysql');

//★以下を追加
var knex = require('knex')({
    dialect: 'mysql',
    connection: {
        host    : 'localhost',
        user    : 'root',
        password: '',
        database: 'my-nodeapp-db',
        charset : 'utf8'
    }
});

var Bookshelf = require('bookshelf')(knex);

var MyData = Bookshelf.Model.extend({
    tableName: 'mydata'
});

//MySQLの設定情報
var mysql_setting = {
    host     : 'localhost', 
    user     : 'root',
    password : '',
    database : 'my-nodeapp-db'
};

//GETアクセスの処理
router.get('/',(req, res, next) => {
    new MyData().fetchAll().then((collection) => {
        var data = {
            title: 'Hello!',
            content: collection.toArray()
        };
        res.render('hello/index', data);
    })
    
    .catch((err) => {
        res.status(500).json({error: true, data:{message:err.message}});
    })
});

//新規作成ページのアクセス
router.get('/add', (req, res, next) => {
    var data = {
        title: 'Hello/Add',
        content: '新しいコードを入力',
        form: {name:'', mail:'', age:0}
    }
    res.render('hello/add', data);
});

//新規作成フォーム送信の処理
router.post('/add', (req, res, next) => {
    req.check('name', 'NAME は必ず入力して下さい。').notEmpty();
    req.check('mail', 'MAIL はメールアドレスを記入して下さい。').isEmail();
    req.check('age', 'AGE は年齢(整数)を入力して下さい。').isInt();

    req.getValidationResult().then((result) =>{
        if (!result.isEmpty()) {
            var re = '<ul class="error">';
            var result_arr = result.array();
            for (var n in result_arr) {
                re += '<li>' + result_arr[n].msg + '</li>'
            } 
            re += '</ul>';
            var data = {
                title: 'Hello/Add',
                content: re,
                form: req.body
            }
            res.render('hello/add', data);
        } else {
            var nm = req.body.name;
            var ml = req.body.mail;
            var ag = req.body.age;
            var data = {'name':nm, 'mail':ml, 'age':ag};

            var connection = mysql.createConnection(mysql_setting)
            connection.connect();
            connection.query('insert into mydata set ?', data, function(error, results, fields) {
                res.redirect('/hello');
            });
            connection.end();
        }
    });
});

//指定IDのレコード表示する
router.get('/show', (req, res, next) => {
    var id = req.query.id;

    //データベースの設定情報
    var connection = mysql.createConnection(mysql_setting);

    //データベースに接続
    connection.connect();

    //データを取り出す
    connection.query('SELECT * from mydata where id=?', id, function(error, results, fields) {
        //データベースアクセス完了時の処理
        if (error == null) {
            var data = {
                title: 'Hello/show',
                content: 'id = ' + id + 'のレコード',
                mydata: results[0]
            }
            res.render('hello/show', data);
        }
    });

    //接続を解除
    connection.end();
});

//指定レコードを編集
router.get('/edit', (req, res, next) => {
    var id = req.query.id;

    //データベースの設定情報
    var connection = mysql.createConnection(mysql_setting);

    //データベースに接続
    connection.connect();

    //データを取り出す
    connection.query('SELECT * from mydata where id=?', id, function(error, results, fields) {
        //データベースアクセス完了時の処理
        if (error == null) {
            var data = {
                title: 'Hello/edit',
                content: 'id = ' + id + ' のレコード:',
                mydata: results[0]
            }
            res.render('hello/edit', data);
        }
    });

    //接続を解除
    connection.end();
});

//編集フォーム送信の処理
router.post('/edit', (req, res, next) => {
    var id = req.body.id;
    var nm = req.body.name;
    var ml = req.body.mail;
    var ag = req.body.age;
    var data = {'name':nm, 'mail':ml, 'age':ag};

    //データベースの設定情報
    var connection = mysql.createConnection(mysql_setting);

    //データベースに接続
    connection.connect();

    //データを取り出す
    connection.query('update mydata set ? where id = ?', [data, id], function(error, results, fields) {
        res.redirect('/hello');
    });

    //接続を解除
    connection.end();
});

//レコードを削除
router.get('/delete', (req, res, next) => {
    var id = req.query.id;

    //データベースの設定情報
    var connection = mysql.createConnection(mysql_setting);

    //データベースに接続
    connection.connect();

    //データを取り出す
    connection.query('SELECT * from mydata where id=?', id, function(error, results, fields) {
        //データベースアクセス完了時の処理
        if (error == null) {
            var data = {
                title: 'Hello/delete',
                content: 'id= ' + id + 'のレコード:',
                mydata: results[0]
            }
            res.render('hello/delete', data);
        }
    });

    //接続を解除
    connection.end();
});

//削除フォームの送信処理
router.post('/delete', (req, res, next) =>{
    var id = req.body.id;

    //データベースの設定情報
    var connection = mysql.createConnection(mysql_setting);

    //データベースに接続
    connection.connect();

    //データを取り出す
    connection.query('delete from mydata where id=?', id, function(error, results, fields) {
        res.redirect('/hello');
    });

    //接続を解除
    connection.end();
});

router.get('/find', (req, res, next) => {
    var data = {
        title: 'Hello/Find',
        content: '検索IDを入力',
        form: {fstr:''},
        mydata: null
    };
    res.render('hello/find', data);
});

router.post('/find', (req, res, next) => {
    new MyData().where('id', '=', req.body.fstr).fetch().then((collection) => {
        var data = {
            title: 'Hello!',
            content: '※id =' + req.body.fstr + 'の検索結果：',
            form: req.body,
            mydata: collection
        };
        res.render('hello/find', data);
    })
});

module.exports = router;