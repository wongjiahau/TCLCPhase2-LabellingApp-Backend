#!/bin/bash
mongo <<EOF
use tclc;
db.english.find({semantic_value: "pending"}).count();
db.chinese.find({semantic_value: "pending"}).count();
db.english.updateMany({semantic_value: 'pending'}, {\$set: {semantic_value: 'unassigned'}})
db.chinese.updateMany({semantic_value: 'pending'}, {\$set: {semantic_value: 'unassigned'}})
EOF