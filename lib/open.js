const { MT5Request } = require('./mt5auth.js');

module.exports = async (loginId, symbol, buyType, volume) => {
  return new Promise((resolve, reject) => {
    console.time('openTime--');
    var req = new MT5Request();
    // Authenticate on the server using the Auth command
    req.Auth(function (error) {
      if (error) {
        console.log('Auth error--', error);
        reject(error);
        return;
      }
      // api start
      const url = `/api/dealer/send_request`;
      const body = {
        "Action": "200",
        "Login": loginId,
        "Symbol": symbol,
        "Volume": volume,
        "TypeFill": "0",
        "Type": buyType,
        // "PriceOrder":"1.11850",
        "Digits": "5"
      }

      req.Post(url, JSON.stringify(body), function (error, res, body) {
        if (error) {
          reject(error);
          return;
        }
        const result = req.ParseBodyJSON(error, res, body, null);
        const answer = result?.answer;

        const url2 = `/api/dealer/get_request_result?id=${answer.id}`;
        req.Post(url2, JSON.stringify(body), function (error, res, body) {
          if (error) {
            reject(error);
            return;
          }
          const result2 = req.ParseBodyJSON(error, res, body, null);
          const answer2 = result2?.answer;
          // 結速auth連線
          req.Get('/quit', function (error, res, body) {
            if (error) {
              reject(error);
              return;
            }
          });
          resolve(answer2[answer.id]);
        });
      });
    });
    console.timeEnd('openTime--');
  });
};