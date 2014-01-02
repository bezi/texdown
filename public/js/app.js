var app = {};
app.save = function () {

};

app.compile = function() {
    var data = $('#source').html();
    $.post(
        "/compile",
        data,
        function (response) {
            console.log(response);
        },
        "json"
    ); 
};
