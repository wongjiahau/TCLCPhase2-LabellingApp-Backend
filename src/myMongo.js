// Global variables (this is dangerous...)
const DATA = {};

// Import modules
const fs = require("fs");
const hash = require("object-hash");


// Polyfill of Object.values()  // Refer https://stackoverflow.com/questions/11734417/javascript-equivalent-of-pythons-values-dictionary-method
function values(o){return Object.keys(o).map(function(k){return o[k]})};

function getDataPath(language, usingSampleData = false) {
  // Where the data is stored
  const base = `../dockerfiles/database/data`;
  return `${base}/${language}/${usingSampleData ? "sampleData" : "actualData"}`;
}

function loadData(language /* "english" or "chinese" */, usingSampleData = false) {
  console.log("Loading data for " + language);
  const path = getDataPath(language, usingSampleData);
  const file = fs.readFileSync(`${path}/data.json`).toString();
  const json = JSON.parse(file);

  const result = {}
  // Setting UID for every post object using hash algorithm
  for (let i = 0; i < json.length; i++) {
    const uid = hash(json[i]);
    json[i].uid = uid;
    result[uid] = json[i]
  }

  // Applying updates
  const updatePath = `${path}/updates`;
  const filenames = fs.readdirSync(updatePath);
  filenames.forEach(name => {
    const updates = JSON.parse(fs.readFileSync(`${updatePath}/${name}`).toString());
    updates.forEach(u => applyUpdate(result, u));
  });

  console.log(`Total number of records for ${language} = ${values(result).length}`);
  return result;
}

function writeUpdates(language, usingSampleData, updates) {
  const currentEpoch = new Date().getTime();
  const filePath = `${getDataPath(language, usingSampleData)}/updates/${currentEpoch}.json`;
  for (let i = 0; i < updates.length; i++) {
    applyUpdate(DATA[language], updates[i]);
  }
  fs.writeFileSync(filePath, JSON.stringify(updates, null, 2));
}

function createUpdates(uid, propertyName, newValue) {
  return {
    uid: uid,
    propertyName: propertyName,
    newValue: newValue
  };
}

function applyUpdate(data, update) {
  data[update.uid][update.propertyName] = update.newValue;
}



const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const URL = 'mongodb://database:27017';
function MyMongo(usingSampleData = false) {
  this.usingSampleData = usingSampleData;

  DATA["english"] = loadData("english", usingSampleData);
  DATA["chinese"] = loadData("chinese", usingSampleData);
  
  
  this.resetUpdates = (language) => {
    console.log("Resetting updates for " + language);
    const updatePath = getDataPath(language, this.usingSampleData) + "/updates";
    const filenames = fs.readdirSync(updatePath);
    console.log(updatePath);
    filenames.forEach(name => {
      console.log(`Removing ${updatePath}/${name}`);
      fs.unlinkSync(`${updatePath}/${name}`);
    })
  }

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
      const collection = client
        .db(dbName)
        .collection('english');
      collection.findOne({
        _id: new ObjectId(objectId)
      }, (err, item) => {
        callback(err, item);
        client.close();
      })
    });
  }

  this.getPosts = (language) => {
    let data = values(DATA[language]);
    data = data.filter(x => x.semantic_value === "unassigned" && !x.hasOwnProperty("absorbedBy"));
    data = data.filter(x => x.origin === data[0].origin).slice(0, 10);
    const updates = [];
    for (let i = 0; i < data.length; i++) {
      updates.push(createUpdates(data[i].uid, "semantic_value", "pending"));
    }
    writeUpdates(language, usingSampleData, updates);
    return data;
  }

  this.submitUpdates = (language, submitData, successCallback, errorCallback) => {
    MongoClient.connect(URL, (err, client) => {
      const collection = client
        .db(dbName)
        .collection(language);
      const updates = submitData.updates;
      console.log(submitData);
      for (var key in updates) {
        if (updates.hasOwnProperty(key)) {
          var newSemanticValue = updates[key];
          collection.updateOne({
            "_id": new ObjectId(key)
          }, {
            "$set": {
              "semantic_value": newSemanticValue,
              "labelled_on": (new Date()).getTime()
            }
          }, (error, item) => {
            if (error) {
              errorCallback(error);
            }
          });
        }
      }
      const merges = submitData.merges;
      merges.forEach((m) => {
        collection.updateMany({_id: {$in : m.absorbees.map((id) => new ObjectId(id))}}, {
            $set: {
              absorbedBy: m.absorber
            }
        }, (err2, res2) => {
          if(err2) return;
          updateMalayPosts();
        });
        collection.findOne({"_id": new ObjectId(m.absorber)})
      });

      function updateMalayPosts(){
        const malayPosts = submitData.malayPosts;
        collection.updateMany({_id: {$in : malayPosts.map((id) => new ObjectId(id))}}, {
            $set: {
              isMalay: true
            }
        }, (err3, res3) => {
          if(!err3) successCallback();
          // console.log(res3);
        });
      }

    });
  }

  this.fetchAdminData = (language, callback) => {
    MongoClient.connect(URL, (err, client) => {
      const collection = client
        .db(dbName)
        .collection(language);
      collection.aggregate([
        {
          $group: {
            _id: {
              source: '$source',
              semantic_value: '$semantic_value'
            },
            total: {
              $sum: 1
            }
          }
        }
      ]).toArray((err1, items1) => {
        callback(err1, items1);
      });
    });
  }

  this.fetchNumberOfPostLabelledToday = (language, callback) => {
    MongoClient.connect(URL, (err, client) => {
      const collection = client
        .db(dbName)
        .collection(language);
      collection.find({
        semantic_value: {
          $nin: ['pending', 'unassigned']
        },
        labelled_on: {
          $exists: true
        }
      }, {
        labelled_on: 1,
        _id: 0
      }).toArray((err, items) => {
        const dates = items.map((x) => x.labelled_on);
        const epochOfTodayMidnight = new Date();
        epochOfTodayMidnight.setHours(0, 0, 0, 0);
        const numberOfPostLabelledToday = dates.filter((x) => x > epochOfTodayMidnight.getTime()).length;
        callback(err, numberOfPostLabelledToday);
      });
    });

  }

}

module.exports = {
  MyMongo
};
