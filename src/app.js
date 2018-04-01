const createApp = require("./createApp");
const DBNAME = process.env.DEPLOY ? 'tclc' : 'test';
console.log("dbname is" + DBNAME);
createApp(3000, DBNAME);
