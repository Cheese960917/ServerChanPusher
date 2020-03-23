var fs = require("fs");
var path = require("path");

global.rootpath = path.resolve();

global.es_url = 'http://127.0.0.1:9200';
global.es_index_job = '/job';
global.es_index_user = '/user';
global.es_type_default = '/_doc';
global.es_method_search = '/_search';
global.es_method_all = '/_all';

function route(handle, parse, request, response) {
    var parseobj = parse(request.url);
    var pathname = parseobj.pathname;
    var queryparams = parseobj.query; // 参数，string类型，没做任何处理
    if (typeof handle[pathname] === 'function') {
        handle[pathname](response, request, parseobj, queryparams); // request参数不一定需要
    } else {
        readStatic(response, pathname);
    }
}

function readStatic(response, pathname) {
    var filepath = path.join(rootpath, pathname);
    checkValid(response, pathname);
    fs.stat(filepath, function (err, stats) {
        if (err) {
            // 发送404响应
            response.writeHead(404);
            response.end("404 Not Found.");
        } else {
            // 发送200响应
            response.writeHead(200);
            // response是一个writeStream对象，fs读取html后，可以用pipe方法直接写入
            fs.createReadStream(filepath).pipe(response);
        }
    });
}

function checkValid(response, pathname) {
    if (!pathname === '/favicon.ico' && !pathname.startsWith('/static')) {
        // 除接口外，只允许访问static文件夹下的内容
        response.writeHead(404);
        response.end("404 Not Found.");
    }
}

exports.route = route;