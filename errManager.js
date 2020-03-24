function eserr(response, err) {
    response.writeHead(500, { "Content-Type": "application/json" });
    var errjson = {
        result: 'Error',
        source: 'ElasticSearch',
        message: err
    }
    response.end(JSON.stringify(errjson));
}

function formerr(response, err) {
    response.writeHead(500, { "Content-Type": "application/json" });
    var errjson = {
        result: 'Error',
        source: 'Formidable',
        message: err
    }
    response.end(JSON.stringify(errjson));
}

function resterr(response, err) {
    response.writeHead(500, { "Content-Type": "application/json" });
    var errjson = {
        result: 'Error',
        source: 'Rest',
        message: err
    }
    response.end(JSON.stringify(errjson));
}

function usererr(response) {
    response.writeHead(500, { "Content-Type": "application/json" });
    var errjson = {
        result: 'Error',
        source: 'User',
        message: 'Wrong Name or Password!'
    }
    response.end(JSON.stringify(errjson));
}

function loginerr(response) {
    response.writeHead(500, { "Content-Type": "application/json" });
    var errjson = {
        result: 'Error',
        source: 'Login',
        message: 'Login info out of date!'
    }
    response.end(JSON.stringify(errjson));
}

function joberr(response) {
    response.writeHead(500, { "Content-Type": "application/json" });
    var errjson = {
        result: 'Error',
        source: 'Job',
        message: 'Please add a job!'
    }
    response.end(JSON.stringify(errjson));
}

function scheduleerr(response) {
    response.writeHead(500, { "Content-Type": "application/json" });
    var errjson = {
        result: 'Error',
        source: 'Schedule',
        message: 'You need to set timeout for schedule job!'
    }
    response.end(JSON.stringify(errjson));
}

function keyerror(response) {
    response.writeHead(500, { "Content-Type": "application/json" });
    var errjson = {
        result: 'Error',
        source: 'Key',
        message: 'Missing Serverchan sc key!'
    }
    response.end(JSON.stringify(errjson));
}

function success(response) {
    response.writeHead(200, { "Content-Type": "application/json" });
    var json = {
        result: 'Success'
    }
    response.end(JSON.stringify(json));
}

exports.eserr = eserr;
exports.formerr = formerr;
exports.resterr = resterr;
exports.usererr = usererr;
exports.success = success;
exports.loginerr = loginerr;
exports.joberr = joberr;
exports.scheduleerr = scheduleerr;
exports.keyerror = keyerror;
