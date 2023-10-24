require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());                   //json을 사용하겠다.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const mysql = require('mysql');

const PORT = process.env.port || 3000;

app.listen(PORT,()=>{
    console.log('Server is running on port 3000');
})
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
    console.log("IP:Port",)
    console.log("연결 되었습니다. 연결 ID : " + connection.threadId);

});

connection.query('SELECT * FROM userid',(err,results,fields)=>{
    
    if(err) throw err;
    
    const dataArray = results;

    console.log('데이터 배열 : ',dataArray);
});

//connection.end((err)=>{
//    if(err){
//        console.error('MySQL 연결 종료 오류 : ' + err.stack);
//        return;
//    }
//    console.log("MySQL 연결이 성공적으로 종료되었습니다.");
//});

const secretKey = 'secretkey';              //비밀 키 (반드시 보안);

function verifyToken(req, res, next)        //미들웨어 함수를 사용하여 토큰 검사
{
    const token = req.headers.authorization;        //클라이언트에서 해더에 토큰을 넣어서 보낸다.

    if(!token)
    {
        return res.status(403).json({message : 'No token provided'});
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if(err) 
        {
            return res.status(401).json({message: 'failed to authenticate token'});
        }
        req.decoded == decoded;
        next();
    });
}

app.post('/login', (req, res) => {
    const { userID, userPassword } = req.body;

    connection.query(`SELECT * FROM userid WHERE userID = '${userID}'`, (err, results, fields) => {
    if (err) throw err;

    if (results.length > 0) {
        // 조건에 맞는 레코드가 존재할 때
        console.log('리졸트 : ',results);
        console.log('리졸트 유저 패스워드 : ',results[0].userPassword);
        console.log('입력 패스워드 : ',userPassword);
        if(results[0].userPassword === userPassword)
        {
            const token = jwt.sign({username: results.username} , secretKey , { expiresIn: '1h' });
            console.log(token);
            res.status(200).json({token});
            console.log("패스워드 일치");
        }
        else
        {
            res.status(401).send("Password not correct");
        }
        console.log('데이터가 존재합니다.');
    } 
    else
    {
        // 조건에 맞는 레코드가 존재하지 않을 때
        res.status(404).send("ID does not exist");
        console.log('데이터가 존재하지 않습니다.');
    }
});
});
app.post('/loginSuccess',(req,res)=>
{
    connection.query(`SELECT * FROM userid WHERE userID = '${req.body.userID}'`, (err, results, fields) => 
    {
        console.log('있긴헌디~?');
        console.log(results[0]);
        res.status(200).json(results[0]);
    });
});

app.post('/invenInfo',(req,res)=>
{
    const {userID} = req.body;
    connection.query(`SELECT * FROM PlayerInventory WHERE userID = '${userID}'`, (err, results, fields) => 
    {
        console.log('인벤은 찾음');
        console.log("레큐바디",userID);
        if(results.length > 0)
        {
            res.status(200).json(results[0]);
            console.log('인벤 가져옴 결과: ', results[0]);
        }
        else
        {
            connection.query(`INSERT INTO PlayerInventory (userID) VALUES ('${req.body.userID}')`, (err, resultsInsert, fields) => {
                {
                    connection.query(`SELECT * FROM PlayerInventory WHERE userID = '${userID}'`, (err, SELECTresults, fields) => 
                    {
                        console.log('인벤 생성');
                        console.log("레큐바디",userID);
                        console.log('생성, 인벤 가져옴 결과: ', SELECTresults[0]);
                        res.status(200).json(SELECTresults[0]);

                    });
                }
            });
        }
    });
});


app.post('/regist', (req, res) => {
    const { userID, userName, userPassword } = req.body;

    connection.query(`SELECT * FROM userid WHERE userID = '${userID}'`, (err, results, fields) => {
        if (err) 
        {
            console.error('중복 아이디 확인 중 오류 발생: ' + err);
            res.status(500).send('중복 아이디 확인 중 오류 발생');
        } 
        else {
            if (results.length > 0) 
            {
                res.status(400).send('중복된 아이디입니다. 다른 아이디를 선택해주세요.');
            } 
            else 
            {
                connection.query(`INSERT INTO userid (userID, userName, userPassword) VALUES ('${userID}', '${userName}', '${userPassword}')`, (err, results, fields) => {
                    if (err) 
                    {
                        console.error('회원가입 오류: ' + err);
                        res.status(500).send('회원가입 오류');
                    } else 
                    {
                        const dataArray = results;
                        console.log('회원가입 결과: ', dataArray);
                        res.send('회원가입 성공');
                    }
                });
            }
        }
    });
});

app.post('/updateInven', (req, res) => {
    const { userID, money, maxRegrade, WeaponIndex } = req.body;
    
    connection.query(`UPDATE PlayerInventory SET money = ${money}, maxRegrade = ${maxRegrade}, WeaponIndex = ${WeaponIndex} WHERE userID = '${userID}'`, (err, results, fields) => {
        if (err) {
            console.error('정보 업데이트 실패: ' + err);
            res.status(500).send('정보 업로드 오류');
        } else {
            console.log('정보 업데이트 결과 : ', results);
            res.status(200).send('정보 업로드 성공')
        }
    });
});

app.post(`/getItemTable`, (req,res)=>{
    connection.query("SELECT * FROM ItemTable",(err, results, fields) => {
    if (err)
        {
        console.error('정보 업로드 실패: ' + err);
            res.status(500).send('아이템 테이블 전송 오류');
        }
        else
        {
            console.log('정보 업로드 결과 : ', results);
            res.status(200).json({results});
        }
    }
    );
});
