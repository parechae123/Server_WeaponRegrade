require('dotenv').config();

const mysql = require('mysql');

//MYSQL 연결 설정

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});


connection.connect((err)=>{

    if(err)
    {
        console.error("MYSQL 연결 오류 : " + err.stack);
        return;
    }

    console.log("연결 되었습니다. 연결 ID : " + connection.threadId);

});

connection.query('SELECT * FROM userid',(err,results,fields)=>{

    if(err) throw err;
    
    const dataArray = results;

    console.log('데이터 배율 : ',dataArray);

});

app.post('/regist', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const sql = "INSERT INTO userid (username, password) VALUES (?, ?)";
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            console.error('사용자 정보 삽입 오류: ' + err);
            res.status(500).send('사용자 정보 삽입 오류');
        } else {
            console.log('새로운 사용자가 데이터베이스에 추가되었습니다.');
            res.send('회원가입 성공');
        }
    });
})

connection.end((err)=>{
    if(err){
        console.error('MySQL 연결 종료 오류 : ' + err.stack);
        return;
    }
    console.log("MySQL 연결이 성공적으로 종료되었습니다.");
});