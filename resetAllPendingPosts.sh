#!/bin/bash
mongo <<EOF
use tclc;
db.english.find({semantic_value: "pending"}).count();
db.chinese.find({semantic_value: "pending"}).count();
db.english.update({semantic_value: 'pending'}, {\$set: {semantic_value: 'unassigned'}}, {multi: true});
db.chinese.update({semantic_value: 'pending'}, {\$set: {semantic_value: 'unassigned'}}, {multi: true});
EOF