const https = require("https");
const crypto = require('crypto');
const buffer = require('buffer');

function MT5Request(server, port) {
  this.server = server;
  this.port = port;
  this.https = new https.Agent();
  this.https.maxSockets = 1; // 仅使用一个连接
}

MT5Request.prototype.Get = function (path, callback) {
  var options = {
    hostname:this.server,
    port:this.port,
    path: path,
    agent:this.https,
    headers: { "Connection":"keep-alive" },
  //rejectUnauthorized: false, //如果您使用自签名证书，请取消注释此行
  };
  var req = https.get(options, function (res) {
    res.setEncoding('utf8');
    var body = "";
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      callback(null, res, body);
    });
  });
  req.on('error', function (e) {
    console.log(e);
    return callback(e);
  });
};

MT5Request.prototype.Post = function (path, body, callback) {
  var options = {
    hostname:this.server,
    port:this.port,
    path: path,
    agent:this.https,
    method:"POST",
    headers: {
      "Connection":"keep-alive",
      "Content-Type":"application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(body),
    },
    rejectUnauthorized: false,// 如果使用自签名证书，请注释这一行。
  };
  var req = https.request(options, function (res) {
    res.setEncoding('utf8');
    var body = "";
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      callback(null, res, body);
    });
  });
  req.on('error', function (e) {
    console.log(e);
    return callback(e);
  });
  req.write(body);
  req.end();
};


MT5Request.prototype.ParseBodyJSON = function (error, res, body, callback) {
  if (error) {
    console.log("Request error-- " + error);
    callback && callback(error);
    return (null);
  }
  if (res.statusCode != 200) {
    callback && callback(res.statusCode);
    return (null);
  }
  var answer = null;
  try {
    answer = JSON.parse(body);
  }
  catch {
    console.log("Parse JSON error");
  }
  if (!answer) {
    callback && callback("invalid body answer");
    return (null);
  }
  var retcode = parseInt(answer.retcode);
  if (retcode != 0) {
    callback && callback(answer.retcode);
    return (null);
  }
  return (answer);
}

MT5Request.prototype.ProcessAuth = function (answer, password) {
  //---
  var pass_md5 = crypto.createHash('md5');
  var buf = buffer.transcode(Buffer.from(password, 'utf8'), 'utf8', 'utf16le');
  pass_md5.update(buf, 'binary');
  var pass_md5_digest = pass_md5.digest('binary');
  //---
  var md5 = crypto.createHash('md5');
  md5.update(pass_md5_digest, 'binary');
  md5.update('WebAPI', 'ascii');
  var md5_digest = md5.digest('binary');
  //---
  var answer_md5 = crypto.createHash('md5');
  answer_md5.update(md5_digest, 'binary');
  var buf = Buffer.from(answer.srv_rand, 'hex');
  answer_md5.update(buf, 'binary');
  //---
  return (answer_md5.digest('hex'));
}

MT5Request.prototype.ProcessAuthFinal = function (answer, password, cli_random) {
  //---
  var pass_md5 = crypto.createHash('md5');
  var buf = buffer.transcode(Buffer.from(password, 'utf8'), 'utf8', 'utf16le');
  pass_md5.update(buf, 'binary');
  var pass_md5_digest = pass_md5.digest('binary');
  //---
  var md5 = crypto.createHash('md5');
  md5.update(pass_md5_digest, 'binary');
  md5.update('WebAPI', 'ascii');
  var md5_digest = md5.digest('binary');
  //---
  var answer_md5 = crypto.createHash('md5');
  answer_md5.update(md5_digest, 'binary');
  answer_md5.update(cli_random, 'binary');
  return (answer.cli_rand_answer == answer_md5.digest('hex'));
}

MT5Request.prototype.Auth = function (login, password, build, agent, callback) {
  if (!login || !password || !build || !agent)
    return;
  var self = this;
  self.Get("/api/auth/start?version=" + build + "&agent=" + agent + "&login=" + login + "&type=manager", function (error, res, body) {
    var answer = self.ParseBodyJSON(error, res, body, callback);
    if (answer) {
      var srv_rand_answer = self.ProcessAuth(answer, password);
      var cli_random_buf = crypto.randomBytes(16);
      cli_random_buf_hex = cli_random_buf.toString('hex');
      self.Get("/api/auth/answer?srv_rand_answer=" + srv_rand_answer + "&cli_rand=" + cli_random_buf_hex, function (error, res, body) {
        var answer = self.ParseBodyJSON(error, res, body, callback);
        if (answer) {
          if (self.ProcessAuthFinal(answer, password, cli_random_buf))
            callback && callback(null);
          else
            callback && callback("invalid final auth answer");
        }
      });
    }
  });
  return (true);
};

// 使用示例
var req = new MT5Request("192.109.17.27", 443);
// 使用“验证”命令在服务器上进行身份验证
req.Auth(2003,"V!Ma5qIb", 1985,"WebManager", function (error) {
  if (error) {
    console.log(error);
    return;
  }
  // 让我们使用symbol_get命令请求名为TEST的交易品种
  req.Get("/api/symbol/get?symbol=TEST", function (error, res, body) {
    if (error) {
      console.log(error);
      return;
    }
    var answer = req.ParseBodyJSON(error, res, body,null);
    var symbol = answer.answer;
    console.log(symbol);
    // 更改描述
    symbol.Description = 'My Description';
    // 使用symbol_add命令将更改发送至服务器
    req.Post('/api/symbol/add', JSON.stringify(symbol), function (error, res, body) {
      if (error) {
        console.log(error);
        return;
      }
      var answer = req.ParseBodyJSON(error, res, body,null);
      var symbol = answer.answer;
      console.log(symbol);
    });
  });
});