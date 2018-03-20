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

    this.submitUpdates = (language, updateDic, successCallback, errorCallback) => {
        MongoClient.connect(URL, (err, client) => {
            const collection = client
                .db(dbName)
                .collection(language);
            const dic = updateDic;
            for (var key in dic) {
                if (dic.hasOwnProperty(key)) {           
                    var newSemanticValue = dic[key];
                    console.log(newSemanticValue);
                    collection.updateOne({"_id": new ObjectId(key)}, 
                    { "$set": {"semantic_value": newSemanticValue, "labelled_on": (new Date()).getTime()}}, 
                        (error, item) => {
                            if(error) {
                                errorCallback(error);
                            }
                    });
                }
            }
            successCallback();
        });
    }

    this.fetchAdminData = (callback) => {
        ['english', 'chinese'].forEach(language => {
            MongoClient.connect(URL, (err, client) => {
                const collection = client.db(dbName).collection(language);
                collection.aggregate([{$group: {_id:"$source", total: {$sum:1}}}]).toArray((err1, items1) => {
                    console.log(items1);
                    // callback(err1,items1);
                    collection.aggregate([{$match: {semantic_value: 'unassigned'}}, {$group: {_id:"$source", unassigned: {$sum:1}}}], (err2, items2) => {
                        // callback(err2, {a: items1, b: items2});
                    });
                });
            });

        });
    }
}


module.exports = {
    MyMongo
};
