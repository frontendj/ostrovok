#!/bin/bash

echo "Updating Ostrovok on gh-pages…"

grunt build

git add build/*
git add index.html
git commit -m "One more build"
git push
