// @ts-check
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const MyMongo = require('./myMongo').MyMongo;


const url = 'mongodb://localhost:27017';
function createApp(portNumber, dbName) {
    const myMongo = new MyMongo(dbName);
    const app = express();

    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
    app.use(cors());

    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    app.get('/hello', (req, res) => {
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({message: 'Hello World!'}));
    });

    app.get('/getPostsChinese', (req, res) => {
        res.send("Not implemented yet");
    });

    app.get('/getPostsEnglish', (req, res) => {
        MongoClient.connect(url, (err, client) => {
            const collection = client
                .db(dbName)
                .collection('english');
            collection
                .find({"semantic_value": "unassigned"})
                .limit(10)
                .toArray((err, items) => {
                    const ids = items.map((x) => new ObjectId(x._id));
                    collection.updateMany({ "_id": { "$in": ids } }, { "$set": { "semantic_value": "pending" }
                    }, (updateError, updateResponse) => {
                        if (updateError) {
                            res.send(JSON.stringify(updateError));
                        }
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify(items));
                        client.close();
                    });
                });
        });
    });

    app.get('/someObjectIds', (req, res) => { // This is for unit testing purpose only
        myMongo.getSomeObjectIds((err, items) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(items.map((x) => x._id)));
        });
    });

    app.get('/getPostObjectBasedOnId', (req, res) => { // This is for unit testing purpose only
        myMongo.getPostObjectBasedOnId(req.body.id, (err, item) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(item);
        });
    });

    app.post('/submitEnglish', (req, res) => {
        MongoClient.connect(url, (err, client) => {
            const collection = client
                .db(dbName)
                .collection('english');
            const dic = req.body;
            console.log(dic);
            for (var key in dic) {
                if (dic.hasOwnProperty(key)) {           
                    var newSemanticValue = dic[key];
                    console.log(newSemanticValue);
                    collection.updateOne({"_id": new ObjectId(key)}, { "$set": {"semantic_value": newSemanticValue}}, (error, item) => {
                        if(error) {
                            res.send('failed');
                        }
                    });
                }
            }
            res.send('success');
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

    app.listen(portNumber, () => console.log(`Example app listening on port ${portNumber}!`));
    return app;
}

module.exports = createApp;