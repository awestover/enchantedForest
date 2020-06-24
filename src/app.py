
from flask import Flask, render_template, request, jsonify, redirect, url_for, session, make_response
import json
import os
from flask_pymongo import PyMongo

app = Flask(__name__)
app.secret_key = os.environ.get("ALEK_SECRET_KEY")
app.config["MONGO_URI"] = "mongodb://0.0.0.0:27017/usersdb"
mongo = PyMongo(app)

@app.route("/")
def index():
	return render_template("index.html")

@app.route("/hello")
def hello():
	return "hello"


if __name__ == "__main__":
	app.run(host="0.0.0.0", port="5000", debug=True)

