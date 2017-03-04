#!/usr/bin/env sh

tenant="dev.xkit.co-2c7b663a12d39a6bbd4f062854705f57"
curl -XDELETE localhost:8006/authorization/tenant/$tenant/notification
#curl -XDELETE localhost:9200/$tenant-b2b-kc-resources

curl -XPUT   https://dev.xkit.co/knowledgecenter/tenants/dev.xkit.co -H"Content-Type:application/json" -d
'
    {"_id": $tenant}
'

print_message "Onboarding tenant $tenant"
curl -XPOST http://localhost:8006/authorization/tenant/$tenant/notification -H"Content-Type:application/json" -d ''

curl -XPOST http://localhost:8005/userpi/tenant/$tenant/notification  -d '
{
    "firstAdminUserId": "rajasoun@icloud.com"
}' -H content-type:application/json

curl -XPOST http://localhost:8010/tenantmanagement/superAdmin/configurations/featureFlag/register -d '
{
  "id": "46e30b2a7119b95e1e3b18c5a5a202e6",
  "name": "Multi org support",
  "displayName": "Multi org support",
  "value": "true",
  "scope": "/",
  "allowOverride": false,
  "configType": "FEATURE_FLAG"
}' -H content-type:application/json


curl -XPOST http://localhost:8010/tenantmanagement/superAdmin/configurations/featureFlag/register -d '
{
  "id": "46e30b2a7119b95e1e3b18c5a5a202e6",
  "name": "peopleEntitlementFeature",
  "displayName": "People Entitlement Feature",
  "value": "true",
  "scope": "/",
  "allowOverride": false,
  "configType": "FEATURE_FLAG"
}' -H content-type:application/json

curl -vX POST -H "Authorization: Basic YWRtaW46Q2lzY29AIWFkbWlu" -H "Content-Type: application/json" -H "Cache-Control: no-cache" -H "Postman-Token: cc760db3-651b-409f-7854-448fc78afeea" -d '{
  "_id": "",
  "brightcoveInfo": {
    "accountId": "3986618098001",
    "clientId": "0f62f831-0cc5-40b8-8abb-bf8032f6ddd9",
    "clientSecret": "hnbX60JIoRvZaytFBi4urOsgs7BGZa5M9QUq6UW1TfMqxTHGGb3ayGGcLb0vcggmFMqJUArBQm8zhyi_W_1l_g",
    "playerId": "4724392749001",
    "playerKey": "AQ~~,AAAETiMIF0k~,ltlD-CzwXorl7awa7_t0WBHReIKqohn0",
    "_id": null
  },
  "cciInfo": {
    "organizationId": "f687739d-19a0-407e-8c37-0bca8a3a11eb",
    "redirectUri": "https://dev.xkit.co",
    "_id": null
  },
  "firstAdminUserId": "admin@dev.xkit.co",
  "fqdn": "dev.xkit.co",
  "identityProviderInfo": {
    "providerDetails": {
      "organizationId": "f687739d-19a0-407e-8c37-0bca8a3a11eb",
      "serviceUserId": "cisco-knowledge.svcAccount",
      "servicePassword": "56juWFWWIgnSf..Ggkjeiu8.2lo0976uDFF44Ma452016",
      "cciIdentityBaseUrl": "http://fcci:5000/identity",
      "cciBrokerBaseUrl": "http://fcci:5000/idb"
    },
    "providerName": "cci",
    "_id": null
  },
  "isOpenAccessType": false,
  "multiOrgSupport":false,
  "jabberInfo": {
    "conference": "conference.ibt1.webex.com",
    "domain": "qa.xkit.co",
    "httpBindingURL": "https://imbts.ciscowebex.com/http-bind",
    "temporarySubscriptionEnabled": true,
    "unsecureAllowed": true,
    "_id": null
  },
  "locale": "en_US",
  "tenantName": "dev.xkit.co",
  "termsAndConditions": null,
  "webexInfo": {
    "maxUserCount": 20,
    "meetingAgenda": "Discussion",
    "meetingName": "CLKS Meeting",
    "ssoEnable": false,
    "webexBaseUrl": "https://clks.webex.com/clks/p.php?",
    "webexMeetingDuration": 20,
    "webexPartnerId": null,
    "webexSiteId": null,
    "webexSiteName": "clks",
    "webexXMLServiceUrl": "https://clks.webex.com/WBXService/XMLService",
    "_id": null
  }
}
' http://localhost:8002/knowledgecenter/tenants/dev.xkit.co
