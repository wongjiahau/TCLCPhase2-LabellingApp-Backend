const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const URL = 'mongodb://localhost:27017';
function MyMongo(dbName) {
    this.dbName = dbName;

    this.getSomeObjectIds = (callback) => {
        MongoClient.connect(URL, (err, client) => {
            const collection = client
                .db(this.dbName)
                .collection('english');
            collection
                .find()
                .limit(5)
                .toArray((err, items) => {
                    callback(err, items);
                    client.close();
                })
        });
    }

    this.getPostObjectBasedOnId = (objectId, callback) => {
        MongoClient.connect(URL, (err, client) => {
            const collection = client.db(dbName).collection('english');
            collection
                .findOne({_id: new ObjectId(objectId)}, (err, item) => {
                    callback(err, item);
                    client.close();
                })
        });
    }
}

module.exports = {
    MyMongo
};
