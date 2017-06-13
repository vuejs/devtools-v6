export VUE_DEVTOOL_TEST=true
DEV_SERVER_BIN=`pwd`/node_modules/.bin/webpack-dev-server
cd shells/dev
$DEV_SERVER_BIN --inline --no-info --port 8081 &
DEV_SERVER_PID=$!
sleep 1
cd -
./node_modules/.bin/nightwatch -c test/nightwatch.json
TEST_RESULT=$?
kill $DEV_SERVER_PID
exit $TEST_RESULT
