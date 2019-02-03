$(document).ready(function(){
    // the script is ready

    // the ROOM number and the API_KEY is loading from another scripts

    console.log("playlist is ready")

    // loading the iframe async
    // This code loads the IFrame Player API code asynchronously.

    function creating_iframe() {
        var tag = document.createElement('script');

        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

          // This function creates an <iframe> (and YouTube player)
          // after the API code downloads.
        var player;
        window.onYouTubeIframeAPIReady = function() {
            player = new YT.Player('player', {
                height: '390',
                width: '640',
                videoId: get_first_vid_id(),
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        }

        // The API will call this function when the video player is ready.
        function onPlayerReady(event) {
            event.target.playVideo();
        }

        // The API calls this function when the player's state changes.
        // The function indicates that when playing a video (state=1),
        // the player should play for six seconds and then stop.
        var done = false;
        function onPlayerStateChange(event) {
            if (event.data == YT.PlayerState.ENDED) {
                nextsong = next_song()
                event.target.loadVideoById(nextsong)
                delete_song()
            }
        }

        function stopVideo() {
            player.stopVideo();
        }
    }

    // own custom functions to ytube api
    // get vid id
    function get_first_vid_id() {
        vid_id = $(".soundtrack_items").first().data("vid")
        return vid_id
    }

    function next_song() {
        const nextsong = $(".soundtrack_items").eq(1).data("vid")
        return nextsong
    }

    function delete_song() {
        $(".soundtrack_items").first().remove()
    }
    // websocket connection
    var socket = io.connect('http://' + document.domain + ':' + location.port);

    socket.on('connect', function() {
        socket.emit('init_connect', {room: ROOM});
    });

    // listening to soundtracks
    socket.on("soundtrack", function(data) {
        extract_soundtrack(data)
        creating_iframe()
    })

    // listening on new video on track
    socket.on("add_to_soundtrack", function(data) {
//        add_to_track(data)
        v_data = JSON.parse(data)
        const vid_id = v_data.vid_id
        const tnail = v_data.tnail
        const title = v_data.title
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

//    shit iframe - options
//    add "state" change between vids and search list
//    add the functiolaties

});
