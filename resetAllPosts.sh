#!/bin/bash
mongo <<EOF
use tclc;
db.english.updateMany({}, {\$set: {semantic_value: 'unassigned'}})
db.chinese.updateMany({}, {\$set: {semantic_value: 'unassigned'}})
EOF