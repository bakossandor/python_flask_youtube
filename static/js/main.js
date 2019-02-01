$(document).ready(function(){
    // the script is ready

    // the ROOM number and the API_KEY is loading from another script

    console.log("playlist is ready")

    // websocket connection
    var socket = io.connect('http://' + document.domain + ':' + location.port);
    socket.on('connect', function() {
        socket.emit('myevent', {data: 'I\'m connected!'});
    });

    // searching for item
    $("#submit_1").click(function(){
       req_from_youtube($("#test_1").val())
    })

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
            console.log(video_id)
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

//    make a small table with add options to the playlist - hide option after successfull callback
//    connect to the db - websocket - mongodb
//    add the iframe
//    add the functiolaties

});