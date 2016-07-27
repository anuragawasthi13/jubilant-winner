var loginApp = angular.module("loginApp", ['ngRoute']);
var get_all_users_api_url = "/api/user/listing";

loginApp.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[').endSymbol(']]');
});
loginApp.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/chatdetails/:curr_user/:friend_user', {
            templateUrl: '/chatdetails.html',
            controller: 'chatdetails'
        })
}]);
loginApp.controller("aController", ['$scope', function($scope) {
    //alert("i am mr. hola");
    var fileSelectedVar = 0,
        fileDragOverVar = 0;

    function elmentWithThisId(id) {
        return document.getElementById(id);
    }

    function Output(msg) {
        var m = elmentWithThisId("messages");
        m.innerHTML = msg + m.innerHTML;
    }

    if (window.File && window.FileList && window.FileReader) {
        Init();
    }

    function Init() {
        var fileselect = elmentWithThisId("uimg"),
            filedrag = elmentWithThisId("filedrag"),
            submitbutton = elmentWithThisId("submitbutton");

        fileselect.addEventListener("change", FileSelectHandler, false);
        var xhr = new XMLHttpRequest();
        if (xhr.upload) {
            filedrag.addEventListener("dragover", FileDragHover, false);
            filedrag.addEventListener("dragleave", FileDragHover, false);
            filedrag.addEventListener("drop", FileSelectHandler, false);
            filedrag.style.display = "block";

        }
    }

    function FileDragHover(e) {
        fileDragOverVar = 1;
        console.log("oye", e);
        e.stopPropagation();
        e.preventDefault();
        e.target.className = (e.type == "dragover" ? "hover" : "");
    }
    var files;

    function FileSelectHandler(e) {
        fileSelectedVar = 1;
        // cancel event and hover styling
        FileDragHover(e);

        // fetch FileList object
        files = e.target.files || e.dataTransfer.files;

        // process all File objects
        for (var i = 0, f; f = files[i]; i++) {
            ParseFile(f);
            //UploadFile(f);
        }
    }
    $scope.submitButtonFunction = function() {
        if (fileDragOverVar == 1) {
            for (var i = 0, f; f = files[i]; i++) {
                UploadFile(f);
            }
            console.log("submitted the dragged files");
            setTimeout(function() {
                location.href = "http://localhost:3000/";
            }, 5000);
        } else {
            location.href = "http://localhost:3000/";
        }

    }

    function UploadFile(file) {
        console.log(file);
        var xhr = new XMLHttpRequest();
        if (xhr.upload && file.size <= elmentWithThisId("MAX_FILE_SIZE").value) {
            // start upload
            console.log("uploading file with xhr");
            xhr.open("POST", "http://localhost:3000/fileupload", true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            var formData = new FormData();
            formData.append("uimg", file);
            xhr.send(formData);
        }

    }

    function ParseFile(file) {

        Output(
            "<p>File information: <strong>" + file.name +
            "</strong> type: <strong>" + file.type +
            "</strong> size: <strong>" + file.size +
            "</strong> bytes</p>"
        );

    }

    function onLoad() {
        $("#myfiles").show();
        $("#fileupload").hide();
    }

    function showMyfilesDiv() {
        $("#myfiles").show();
        $("#fileupload").hide();
    }

    function uploadFilesDiv() {
        $("#myfiles").hide();
        $("#fileupload").show();
    }

    $scope.myfilesLinkClick = function() {
        console.log("myfilesLinkClick");
        showMyfilesDiv();
    }

    $scope.uploadFilesClick = function() {
        console.log("uploadFilesClick");
        uploadFilesDiv();
    }
    onLoad();
}]);

loginApp.controller("chatController", ['$scope', '$http', function($scope, $http) {
    console.log("-------------chatController-------------");

    var curr_user = $("#username").val();
    console.log("current user is " + curr_user);

    var req = {
        method: 'GET',
        url: get_all_users_api_url
    }
    $http(req).then(function(response) {
        console.log(JSON.stringify(response.data.userListing.data));
        $scope.users = response.data.userListing.data;
    }, function(error) {
        console.log(error);
    });
}]);
loginApp.controller("chatdetails", ['$scope', '$routeParams', function($scope, $routeParams) {
    var socket = io.connect();

    console.log("-------------chatdetails-------------");
    var $messageForm = $("#send-message");
    var $messageBox = $("#message");
    var chat = $("#chat");
    var curr_user = $routeParams.curr_user;

    //join request for sockets
    socket.emit("join", {
        username: curr_user
    });
    var receiver_user = $routeParams.friend_user;
    console.log(curr_user + " will send message to " + receiver_user);
    socket.on('show all messages', function(data) {
        alert("show all messages");
        
            console.log("\n\ngot all messages on client side", data);
            for (var i = 0; i < data.length; i++) {
                chat.append(data[i].body + '<br>');
            }
        
    });
    socket.on('new message', function(data) {
        console.log("got new message");
        chat.append('<br>' + data.message);
    });
    socket.emit('get_all_messages', {
        "curr_user": curr_user,
        "receiver_user": receiver_user
    });

    $messageForm.submit(function(e) {
        e.preventDefault();
        var data = {
            "message": $messageBox.val(),
            "sender": curr_user,
            "receiver": receiver_user
        };
        socket.emit('send message', data);
        chat.append('<br>'+$messageBox.val()+'<br>');
        $messageBox.val('');
        console.log("message sent to server");
    });
}])