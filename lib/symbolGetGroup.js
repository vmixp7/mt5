const { MT5Request } = require('./mt5auth.js');

module.exports = async (symbol, loginId) => {
  return new Promise((resolve, reject) => {
    var req = new MT5Request();
    // Authenticate on the server using the Auth command
    req.Auth(function (error) {
      if (error) {
        reject(error);
        return;
      }
      const url = `/api/user/get?login=${loginId}`;
      req.Get(url, function (error, res, body) {
        if (error) {
          reject(error);
          return;
        }
        const result = req.ParseBodyJSON(error, res, body, null);
        const answer = result?.answer;

        const group = answer?.Group;
        console.log('group--', group);

        const url = `/api/symbol/get_group?symbol=${symbol}&group=${group}`;
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
  });
};
