/* 这个类存储把所有接口替换成方法，提供出去，配置在index
    response 传到这里处理，非阻塞方法中直接放在回调中处理 */

var formidable = require('formidable');
var rq = require('request');
var errmanager = require('./errManager');
var jh = require('./jobHandler');
var uuid = require('UUID');

var es_url = global.es_url;
var es_index_job = global.es_index_job;
var es_index_user = global.es_index_user;
var es_type_default = global.es_type_default;
var es_method_search = global.es_method_search;
var es_method_all = global.es_method_all;

// hello world测试程序
function sayhello() {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("Hello World");
}

// 注册，TODO：这里没处理重复注册的问题，后续会再加个接口，判断是否注册过，但这个逻辑后端不管
function register(response, request) {
    var form = new formidable.IncomingForm();
    form.parse(request, function (err, fields, files) {
        if (err) {
            errmanager.formerr(response, err);
        } else if (!fields.user_name || !fields.user_pw) {
            errmanager.usererr(response);
        } else {
            var user = {
                user_id: new Date().getTime(), // TODO: 之前把id的逻辑去掉了，现在这里还留着感觉有点迷惑，不过也没什么影响，先这样吧。
                user_name: fields.user_name,
                user_pw: fields.user_pw
            };
            var tempResponse = response;
            rq.post({
                url: es_url + es_index_user + es_type_default,
                method: 'POST',
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: user
            }, function (error, response, body) {
                if (!error && response.statusCode == 200 || response.statusCode == 201) {
                    tempResponse.writeHead(200, { "Content-Type": "application/json" });
                    tempResponse.end(JSON.stringify(user));
                } else {
                    if (!error) {
                        // es层面的错误
                        errmanager.eserr(tempResponse, response.body);
                    } else {
                        // http层面的错误
                        errmanager.resterr(tempResponse, error);
                    }
                }
            });
        }
    });
}

// 登录，不判断id了，麻烦
function login(response, request) {
    var form = new formidable.IncomingForm();
    form.parse(request, function (err, fields, files) {
        if (err) {
            errmanager.formerr(response, err);
        } else if (!fields.user_name || !fields.user_pw) {
            errmanager.usererr(response);
        } else {
            var esbody = {
                query: {
                    bool: {
                        must: [
                            {
                                query_string: {
                                    query: fields.user_id ? "user_id:" + fields.user_id : "user_name:" + fields.user_name
                                }
                            }
                        ]
                    }
                }
            };
            let tempResponse = response;
            rq.post({
                url: es_url + es_index_user + es_method_search,
                method: 'POST',
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: esbody
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    if (!response.body.hits.hits[0]) {
                        errmanager.usererr(tempResponse);
                        return;
                    }
                    var src = response.body.hits.hits[0]['_source'];
                    if (src.user_name === fields.user_name && src.user_pw === fields.user_pw) {
                        if (!global.user_dict) {
                            // 没有就建一个
                            global.user_dict = {};
                        }
                        // TODO(已处理): 这里一个账号其实能登陆不止一个人，但目前懒得弄
                        // 要处理这件事，也简单，字典替换成 username:uuid 就行了
                        // 判断登录状态对比uuid来判断，重复登录就把uuid换掉。
                        var uid = uuid.v1(); // 生成一个token返回给前端
                        var expiretime = 1000 * 60 * 60 * 24; // 登录token有效24小时
                        global.user_dict[fields.user_name] = uid; // 登陆了，记到全局变量里面
                        setTimeout(function () {
                            delete global.user_dict[uid];
                        }, expiretime);
                        tempResponse.writeHead(200, { "Content-Type": "application/json" });
                        var json = {
                            user_uid: uid,
                            result: 'Success',
                            expire_time: expiretime
                        }
                        tempResponse.end(JSON.stringify(json));
                    } else {
                        errmanager.usererr(tempResponse);
                    }
                } else {
                    if (!error) {
                        // es层面的错误
                        errmanager.eserr(tempResponse, response.body);
                    } else {
                        // http层面的错误
                        errmanager.resterr(tempResponse, error);
                    }
                }
            });
        }
    });
}

// 检查登录状态
function checkin(response, request) {
    var form = new formidable.IncomingForm();
    form.parse(request, function (err, fields, files) {
        if (err) {
            errmanager.formerr(response, err);
        } else if (!fields.user_name) {
            errmanager.usererr(response);
        } else {
            if (islogin(fields)) {
                errmanager.success(response);
            } else {
                errmanager.loginerr(response);
            }
        }
    });
}

