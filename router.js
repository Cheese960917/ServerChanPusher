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
        response.writeHead(404);
        response.end("404 Not Found.");
    }
}

exports.route = route;