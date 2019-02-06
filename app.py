from flask import Flask, request, render_template, redirect, url_for
from flask_pymongo import PyMongo
from flask_socketio import SocketIO
import json
app = Flask(__name__)

app.config['MONGO_URI'] = "mongodb://localhost:27017/playlist_app"
app.config['SECRET_KEY'] = 'secret!'
app.config['TEMPLATES_AUTO_RELOAD'] = True
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


# init websocket connection
@socketio.on('init_connect')
def init_connection(data):
    # retrieving the soundtrack of the room from db
    res = mongo.db.playlist.find_one(
        {"code": data["room"]}
    )

    # emitting back to the client the room soundtrack
    socketio.emit("soundtrack", json.dumps(res["list"]))

# add video to the room track
@socketio.on('add_to_track')
def add_to_track(data):
    room = data["ROOM"]
    vid_id = data["id"]
    tnail = data["tnail"]
    title = data["title"]

    # inserting elements to the database
    mongo.db.playlist.update(
        {"code": room},
        {"$push":
             {"list":
                  {"vid_id": vid_id, "tnail": tnail, "title": title, "score": 0}
              }
         }
    )
    socketio.emit("add_to_soundtrack", json.dumps({"vid_id": vid_id, "tnail": tnail, "title": title, "score": 0}), broadcast=True)

# change video current positon
@socketio.on('change_pos')
def change_pos(data):
    pass


# delete video from playlist and db
@socketio.on('delete_vid')
def delete_vid(data):
    room = data["room"]
    vid_id = data["vid_id"]
    mongo.db.playlist.update(
        {"code": room},
        {"$pull":
             {"list":
                  {"vid_id": vid_id}
              }
         }
    )
    socketio.emit("deleted_vid", vid_id, broadcast=True)

