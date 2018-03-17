# Install fish, so that the shell will be easy to use
sudo apt-get update
sudo apt-get install fish
curl -L https://get.oh-my.fish | fish

# Install and start mongo
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5
echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu precise/mongodb-org/3.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo service mongod start

#Import json files
cd ~ 
curl https://raw.githubusercontent.com/fesvictor/TCLCPhase2/master/analysis/transform_format_for_mongodb/english.json > english.json
curl https://raw.githubusercontent.com/fesvictor/TCLCPhase2/master/analysis/transform_format_for_mongodb/chinese.json > chinese.json
mongoimport --db tclc --collection english --drop --file ~/english.json --jsonArray
mongoimport --db tclc --collection chinese --drop --file ~/chinese.json --jsonArray


# Install node.js
sudo apt-get install nodejs
sudo apt-get install npm
sudo ln -s /usr/bin/nodejs /usr/bin/node # create symlinks for so that node is recognize

# Clone the backend files
cd ~
git clone https://github.com/wongjiahau/TCLCPhase2-LabellingApp-Backend.git
cd TCLCPhase2-LabellingApp-Backend
cd src 
npm install
sudo npm install -g forever
forever start app.js &

# Redirect port 3000 to port 80, because nodejs is running on port 3000
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000

# Login to mongo
mongo --host 127.0.0.1:27017

# REMEMBER to test the site using http instead of https!
