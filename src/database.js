// Import modules
const log = require("./log");
const fs = require("fs");
const hash = require("object-hash");

/**
 * The definition for Database class
 * Note that its actually using plain filesystem
 */
function Database(usingSampleData = false) {
  this.DATA = {};
  this.usingSampleData = usingSampleData;
  
  this.loadData = () => {
    this.DATA["english"] = loadData("english", this.usingSampleData);
    this.DATA["chinese"] = loadData("chinese", this.usingSampleData);
  }

  this.loadData();
  
  
  this.resetUpdates = (language) => {
    log("Resetting updates for " + language);
    const updatePath = getDataPath(language, this.usingSampleData) + "/updates";
    const filenames = fs.readdirSync(updatePath);
    filenames.forEach(name => {
      if(name.includes(".json")) {
        log(`Removing ${updatePath}/${name}`);
        fs.unlinkSync(`${updatePath}/${name}`);
      }
    })
    this.loadData()
  }

  this.getSomeUids = (language = "english") => {
    return values(this.DATA[language]).slice(0, 5).map(x => x._id);
  }

  this.getPostObjectBasedOnUid = (_id, language = "english") => {
    return this.DATA[language][_id];
  }

  this.getPosts = (language) => {
    let data = values(this.DATA[language]);
    data = data.filter(x => x.semantic_value === "unassigned" && !x.hasOwnProperty("absorbedBy"));
    data = data.filter(x => x.origin === data[0].origin).slice(0, 10);
    const updates = [];
    for (let i = 0; i < data.length; i++) {
      updates.push(createUpdates(data[i]._id, "semantic_value", "pending"));
    }
    this.writeUpdates(language, updates);
    return data;
  }

  this.writeUpdates = (language, updates) => {
    const currentEpoch = new Date().getTime();
    const filePath = `${getDataPath(language, this.usingSampleData)}/updates/${currentEpoch}.json`;
    for (let i = 0; i < updates.length; i++) {
      applyUpdate(this.DATA[language], updates[i]);
    }
    fs.writeFileSync(filePath, JSON.stringify(updates, null, 2));
  }

  this.submitUpdates = (language, submitData) => {
    const incomingUpdates = submitData.updates;
    const updates = [];
    for (var _id in incomingUpdates) {
      if (incomingUpdates.hasOwnProperty(_id)) {
        var newSemanticValue = incomingUpdates[_id];
        updates.push(createUpdates(_id, "semantic_value", newSemanticValue));
        updates.push(createUpdates(_id, "labelled_on", (new Date()).getTime()));
      }
    }
    submitData.merges.forEach(m => {
      m.absorbees.forEach((_id) => {
        updates.push(createUpdates(_id, "absorbedBy", m.absorber));
      })
    });
    
    submitData.malayPosts.forEach(_id => {
      updates.push(createUpdates(_id, "isMalay", true));
    });

    this.writeUpdates(language, updates);
    return "ok";
  }

  this.getRawData = (language) => {
    return this.DATA[language];
  }

  this.generateOutput = (language) => {
    log(`
      Generating output . . .
      Saving file as ./${language}_output.json
    `);
    fs.writeFileSync(`./${language}_output.json`, JSON.stringify(this.DATA[language], null, 2));
  }

  this.generateAnalysisReport = (language) => {
    const data = values(this.DATA[language]);
    const count = (posts, semanticValue) => posts.filter(x => x.semantic_value === semanticValue).length;
    return {
      positive:   count(data, "positive"),
      negative:   count(data, "negative"),
      neutral:    count(data, "neutral"),
      pending:    count(data, "pending"),
      unassigned: count(data, "unassigned"),
      merged:     data.filter(x => x.hasOwnProperty("absorbedBy")).length
    };
  }

  // Log the current status of data
  log("Status of english posts" + JSON.stringify(this.generateAnalysisReport("english"), null ,2))
  log("Status of chinese posts" + JSON.stringify(this.generateAnalysisReport("chinese"), null ,2))
}


module.exports = {
  Database
};

// Polyfill of Object.values()  // Refer https://stackoverflow.com/questions/11734417/javascript-equivalent-of-pythons-values-dictionary-method
function values(o){return Object.keys(o).map(function(k){return o[k]})};

function getDataPath(language, usingSampleData = false) {
  // Where the data is stored
  const base = `../data`;
  return `${base}/${language}/${usingSampleData ? "sampleData" : "actualData"}`;
}

function loadData(language /* "english" or "chinese" */, usingSampleData = false) {
  log("Loading data for " + language);
  const path = getDataPath(language, usingSampleData);
  const file = fs.readFileSync(`${path}/data.json`).toString();
  const json = JSON.parse(file);

  const result = {}
  // Setting UID for every post object using hash algorithm
  for (let i = 0; i < json.length; i++) {
    const _id = hash(json[i]);
    json[i]._id = _id;
    result[_id] = json[i]
  }

  // Applying updates
  const updatePath = `${path}/updates`;
  const filenames = fs.readdirSync(updatePath);
  filenames.forEach(name => {
    if(name.includes(".json")) {
      const updates = JSON.parse(fs.readFileSync(`${updatePath}/${name}`).toString());
      updates.forEach(u => applyUpdate(result, u));
    }
  });

  log(`Total number of records for ${language} = ${values(result).length}`);
  return result;
}

function createUpdates(_id, propertyName, newValue) {
  return {
    _id: _id,
    propertyName: propertyName,
    newValue: newValue
  };
}

function applyUpdate(data, update) {
  data[update._id][update.propertyName] = update.newValue;
}