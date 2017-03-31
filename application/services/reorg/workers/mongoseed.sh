#!/usr/bin/env sh

#FIX: http://stackoverflow.com/questions/29415311/mongodb-connection-auth-works-on-shell-but-not-with-external-tools

docker exec -it ckmongo  sh  -c 'mongo admin 2>/dev/null <<EOF
use admin
db.system.users.remove({})
db.system.version.remove({})
db.system.version.insert({ "_id" : "authSchema", "currentVersion" : 3 })
'

docker exec -it ckmongo  sh -c 'mongo b2b <<EOF
db.b2b.contentstore.document.remove({});
db.b2b.gatekeeper.tenants.remove({});
db.b2b.pipeline.resources.remove({});
db.b2b.tenantmanagement.assets.remove({});
db.b2b.tenantmanagement.configurations.remove({});
db.b2b.tenantmanagement.configurations.allowedValues.remove({});
db.b2b.tenantmanagement.modules.remove({});
db.b2b.tenantmanagement.user.configurations.remove({});
db.b2b.tenantmanagement.usergroup.remove({});
db.b2b.userpi.approveduserexpertise.remove({});
db.b2b.userpi.auth.ccluserprofile.remove({});
db.b2b.userpi.auth.registrations.remove({});
db.b2b.userpi.expertise.remove({});
db.b2b.userpi.pendinguserexpertise.remove({});
db.b2b.userpi.recommendation.remove({});
db.b2b.userpi.rssfeed.remove({});
'

docker exec -it ckmongo  sh  -c 'mongo 2>/dev/null <<EOF
use b2b
db.createUser(
  {
    user: "ckuser",
    pwd: "cisco123",
    roles: [
       { role: "readWrite", db: "b2b" },
       { role: "readWrite", db: "admin" }
    ]
  }
);
use admin
db.createUser(
  {
    user: "ckuser",
    pwd: "cisco123",
    roles: [
       { role: "readWrite", db: "b2b" },
       { role: "readWrite", db: "admin" }
    ]
  }
)
use statemachine
db.createUser(
  {
    user: "ckuser",
    pwd: "cisco123",
    roles: [
       { role: "readWrite", db: "b2b" },
       { role: "readWrite", db: "admin" }
    ]
  }
)
'


