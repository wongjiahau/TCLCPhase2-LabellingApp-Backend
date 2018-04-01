const createApp = require("./createApp");
console.log(process.env.DEPLOY);
const DBNAME = process.env.DEPLOY === "1" ? 'tclc' : 'test';
console.log("dbname is" + DBNAME);
createApp(3000, DBNAME);
