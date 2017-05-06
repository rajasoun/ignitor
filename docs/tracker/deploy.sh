#!/bin/bash

echo -e "\033[0;32mDeploying updates to GitHub...\033[0m"
rm -fr public
# Build the index.
npm install
npm run index

git clone add https://github.com/rajasoun/tracker.doc public
# Build the project.
hugo

cd public
# Add changes to git.
git add -A

# Commit changes.
msg="rebuilding site `date`"
if [ $# -eq 1 ]
  then msg="$1"
fi
git commit -m "$msg"

# Push source and build repos.
git push origin master
cd -
