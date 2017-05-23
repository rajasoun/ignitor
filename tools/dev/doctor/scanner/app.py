from flask import Flask, request, jsonify
import json
import pyorient

app = Flask(__name__)
app.debug = True
client = pyorient.OrientDB("localhost", 2424)
#client.connect("root", "admin")
#db_name = 'authorization'
#db_type = 'plocal'
#client.set_db(db_name)


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
