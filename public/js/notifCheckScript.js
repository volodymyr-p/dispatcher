$(document).ready(function () {
    var socket = io.connect();

    socket.on('notify everyone', function (msg) {
        //console.log(msg);
        if (msg.id_organization === window.storage.id_organization) {
            notifyMe(msg.user, msg.comment);
        }
    });

});

function notifyMe(user, message) {
    //Check if the browser supports notifications
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    }
    // Check if the user is okay to get some notification
    else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var options = {
            body: message,
            dir: "ltr"
        };
        var notification = new Notification(user + " Added a new statement", options);
    }
    // Otherwise, we need to ask the user for permission   
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {

            if (!('permission' in Notification)) {
                Notification.permission = permission;
            }
            // If the user is okay
            if (permission === "granted") {
                var options = {
                    body: message,
                    dir: "ltr"
                };
                var notification = new Notification(user + " Added a new statement", options);
            }
        });
    }
    // User already denied any notification
}
