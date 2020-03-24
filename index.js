/* 主要用于起服务，依赖注入，在这里统一配置往里注优点是修改方便，缺点是参数太多 */
var server = require("./server");
var router = require("./router");
var requestHandler = require("./requestHandler");

var handle = {}
handle["/test/helloworld"] = requestHandler.sayhello;
handle["/user/register"] = requestHandler.register;
handle["/user/login"] = requestHandler.login;
handle["/user/checkin"] = requestHandler.checkin;
handle["/job/history"] = requestHandler.history;
handle["/user/register/check"] = requestHandler.hasregised;
handle["/job/add"] = requestHandler.addmission;

server.start(router.route, handle);
