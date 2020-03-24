var sc = require("node-schedule");
var rq = require("request");

/**
 * 这里需要ES版本7以上，不然这种mapping可能不能生效
 * 7以下在mappings层和properties层中间加上_doc这一层就好了
 */
function inituser() {
    var reqbody = {
        mappings: {
            properties: {
                user_id: { type: "keyword" },
                user_name: { type: "keyword" },
                user_pw: { type: "keyword" }
            }
        }
    };
    rq.put({
        url: global.es_url + global.es_index_user, // 服务器初始化时创建index
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: reqbody
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('index user created');
        } else {
            console.log('index user already created');
        }
    });
}

function initmission() {
    addMissionIndex(rq); // 先运行一遍，反正Index不怕重复创建
    sc.scheduleJob('0 0 0 * * *', function () {
        addMissionIndex(rq);
    });
}

function addMissionIndex() {
    var date = new Date();
    var reqbody = {
        mappings: {
            properties: {
                user_name: { type: "keyword" },
                job_text: { type: "keyword" },
                job_desp: { type: "text" },
                job_schedule: { type: "long" },
                job_cron: { type: "keyword" },
                job_delay: { type: "long" },
                job_pubdate: { type: "date" },
                job_pubtime: { type: "date" },
                job_timeout: { type: "long" },
                job_target: { type: "keyword" }
            }
        }
    };
    var dt = date.getFullYear() + "-" + (date.getMonth() < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-" + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    rq.put({
        url: global.es_url + global.es_index_job + '-' + dt, // 服务器初始化时创建index
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: reqbody
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('index job-' + dt + ' created');
        } else {
            console.log('index job-' + dt + ' already created');
        }
    });
}

exports.inituser = inituser;
exports.initmission = initmission;
