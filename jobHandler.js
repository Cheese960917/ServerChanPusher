var sh = require('node-schedule');

// 换id在这换，在后续功能做好以前，先写死在这。
var server_chan_url = 'https://sc.ftqq.com/'
var es_url = global.es_url;
var es_index_job = global.es_index_job;
var es_type_default = global.es_type_default;

// id放到fields里面，前端放缓存里面，服务器不存这个。
function addJob(rq, fields) {
    var delayjob;
    var schedulejob;
    var cronjob;
    var shouldJobSendToServerChanImmediately = 1;
    var esbody = {
        user_name: fields.user_name,
        job_text: fields.job_text
    }
    if (fields.job_desp) {
        esbody.job_desp = fields.job_desp;
    }
    // TODO: 又判断类型又判断输入是否合法，太麻烦了，先让前端处理，以后再说吧
    if (fields.job_schedule) {
        // 经测试，这个至少5分钟以上的间隔
        esbody.job_schedule = fields.job_schedule;
        schedulejob = setInterval(function () {
            sendToServerChan(rq, fields);
        }, fields.job_schedule);
        shouldJobSendToServerChanImmediately = 0;
    }
    if (fields.job_cron) {
        esbody.job_cron = fields.job_cron;
        cronjob = sh.scheduleJob(fields.job_cron, function () {
            sendToServerChan(rq, fields);
        });
        shouldJobSendToServerChanImmediately = 0;
    }
    if (fields.job_delay) {
        esbody.job_delay = fields.job_delay;
        delayjob = setTimeout(function () {
            sendToServerChan(rq, fields);
        }, fields.job_delay);
        shouldJobSendToServerChanImmediately = 0;
    }
    if (fields.job_pubdate) {
        esbody.job_pubdate = fields.job_pubdate;
    } else {
        esbody.job_pubdate = getdate();
    }
    if (fields.job_pubtime) {
        esbody.job_pubtime = fields.job_pubtime;
    }
    if (fields.job_timeout) {
        esbody.job_timeout = fields.job_timeout;
        setTimeout(function () {
            if (schedulejob) {
                clearInterval(schedulejob);
            }
            if (delayjob) {
                clearTimeout(delayjob);
            }
            if (cronjob) {
                cronjob.cancel();
            }
        }, fields.job_timeout);
    }
    rq.post({
        url: es_url + es_index_job + '-' + getdate() + es_type_default,
        method: 'POST',
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: esbody
    }, function (error, response, body) {
        if (!error && response.statusCode == 200 || response.statusCode == 201) {
            if (shouldJobSendToServerChanImmediately) {
                sendToServerChan(rq, fields);
            }
        } else {
            console.log('Save job to es failed!');
            if (error) {
                console.log(error);
            } else {
                console.log(response.statusCode);
                console.log(response.body);
            }
        }
    });
}

function sendToServerChan(rq, fields) {
    var text = encodeURIComponent(fields.job_text);
    var desp_full = (fields.job_desp ? ('&desp=' + encodeURIComponent(fields.job_desp)) : '');
    var ful_url = server_chan_url + fields.user_key + '.send' + '?' + 'text=' + text + desp_full;
    rq.get({
        url: ful_url
    }, function (error, response, body) {
        if (!error) {
            console.log('Send job to Server Success!');
        } else {
            if (error) {
                console.log('Send job to Server Failed! ' + error);
            } else {
                console.log('Send job to Server Failed! ' + response.body);
            }
        }
    });
}

function getdate() {
    var date = new Date();
    var dt = date.getFullYear() + "-" + (date.getMonth() < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-" + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    return dt;
}

exports.addJob = addJob;