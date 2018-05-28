# TCLCPhase2-LabellingApp-Backend
## Where does the initial data comes from?
They came from the following link:
-  https://raw.githubusercontent.com/fesvictor/TCLCPhase2/master/analysis/transform_format_for_mongodb/chinese.json 
- https://raw.githubusercontent.com/fesvictor/TCLCPhase2/master/analysis/transform_format_for_mongodb/english.json 

## How it works?
First, the data is stored as JSON with name of `chinese.json` and `english.json`.  
These files contain the post data.

Then, we will use `node.js` to spawn a REST-API server.  

When the server is stared, it will load the data from the JSON files into RAM.  

After that, when updates for posts data is received, those updates will be written to a folder named `updates`.

## What does that means?
It means the `chinese.json` and `english.json` files is never modified!

## So ... 
Whenever the data is loaded, those updates are also loaded and applied on the data. 

## Why not just update the original files?
Firstly, if the server crash halfway, it may corrupt the file, making it hard to retrieve all the works that had been done before.

Secondly, we can revert some changes by just deleting some updates files. (*Wait, how does this work?!!* I'll explain shortly)

## How the update works?
Imagine we have the following data.
```js
const data = [
    {uid: 1, name: "Ali", age: 99},
    {uid: 2, "John", age: 19}
]
```
So, we have two objects (note that all of them have a Unique IDentifier, aka **uid**). 

Now, if I want to change the name of `Ali` to `Baby`, I will store the following into an update file.
```js
{
    uid: 1,
    propertyName: "name",
    newValue: "Baby"
}
```
Then, how is the file named? The file will be named using [Epoch time](https://en.wikipedia.org/wiki/Unix_time).  
For example, `1527130748.json`.

## Why the update file is named using Epoch time?
This is to allow you to revert changes to a specified time.

For example, if you want to revert changes to yesterday, and let say yesterday have an Epoch time of `1555555555`, then, you just need to delete all the update files that has value bigger than `1555555555`.


## Possible drawbacks
Since a new file is created for every updates, there will be a problem where the filesystem doesn't allow new files to be created anymore, since in a UNIX system, there are a limit called *number of inodes*.

To overcome that issue, you might want to look at https://unix.stackexchange.com/questions/26598/how-can-i-increase-the-number-of-inodes-in-an-ext4-filesystem

## How to get started?
- Firstly, make sure you are using `UNIX/Linux`, such as Ubuntu or ArchLinux. If you are using Windows you will faced a lot of problem.
- Secondly, you will need to install Node.js ([Click here for how to install Node.js](http://lmgtfy.com/?q=how+to+install+nodejs+on+linux) )

*P/S: Sorry for being so mean, that's just a joke.*

## How to run test?
```
cd src
npm run test
```

## How to run the server (during development)?
```
cd src
node app.js
```
## How to deploy to server?
Firstly, install `Node.js` (search Google).
Then:
```
git clone https://github.com/wongjiahau/TCLCPhase2-LabellingApp-Backend.git
cd TCLCPhase2-LabellingApp-Backend/src
npm install
```

## How to run the server (for deployment)?
First, install `forever`. (Read more [at here](https://github.com/foreverjs/forever))

This program (`forever`) is to make sure the server is restarted whenever it crashes.
```
sudo npm i -g forever
```
Then, 
```
cd src
forever -o server.log start app.js
```
The log file will be located at `server.log`.

## How to stop the server?
```
cd src
forever stop app.js
```

## How to get the output file?
```
cd src
node generateOutput.js
```

## How to see current progess?
Go to the following link:
```
http://IP_ADDRESS/reportForEnglish
http://IP_ADDRESS/reportForChinese
```
Example of `IP_ADDRESS` is :
- `localhost:3000`
- `36.23.123.123`


