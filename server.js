var http = require("http");
var url = require("url");
var db = require("./database");

function start(route, handle) {
    function onRequest(request, response) {
        var parse = url.parse;
        request.setEncoding = 'utf8';
        try {
            // 不管遇到什么bug，都不要怕，微笑着catch住它！
            route(handle, parse, request, response);
        } catch (e) {
            // 这里很少生效，可能是错误抛不到这里来
            console.log(e);
            response.writeHead(500);
            response.end('Exception Happened');
        }
    }
    db.inituser();
    db.initmission();
    http.createServer(onRequest).listen(8888);
    console.log("Server has started.");
}

// 导出这个方法
exports.start = start;