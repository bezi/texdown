var app = {};
app.save = function () {

};

app.compile = function() {
    var data = $('#source').val();
    $.post(
        "/compile",
        { text: data},
        function (response) {
            console.log(response.text);
        },
        "json"
    ); 
};
