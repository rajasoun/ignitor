from flask import Flask, request, jsonify
import json

app = Flask(__name__)


@app.route('/*')
def hello():
    return "{}"


@app.route('/idb/identity/authenticate', methods=['POST'])
def auth():
    print "auth check ---------------------------------------"
    return "token.id=AQIC5wM2LY4SfczoFljnLpw5lvmk5BC2niXhbquEPD6uc8U.*AAJTSQACMDYAAlNLABQtMjc4NDMyNTMyNzc3NzE0MTU1NwACUzEAAjA5*"


@app.route('/identity/config/v2/actions/EmailCheck/invoke', methods=['POST'])
def emailCheck():
    body = json.loads(request.get_data())
    print "Email check --------------------------------------- %s" % repr(body)
    return jsonify({"entitlements": [], "isExisted": True, "domainClaimed": False, "hasPassword": True,
                    "url": "https:\/\/identitybts.webex.com\/identity\/config\/v2\/actions\/EmailCheck\/invoke",
                    "organizationid": "f687739d-19a0-407e-8c37-0bca8a3a11eb",
                    "emails": {"primary": True, "type": "work", "value": body["email"]}, "firstName": "Admin", "meta": {
            "location": "https:\/\/identitybts.webex.com\/identity\/config\/v2\/actions\/EmailCheck\/invoke",
            "created": "2016-11-29T08:44:53.003Z", "lastModified": "2016-11-29T08:44:53.003Z",
            "version": "12532277154"},
                    "schemas": ["urn:scim:schemas:core:1.0", "urn:scim:schemas:extension:cisco:commonidentity:1.0"],
                    "isOrgSSO": False, "id": "a113bb31-e5ed-41c6-8187-612bbdb51851", "isTransient": False})


# http://localhost:5000/identity/scim/f687739d-19a0-407e-8c37-0bca8a3a11eb/v1/Users/username@dummy.com
@app.route('/identity/scim/<path:path>')
def get_profile(path):
    print "Get profile -------------------------------------- %s" % path
    email = path.split("/")[-1]
    return jsonify({"schemas": ["urn:scim:schemas:core:1.0", "urn:scim:schemas:extension:cisco:commonidentity:1.0"],
                    "userName": email, "emails": [{"primary": True, "type": "work", "value": email}],
                    "name": {"givenName": email.split("@")[0]}, "id": "a113bb31-e5ed-41c6-8187-612bbdb51851",
                    "meta": {"created": "2016-11-29T08:44:53.003Z", "lastModified": "2016-11-29T08:44:53.003Z",
                             "version": "12536274855", "lastServiceAccessTime": [
                            {"type": "cisco-knowledge", "value": "2016-12-28T11:44:47.004Z"}],
                             "attributes": ["extLinkedAccts"],
                             "location": "https://identitybts.webex.com/identity/scim/f687739d-19a0-407e-8c37-0bca8a3a11eb/v1/Users/a113bb31-e5ed-41c6-8187-612bbdb51851",
                             "organizationID": "f687739d-19a0-407e-8c37-0bca8a3a11eb"}, "active": True,
                    "avatarSyncEnabled": False})


@app.route('/organization/scim/v1/Orgs/<path:org>')
def getSSOEnabled(org):
    print "Get ssoEnabled -------------------------------------- %s" % org
    return jsonify({"ssoEnabled": False})


# /idb/idbconfig/f687739d-19a0-407e-8c37-0bca8a3a11eb/v1/PwdResetInfo/a113bb31-e5ed-41c6-8187-612bbdb51851
@app.route('/idb/idbconfig/<path:path>')
def getPasswordResetInfo(path):
    print "get password reset link %s" % path
    return jsonify({"url": "http://google.com/"})


@app.route('/<path:path>', methods=['POST', 'GET'])
def catch_all(path):
    print "UNHANDLED api #######################################################"
    print path
    print request.get_data()
    return request.get_data()


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
