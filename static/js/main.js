$(document).ready(function(){
    console.log("ready")
    $("#submit_1").click(function(){
       $(".collector").append("<p>" + $("#test_1").val() + "</p>")
    })
    var socket = io.connect('http://' + document.domain + ':' + location.port);
    socket.on('connect', function() {
        socket.emit('myevent', {data: 'I\'m connected!'});
    });
});