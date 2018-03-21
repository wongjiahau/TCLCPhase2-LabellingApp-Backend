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

    this.fetchAdminData = (language, callback) => {
            MongoClient.connect(URL, (err, client) => {
                const collection = client.db(dbName).collection(language);
                collection.aggregate(
                    [{ $group: { _id: { source: '$source', semantic_value: '$semantic_value' }, total: {$sum: 1} } }])
                    .toArray((err1, items1) => {
                        callback(err1, items1);
                });
            });
    }

    this.fetchNumberOfPostLabelledToday = (language, callback) => {
            MongoClient.connect(URL, (err, client) => {
                const collection = client.db(dbName).collection(language);
                collection.find({labelled_on: {$exists: true}}, {labelled_on :1, _id: 0}).toArray((err, items) => {
                    const dates = items.map((x) => x.labelled_on);
                    const epochOfTodayMidnight = new Date();
                    epochOfTodayMidnight.setHours(0, 0, 0, 0);
                    callback(err, dates.filter((x) => x > epochOfTodayMidnight.getTime()).length);
                });
            });

    }


}


module.exports = {
    MyMongo
};
