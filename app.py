from flask import Flask, request, render_template, redirect, url_for
from flask_pymongo import PyMongo
from flask_socketio import SocketIO

app = Flask(__name__)

app.config['MONGO_URI'] = "mongodb://localhost:27017/playlist_app"
app.config['SECRET_KEY'] = 'secret!'
mongo = PyMongo(app)
socketio = SocketIO(app)


@app.route('/<code>', methods=('GET', 'POST'))
def playlist(code):
    if request.method == 'POST':
        try:
            insert = mongo.db.playlist.insert_one({"code": code, "list": []})
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


@socketio.on('myevent')
def init_connection(json):
    print('received json: ' + str(json))


@socketio.on('add_to_track')
def add_to_track(data):
    # print(data["ROOM"])
    room = data["ROOM"]
    vid_id = data["id"]
    tnail = data["tnail"]
    title = data["title"]
    mongo.db.playlist.update({"code": room}, {"$push": {"list": {"vid_id": vid_id, "tnail": tnail, "title": title}}})


