const https = require("https");
const crypto = require('crypto');
const buffer = require('buffer');

const SERVER = 'webapi.anshinfx.com';
const LOGIN = '2003';
const PASSWORD = 'V!Ma5qIb123';
// const PASSWORD = 'Test1234!';

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

exports.ping = async (ctx) => {
  ctx.status = 200;
  ctx.body = 'pong';
};
exports.testAccess = async (ctx) => {
  ctx.statusCode = 201;
  ctx.body = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];
};
exports.getSymbol = async (ctx) => {

  const id = ctx.params.id;
  console.log("ctx.id-----", id);

  const SYMBOL = ctx.params.id || 'EURUSD'; //XAUUSD, EURUSD

    // Example of use
    var req = new MT5Request(SERVER, 443);
    // Authenticate on the server using the Auth command
    req.Auth(LOGIN, PASSWORD, 1985, "WebManager", function (error) {
      if (error) {
        console.log(error);
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      const oneHourAgo = now - 60 * 60 * 13;

      // 使用正確的 from/to 範圍與 data 欄位參數（開高低收）
      const chartUrl = `/api/chart/get?symbol=${SYMBOL}&from=${oneHourAgo}&to=${now}&data=dohlc`;

      req.Get(chartUrl, function (error, res, body) {

        if (error) {
          console.log("Error:", error);
          ctx.body = { error: "Request failed" };
          return;
        }

        ctx.status = 200;
        const result = req.ParseBodyJSON(error, res, body, null);
        const bars = result?.answer;

        if (!bars || bars.length === 0) {
          console.log("查無柱形圖歷史資料");
          return;
        }

        console.log(`共取得 ${bars.length} 筆 1 分鐘柱形圖資料`);
        console.log(`bars-->`, bars);
        ctx.body = { datas: bars };
      });

    });

};
exports.send = async (ctx) => {

    const id = ctx.query.login;
    const symbol = ctx.query.symbol;
    if (!id || !symbol) {
      ctx.status = 400;
      ctx.body = { error: "Missing params" };
      return;
    }

    var req = new MT5Request(SERVER, 443);

    req.Auth(LOGIN, PASSWORD, 1985, "WebManager", function (error) {
      if (error) {
        console.log(error);
        return;
      }

      let url = `/api/dealer/send_request`;
      const body = {
        "Action":"200", // 200:交易員下單
        "Login":id,
        "Symbol":symbol,
        "Volume":"100",
        "TypeFill":"0",
        "Type":"0",
        // "PriceOrder":"1.11850",
        "Digits":"5",
        "PriceSL":"0.17266", // 止損價格
        "PriceTP":"2.17266", // 止盈價格
      }
      req.Post(url, JSON.stringify(body), function (error, res, body) {
        if (error) {
          console.log("Error:", error);
          ctx.body = { error: "Request failed" };
          return;
        }
        const result = req.ParseBodyJSON(error, res, body, null);
        const answer = result?.answer;
        console.log(`answer-->`, answer);

        url = `/api/dealer/get_request_result?id=${answer.id}`;
        req.Get(url, function (error, res, body) {
          if (error) {
            console.log("Error:", error);
            ctx.body = { error: "Request failed" };
            return;
          }
          const result = req.ParseBodyJSON(error, res, body, null);
          const answer2 = result?.answer;
          console.log(`result2-->`, answer2[answer.id][0]);
          console.log(`answer2-->`, answer2[answer.id][1]);
          ctx.body = { datas : answer2 };
        });
      });

    });

};
exports.check = async (ctx) => {

    const id = ctx.query.login;
    if (!id) {
      ctx.body = { error: "Missing login ID" };
      return;
    }

    var req = new MT5Request(SERVER, 443);
    req.Auth(LOGIN, PASSWORD, 1985, "WebManager", function (error) {
      if (error) {
        console.log(error);
        return;
      }

      const url = `/api/position/check?login=${id}`;
      req.Get(url, function (error, res, body) {
        if (error) {
          console.log("Error:", error);
          ctx.body = { error: "Request failed" };
          return;
        }
        const result = req.ParseBodyJSON(error, res, body, null);
        console.log(`result-->`, result);
        const answer = result?.answer;

        console.log(`answer-->`, answer);
        ctx.body = { datas : answer };
      });

    });

};
exports.lastTick = async (ctx) => {

    const symbol = ctx.query.symbol;
    if (!symbol) {
      ctx.body = { error: "Missing symbol" };
      return;
    }

    var req = new MT5Request(SERVER, 443);
    req.Auth(LOGIN, PASSWORD, 1985, "WebManager", function (error) {
      if (error) {
        console.log(error);
        return;
      }

      const url = `/api/tick/last?symbol=${symbol}&trans_id=0`;
      req.Get(url, function (error, res, body) {
        if (error) {
          console.log("Error:", error);
          ctx.body = { error: "Request failed" };
          return;
        }
        const result = req.ParseBodyJSON(error, res, body, null);
        console.log(`result-->`, result);
        const answer = result?.answer;

        console.log(`answer-->`, answer);
        ctx.body = { datas : answer };
      });

    });

};


