const { MT5Request } = require('./mt5auth.js');

module.exports = async (loginId, mtype, passwd) => {
  return new Promise((resolve, reject) => {
    var req = new MT5Request();
    // Authenticate on the server using the Auth command
    req.Auth(function (error) {
      if (error) {
        reject(error);
        return;
      }
      // api start
      const url = `/api/user/check_password?login=${loginId}&type=${mtype}&password=${passwd}`;
      req.Get(url, function (error, res, body) {
        if (error) {
          reject(error);
          return;
        }
        const result = req.ParseBodyJSON(error, res, body, null);
        const retcode = result?.retcode;
        // 結速auth連線
        req.Get('/quit', function (error, res, body) {
          if (error) {
            reject(error);
            return;
          }
        });
        resolve(retcode);
      });
    });
  });
};