// 添加一个job(mission) 
function addmission(response, request) {
    /**
     * index: job-日期，每天都创建一个新的index
     * 数据库设计：
     * user_name: 用户名
     * job_text: 任务标题
     * job_desp: 任务内容
     * job_schedule: 任务定时
     * job_cron: 任务的cron语句
     * job_delay: 任务时延
     * job_pubdate: 发布日期
     * job_pubtime: 时间戳
     * job_timeout: 有效期，永久有效为-1
     * user_key: 目标的key
     */
    var form = new formidable.IncomingForm();
    form.parse(request, function (err, fields, files) {
        // console.log('parsed form');
        if (err) {
            errmanager.formerr(response, err);
        } else if (!fields.user_name && !fields.user_uid) {
            errmanager.loginerr(response);
        } else if (!fields.user_key) {
            // 需要用户的server酱key，但是不存
            errmanager.keyerror(response);
        } else {
            if (islogin(fields)) {
                if (fields.job_text) {
                    if (fields.job_schedule || fields.job_cron) {
                        if (fields.job_timeout) {
                            // 设置了定时任务就必须设置结束时间，服务不负责维护任务，数据库也不负责维护任务
                            // 至少目前如此。
                            jh.addJob(rq, fields);
                            errmanager.success(response);
                        } else {
                            errmanager.scheduleerr(response);
                        }
                    } else {
                        jh.addJob(rq, fields);
                        errmanager.success(response);
                    }
                } else {
                    errmanager.joberr(response);
                }
            } else {
                errmanager.loginerr(response);
            }
        }
    });
}

// 查看历史job
function history(response, request) {
    var form = new formidable.IncomingForm();
    form.parse(request, function (err, fields, files) {
        if (err) {
            errmanager.formerr(response, err);
        } else if (!fields.user_name) {
            errmanager.usererr(response);
        } else {
            if (islogin(fields)) {
                var esbody = {
                    size: 1000,
                    query: {
                        query_string: {
                            query: 'user_name:' + fields.user_name
                        }
                    }
                }
                let tempResponse = response;
                rq.post({
                    url: es_url + es_index_job + '*' + es_method_search,
                    method: 'POST',
                    json: true,
                    headers: {
                        "content-type": "application/json",
                    },
                    body: esbody
                }, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        tempResponse.writeHead(200, { "Content-Type": "application/json" });
                        tempResponse.end(JSON.stringify(response.body.hits.hits));
                    } else {
                        if (!error) {
                            // es层面的错误
                            errmanager.eserr(tempResponse, response.body);
                        } else {
                            // http层面的错误
                            errmanager.resterr(tempResponse, error);
                        }
                    }
                });
            } else {
                errmanager.loginerr(response);
            }
        }
    });
}

// 是否注册了
function hasregistered(response, request) {
    var form = new formidable.IncomingForm();
    form.parse(request, function (err, fields, files) {
        if (err) {
            errmanager.formerr(response, err);
        } else if (!fields.user_name) {
            errmanager.usererr(response);
        } else {
            var esbody = {
                query: {
                    query_string: {
                        query: 'user_name:' + fields.user_name
                    }
                }
            }
            let tempResponse = response;
            rq.post({
                url: es_url + es_index_user + es_method_search,
                method: 'POST',
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: esbody
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    tempResponse.writeHead(200, { "Content-Type": "application/json" });
                    var hasregised = response.body.hits.hits[0] ? true : false;
                    var respJson = {
                        result: hasregised
                    }
                    tempResponse.end(JSON.stringify(respJson));
                } else {
                    if (!error) {
                        // es层面的错误
                        errmanager.eserr(tempResponse, response.body);
                    } else {
                        // http层面的错误
                        errmanager.resterr(tempResponse, error);
                    }
                }
            });
        }
    });
}

// 是否登录了
function islogin(fields) {
    return global.user_dict && global.user_dict[fields.user_name] === fields.user_uid;
}

exports.sayhello = sayhello;
exports.register = register;
exports.login = login;
exports.checkin = checkin;
exports.addmission = addmission;
exports.history = history;
exports.hasregised = hasregistered;
