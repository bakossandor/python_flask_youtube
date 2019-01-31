$(document).ready(function(){
    // the script is ready
    console.log("playlist is ready")

    // searching for item
    $("#submit_1").click(function(){
       $(".collector").append("<p>" + $("#test_1").val() + "</p>")
    })

    // websocket connection
    var socket = io.connect('http://' + document.domain + ':' + location.port);
    socket.on('connect', function() {
        socket.emit('myevent', {data: 'I\'m connected!'});
    });

    // ajax request to youtube api
    $.ajax({
        method: "GET",
        url:"https://www.googleapis.com/youtube/v3/search",
        data:
            {
                'maxResults': '5',
                'part': 'snippet',
                'q': 'surfing',
                'type': '',
                "key": API_KEY
            },
            dataType: "jsonp"
    })
});