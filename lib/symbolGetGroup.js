const { MT5Request } = require('./mt5auth.js');

module.exports = async (symbol, group) => {
  return new Promise((resolve, reject) => {
    var req = new MT5Request();
    // Authenticate on the server using the Auth command
    req.Auth(function (error) {
      if (error) {
        reject(error);
      }
      const url = `/api/symbol/get_group?symbol=${symbol}&group=${group}`;
      req.Get(url, function (error, res, body) {
        if (error) {
          reject(error);
        }
        const result = req.ParseBodyJSON(error, res, body, null);
        console.log('result--', JSON.stringify(result));
        const answer = result?.answer;
        // 結速auth連線
        req.Get('/quit', function (error, res, body) {
          if (error) {
            reject(error);
          }
        });
        resolve(answer);
      });
    });
  });

};
