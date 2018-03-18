#!/bin/bash
mongo <<EOF
use tclc;
db.english.updateMany({semantic_value: 'pending'}, {\$set: {semantic_value: 'unassigned'}})
db.chinese.updateMany({semantic_value: 'pending'}, {\$set: {semantic_value: 'unassigned'}})
EOF