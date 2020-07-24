$(document).ready(function () {
    var socket = io.connect();

    $("#AddButton").click(function (event) {
        var userName = $("#username").text();
        socket.emit('checking conection', { user: userName, id_organization: window.storage.id_organization});
    });
});