$(document).ready(function(){
    // the script is ready

    // the ROOM number and the API_KEY is loading from another scripts

    console.log("playlist is ready")

    // websocket connection
    var socket = io.connect('http://' + document.domain + ':' + location.port);
    socket.on('connect', function() {
        socket.emit('init_connect', {room: ROOM});
    });

    // listening to soundtracks
    socket.on("soundtrack", function(data) {
        extract_soundtrack(data)
    })

    // listening for deleted vid
    socket.on("deleted_vid", function(vid_id) {
        $(`.soundtrack_items[data-vid='${vid_id}']`).remove()
    })

    // searching for item
    $("#submit_1").click(function(){
       req_from_youtube($("#test_1").val())
    })

    // extracting soundtrack
    function extract_soundtrack(data) {
        function move_up() {
            const vid_id = $(this).parent().data("vid")
            socket.emit("change_pos", {room: ROOM, vid_id: vid_id, move: "-"})
        }
        function move_down() {
            const vid_id = $(this).parent().data("vid")
            socket.emit("change_pos", {room: ROOM, vid_id: vid_id, move: "+"})
        }
        function del_vid() {
            const vid_id = $(this).parent().data("vid")
            socket.emit("delete_vid", {room: ROOM, vid_id: vid_id})
        }
        tr = JSON.parse(data)
        tr.forEach(function(vid) {
            const vid_id = vid.vid_id
            const tnail = vid.tnail
            const title = vid.title
            $(".soundtrack_body").append(
                `<div
                    class="soundtrack_items"
                    data-vid=${vid_id}
                    >
                        <div
                            class="soundtrack_body_items_thumbnails"
                            data style="background-image: url(${tnail})"
                        ></div>
                        <div class="soundtrack_body_items_title">
                            <span class="soundtrack_items_text">${title}</span>
                        </div>
                        <div class="soundtrack_body_items_up">
                            <input type="button" value="up">
                        </div>
                        <div class="soundtrack_body_items_down">
                            <input type="button" value="down">
                        </div>
                        <div class="soundtrack_body_items_del">
                            <input type="button" value="delete">
                        </div>
                    </div>
                </div>`
            )
        })
        $(".soundtrack_body_items_up").click(move_up)
        $(".soundtrack_body_items_down").click(move_down)
        $(".soundtrack_body_items_del").click(del_vid)
    }



    // ajax request to youtube api
    function req_from_youtube(wish) {
        $.ajax({
        method: "GET",
        url:"https://www.googleapis.com/youtube/v3/search",
        data:
            {
                'maxResults': '5',
                'part': 'snippet',
                'q': wish,
                'type': '',
                "key": API_KEY
            },
        dataType: "jsonp"
        }).done(function(data) {
            extract_data(data)
        })
    }

    // extracting data and appending the image
    function extract_data(data) {
        console.log(data)
        $(".play_list_body").empty()
        function add_to_playlist() {
            // extract the data to send to the server
            parent = $(this).parent()
            const id = parent.data("vid")
            const tnail = parent.data("thumbnail")
            const title = parent.data("title").replace(/_/g, " ") // because storing concatenated strings we need to change the _ to " "

            // sending the info back with websocket
            socket.emit("add_to_track", {ROOM, id, tnail, title})
        }
        data.items.forEach(function (objs) {
            const title = objs.snippet.title
            const thumbnail = objs.snippet.thumbnails.default.url
            const video_id = objs.id.videoId
            $(".play_list_body").append(
                `<div
                    class="play_list_body_items"
                    data-vid=${video_id}
                    data-title=${title.replace(/\s/g, "_")} // cannot store longer than 1 word strings correctly in the data attr
                    data-thumbnail=${thumbnail}
                    >
                        <div
                            class="play_list_body_items_thumbnails"
                            data style="background-image: url(${thumbnail})"
                        ></div>
                        <div class="play_list_body_items_title">
                            <span class="play_list_body_items_text">${title}</span>
                        </div>
                        <div class="play_list_body_items_add_button">
                            <input type="button" value="add">
                        </div>
                    </div>
                </div>`
            )
        })
        $(".play_list_body_items_add_button").click(add_to_playlist)
    }

//    soundrack items option
//    hide soundtrack after deleted
//    add the iframe
//    add the functiolaties

});
