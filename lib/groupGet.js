const { MT5Request } = require('./mt5auth.js');

module.exports = async (name) => {
  return new Promise((resolve, reject) => {
    var req = new MT5Request();
    // Authenticate on the server using the Auth command
    req.Auth(function (error) {
      if (error) {
        reject(error);
        return;
      }
      const url = `/api/group/get?group=${name}`;
      req.Get(url, function (error, res, body) {
        if (error) {
          reject(error);
          return;
        }
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