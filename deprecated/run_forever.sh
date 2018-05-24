#!/bin/bash
cd src
kill -9 $(pidof nodejs app.js)
forever start app.js