/* 主要用于起服务，依赖注入，在这里统一配置往里注优点是修改方便，缺点是参数太多 */
var server = require("./server");
var router = require("./router");
var requestHandler = require("./requestHandler");

// global.workpath = 'C:\\workspace\\vscode\\cusnodejs';

var handle = {}
handle["/helloworld"] = requestHandler.sayhello;
handle["/register"] = requestHandler.register;
handle["/login"] = requestHandler.login;
handle["/checkin"] = requestHandler.checkin;
handle["/history"] = requestHandler.history;
handle["/register/check"] = requestHandler.hasregised;
handle["/job/add"] = requestHandler.addmission;

server.start(router.route, handle);