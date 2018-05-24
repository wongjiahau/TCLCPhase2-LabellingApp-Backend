// @ts-check
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const MyMongo = require('./myMongo').MyMongo;

function tryDo(lambda) {
    try {
        const result = lambda();
        return result;
    } catch(error) {
        console.log(`Error caught at tryDo : ${error}`);
        return {error: error};
    }
}

const url = 'mongodb://database:27017';
function createApp(portNumber, useSampleData = false) {
    const myMongo = new MyMongo(useSampleData);
    const app = express();
    app.use(cors());
    app.use(function(req, res, next) {
        console.log(`Incoming request at ${req.url}`);
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

    app.get('/', (req, res) => {
        res.send('Hello new World!');
    });

    app.get('/hello', (req, res) => {
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({message: 'Hello World!'}));
    });

    app.get('/getPostsChinese', (req, res) => {
        const result = tryDo(() => myMongo.getPosts("chinese"));
        res.setHeader('Content-Type', 'application/json');
        res.send({posts: result});
    });

    app.get('/getPostsEnglish', (req, res) => {
        const result = tryDo(() => myMongo.getPosts("english"));
        res.setHeader('Content-Type', 'application/json');
        res.send({posts: result});
    });

    app.get('/resetUpdates', (req, res) => {
        try {
            myMongo.resetUpdates("chinese");
            myMongo.resetUpdates("english");
            res.send("OK");
        } catch (error) {
            res.status(999).send("ERROR");
        }
    })

    app.get('/someUids', (req, res) => { // This is for unit testing purpose only
        const result = tryDo(() => myMongo.getSomeUids());
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result));
    });

    app.get('/getPostObjectBasedOnUid', (req, res) => { // This is for unit testing purpose only
        const result = tryDo(() => myMongo.getPostObjectBasedOnUid(req.body.id));
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result));
    });

    app.post('/submitEnglish', (req, res) => {
        const result = tryDo(() => myMongo.submitUpdates("english", req.body));
        if(result.error) {
            res.send("Failed due to: " + result.error)
            return;
        }
        res.send("ok");
    });

    app.post('/submitChinese', (req, res) => {
        myMongo.submitUpdates('chinese', req.body, 
            () => {res.send('success');},
            (error) => {res.send('failed due to: ' + error)}
        );
    });

    app.get('/fetchAdminDataEnglish', (req, res) => {
        myMongo.fetchAdminData('english', (err, item) => {
            if(err) {
                res.send(err);
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(item);
        });
    });

    app.get('/fetchAdminDataChinese', (req, res) => {
        myMongo.fetchAdminData('chinese', (err, item) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(item);
        });
    });

    app.get('/fetchNumberOfPostLabelledToday', (req, res) => {
        myMongo.fetchNumberOfPostLabelledToday('english', (err1, res1) => {
            myMongo.fetchNumberOfPostLabelledToday('chinese', (err2, res2) => {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(res1 + res2));
            });
        });
    });


    app.post('/login', (req, res) => {
        const userId = req.body.userId;
        const pass = req.body.pass;
        res.setHeader('Content-Type', 'application/json');
        const userIdIsCorrect = userId === 'some hashed userId';
        const passwordIsCorrect = pass === 'some hashed password';
        res.send(JSON.stringify({
            isAuthenticated: userIdIsCorrect && passwordIsCorrect
        }));
    });

    app.listen(portNumber, () => console.log(`The server is listening on port ${portNumber}!`));
    return app;
}

module.exports = createApp;