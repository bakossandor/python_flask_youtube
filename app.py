from flask import Flask, request, render_template, redirect, url_for
from flask_pymongo import PyMongo


app = Flask(__name__)

app.config['MONGO_URI'] = "mongodb://localhost:27017/playlist_app"
mongo = PyMongo(app)


@app.route('/<code>', methods=('GET', 'POST'))
def playlist(code):
    if request.method == 'POST':
        try:
            insert = mongo.db.playlist.insert_one({"code": code})
            return render_template('playlist.html', code=code)
        except:
            return "{message: 'cannot create the playlist'}"

    elif request.method == 'GET':
        check_if_page_exists = mongo.db.playlist.find_one({"code": code})
        if check_if_page_exists:
            return render_template('playlist.html', code=code)
        else:
            return redirect(url_for("create"))


@app.route('/', methods=('GET', 'POST'))
def create():
    if request.method == 'POST':
        pass
    return render_template('index.html')