BRANCH=master
if [ $# != 0 ]; then
    BRANCH="$1"
fi

git checkout "${BRANCH}" && git pull && npm run build && rsync build/** dist -r