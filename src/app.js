const createApp = require("./createApp");
const DEBUGGING = true;
const DBNAME = DEBUGGING ? 'test' : 'tclc';
createApp(3000, DBNAME);
