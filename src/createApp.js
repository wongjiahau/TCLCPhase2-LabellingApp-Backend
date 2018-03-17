const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser');
const express = require('express');

function createApp(mongoCollectionName) {
    const app = express();

    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

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
        const url = 'mongodb://localhost:27017';
        const dbName = 'tclc';
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

    app.listen(3000, () => console.log('Example app listening on port 3000!'));
    return app;
}

module.exports = createApp;