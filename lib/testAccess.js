const { MT5Request } = require('./mt5auth.js');

module.exports = async () => {
  return new Promise((resolve, reject) => {
    var req = new MT5Request();
    req.Auth(function (error) {
      if (error) {
        reject(error);
      }
      // api start
      const url = `/api/test/access`;
      req.Get(url, function (error, res, body) {
        if (error) {
          reject(error);
        }
        const result = req.ParseBodyJSON(error, res, body, null);
        // 結速auth連線
        req.Get('/quit', function (error, res, body) {
          if (error) {
            reject(error);
          }
        });
        resolve(result);
      });
    });
  });
};