// @ts-check
const MongoClient = require('mongodb').MongoClient;
const URL = 'mongodb://localhost:27017';
function MyMongo(dbName) {
    this.dbName = dbName;

    this.getSomeObjectIds = (callback) => {
        callback(null, [1,2,3,4,5]);
        MongoClient.connect(URL, (err, client) => {
            const collection = client
                .db(this.dbName)
                .collection('english');
            collection
                .find()
                .limit(5)
                .toArray((err, items) => {
                    // callback(err, items);
                    client.close();
                })
        });
    }
}

module.exports = {
    MyMongo
};
