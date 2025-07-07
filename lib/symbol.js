const { MT5Request } = require('./mt5auth.js');

module.exports = async (SYMBOL) => {
  return new Promise((resolve, reject) => {
    var req = new MT5Request();
    // Authenticate on the server using the Auth command
    req.Auth(function (error) {
      if (error) {
        reject(error);
        return;
      }

      const url = `/api/symbol/get?symbol=${SYMBOL}`;
      req.Get(url, function (error, res, body) {
        const result = req.ParseBodyJSON(error, res, body, null);
        const answer = result?.answer;
        // 結速auth連線
        req.Get('/quit', function (error, res, body) {
          if (error) {
            reject(error);
            return;
          }
        });
        resolve(answer);
      });
    });
  });

};
