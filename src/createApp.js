const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');

const url = 'mongodb://localhost:27017';
const dbName = 'tclc';

function createApp(portNumber, mongoCollectionName) {
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
                .collection(mongoCollectionName);
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

    app.get('/anObjectIdOfAPost', (req, res) => { // This is for unit testing purpose only
        MongoClient.connect(url, (err, client) => {
            const collection = client.db(dbName).collection(mongoCollectionName);
            collection
                .findOne((err, item) => {
                    res.setHeader('Content-Type', 'text/plain');
                    res.send(item._id.toString().replace(/['"]+/g, ''));
                    client.close();
                })
        });
    });

    app.get('/getPostObjectBasedOnId', (req, res) => { // This is for unit testing purpose only
        MongoClient.connect(url, (err, client) => {
            const collection = client.db(dbName).collection(mongoCollectionName);
            collection
                .findOne({_id: new ObjectId(req.body.id)}, (err, item) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(item);
                    client.close();
                })
        });
    });

    app.post('/submitEnglish', (req, res) => {
        MongoClient.connect(url, (err, client) => {
            const collection = client
                .db(dbName)
                .collection(mongoCollectionName);
            const dic = req.body;
            console.log(req.body);
            for (var key in dic) {
                if (dic.hasOwnProperty(key)) {           
                    const newSemanticValue = dic[key];
                    collection.updateOne({"_id": new ObjectId(key)}, { "$set": {"semantic_value": newSemanticValue}})
                }
            }
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

    app.listen(portNumber, () => console.log('Example app listening on port 3000!'));
    return app;
}

module.exports = createApp;