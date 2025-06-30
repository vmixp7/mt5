module.exports = async (SYMBOL)=>{
  return new Promise((resolve, reject) => {
    const https = require("https");
    const crypto = require('crypto');
    const buffer = require('buffer');

    function MT5Request(server, port) {
      this.server = server;
      this.port = port;
      this.https = new https.Agent();
      this.https.maxSockets = 1; // only one connection is used
    }

    MT5Request.prototype.Get = function (path, callback) {
      var options = {
        hostname: this.server,
        port: this.port,
        path: path,
        agent: this.https,
        headers: { "Connection": "keep-alive" },
        rejectUnauthorized: false, // uncomment this line if you use self-signed certificates
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
        hostname: this.server,
        port: this.port,
        path: path,
        agent: this.https,
        method: "POST",
        headers: {
          "Connection": "keep-alive",
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
        },
        rejectUnauthorized: false, // comment out this line if you use self-signed certificates
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
          var cli_random_buf_hex = cli_random_buf.toString('hex');
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

    const SERVER = 'webapi.anshinfx.com';
    const LOGIN = '2003';
    const PASSWORD = 'V!Ma5qIb123';
    // const SYMBOL = 'EURUSD';

    // Example of use
    var req = new MT5Request(SERVER, 443);
    // Authenticate on the server using the Auth command
    req.Auth(LOGIN, PASSWORD, 1985, "WebManager", function (error) {
      if (error) {
        console.log(error);
        reject(error);
        return;
      }

      // 使用正確的 from/to 範圍與 data 欄位參數（開高低收）
      const chartUrl = `/api/dealer/send_request`;

      const body = {
        "Action":"201",
        "Login":"10000",
        "Symbol":"EURUSD",
        "Volume":"100",
        "TypeFill":"0",
        "PriceOrder":"2.15735",
        "Type":"0",
        "Digits":"5"
        // "Position":"0",
      }

      req.Post(chartUrl, JSON.stringify(body), function (error, res, body) {
        if(error){
          console.log(error);
          reject(error);
          return;
        }
        const result = req.ParseBodyJSON(error, res, body, null);
        const datas = result?.answer;
        if (!datas || !datas.id) {
          console.log("查無請求結果 ID");
          reject('datas is null or id is missing');
          return;
        }

        const chartUrl2 = `/api/dealer/get_request_result?id=${datas.id}`;
        req.Post(chartUrl2, JSON.stringify({}), function (error, res, body) {
        const result = req.ParseBodyJSON(error, res, body, null);
        const datas2 = result?.answer;
        resolve(datas2);
        });
      });
    });
  });

};