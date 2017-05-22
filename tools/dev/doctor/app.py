from flask import Flask, request, jsonify
import json
import pyorient

app = Flask(__name__)
app.debug = True
client = pyorient.OrientDB("localhost", 2424)
client.connect("admin", "admin")
db_name = 'authorization'
db_type = 'plocal'
client.set_db(db_name)



@app.route('/*')
def hello():
    return "{}"


@app.route('/<path:path>', methods=['POST', 'GET'])
def catch_all(path):
    print "UNHANDLED api #######################################################"
    print path
    print request.get_data()
    return request.get_data()

@app.route('/odb/users/missing',methods=['GET'] )
def getMissingUsersFromODB():
    odbSQL='select * from  User where id is null and type = "user" and appId = "userpi"'
    # db operations need to be called within 'with client.connection()'
    with client.connection():
        result = client.query(odbSQL)
    #ToDO: Move the Below Code At Application End
    client.shutdown('admin', 'admin')
    #ToDO: JSONify the Result
    return result[0]

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
