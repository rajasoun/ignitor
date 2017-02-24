#!/usr/bin/env sh

swift -A http://ckswift:8080/auth/v1.0 -U test:tester -K testing stat
echo "Test Upload"  >> swift.txt
swift -A http://ckswift:8080/auth/v1.0 -U test:tester -K testing upload swift swift.txt

