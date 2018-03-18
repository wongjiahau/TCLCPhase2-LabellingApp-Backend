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

    this.getPosts = (language, callback) =>{
        MongoClient.connect(URL, (err, client) => {
            const collection = client
                .db(dbName)
                .collection(language);
            collection
                .find({"semantic_value": "unassigned"})
                .limit(10)
                .toArray((err, items) => {
                    const ids = items.map((x) => new ObjectId(x._id));
                    collection.updateMany({ "_id": { "$in": ids } }, { "$set": { "semantic_value": "pending" }
                    }, (updateError, updateResponse) => {
                        callback(updateError, items);
                        client.close();
                    });
                });
        });
    }
}

module.exports = {
    MyMongo
};
