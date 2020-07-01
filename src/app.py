from flask import Flask, request, jsonify, redirect, session, url_for
import json
import os
from flask_pymongo import PyMongo
from passlib.hash import sha256_crypt

app = Flask(__name__)
app.secret_key = os.environ.get("ALEK_SECRET_KEY")

app.config["MONGO_URI"] = "mongodb://0.0.0.0:27017/enchanted_forest_user_data"
mongo = PyMongo(app)

@app.route("/")
@app.route("/index")
def index():
	return app.send_static_file('index.html')

@app.route("/start")
@app.route("/startScreen")
def startScreen():
	return app.send_static_file('startScreen.html')

@app.route("/createAccount", methods=("POST",))
def createAccount():
	username = request.form.get("username")

	same_username_users = mongo.db.users.find( {"username": request.form.get("username") } ) 
	if any(True for _ in same_username_users):
		return jsonify({"status": "error", "messsage": "username taken"})

	pwd_hash = sha256_crypt.hash(request.form.get("pwd"))
	mongo.db.users.insert_one({"username": username, "pwd_hash": pwd_hash, "data": {}})
	return jsonify({"status": "success", "messsage": "account created"})

@app.route("/login", methods=("POST",))
def login():
	username = request.form.get("username")
	user_data = [x for x in mongo.db.users.find( {"username": username } )]
	if len(user_data) == 0:
		return jsonify({"status": "error", "messsage": "that username does not have an account associated with it. maybe you speeled yourname wrong or something"})
	user_data = user_data[0]

	if not sha256_crypt.verify(request.form.get("pwd"), user_data["pwd_hash"]):
		return jsonify({"status": "error", "messsage": "bad password"})

	return redirect(url_for("index", username = username))

@app.route("/savedata", methods=("GET",))
def savedata():
	username = request.args.get("username")

	user_data = [x for x in mongo.db.users.find( {"username": username } )]
	if len(user_data) == 0:
		return jsonify({"status": "error", "messsage": "that username does not have an account associated with it. maybe you speeled yourname wrong or something"})
	user_data = user_data[0]

	mongo.db.users.update_one( {"username": username }, {"$set": {"username": username, "pwd_hash": sha256_crypt.hash("yo")}})

	# lives
	# checkpoint
	# item

	return "I updated your pwd for you, your welcome"

if __name__ == "__main__":
	app.run(host="0.0.0.0", port="5000", debug=True)


