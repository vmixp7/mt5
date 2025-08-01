const symbolLibrary = require('../lib/symbol');
const lastTickLibrary = require('../lib/lastTick');
const checkPositionLibrary = require('../lib/checkPosition');
const openLibrary = require('../lib/open');
const closeLibrary = require('../lib/close');
const checkPasswordLibrary = require('../lib/checkPassword');
const testAccessLibrary = require('../lib/testAccess');
const userGetLibrary = require('../lib/userGet');
const groupGetLibrary = require('../lib/groupGet');
const symbolGetGroupLibrary = require('../lib/symbolGetGroup');
const { returnError, returnSuccess } = require('../lib/returnHandle');
const fetch = require('node-fetch');

function myPromise() {
  return new Promise((resolve) => {
    setTimeout(() => resolve('第一步完成'), 1000);
  });
}
async function getUser() {
  try {
    const response = await fetch('htt://jsonplaceholder.typicode.com/posts/1');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error; // 可以选择重新抛出错误
  }
}
exports.ping = async (ctx) => {
  try {
    const data = await getUser();
    console.log('GET 回傳資料:', data);
    ctx.body = 'pong';
  } catch (error) {
    returnError(ctx, error);
  }
}
exports.testAccess = async (ctx) => {
  try {
    const result = await testAccessLibrary();
    returnSuccess(ctx, result);
  } catch (error) {
    returnError(ctx, error);
  }
}
exports.getSymbol = async (ctx) => {
  try {
    console.log('getSymbol params--', JSON.stringify(ctx.query));
    const symbol = ctx.query.symbol;
    if (!symbol) {
      ctx.status = 400;
      ctx.body = { error: "Missing symbol" };
      return;
    }
    const result = await symbolLibrary(symbol);
    returnSuccess(ctx, result);
  } catch (error) {
    returnError(ctx, error);
  }
}
exports.lastTick = async (ctx) => {
  try {
    // console.log('lastTick params--', JSON.stringify(ctx.query));
    const symbol = ctx.query.symbol;
    if (!symbol) {
      ctx.status = 400;
      ctx.body = { error: "Missing symbol" };
      return;
    }
    const result = await lastTickLibrary(symbol);
    returnSuccess(ctx, result);
  } catch (error) {
    returnError(ctx, error);
  }
}
exports.checkPosition = async (ctx) => {
  try {
    // console.log('checkPosition params--', JSON.stringify(ctx.query));
    const login = ctx.query.login;
    if (!login) {
      ctx.status = 400;
      ctx.body = {
        code: 1,
        msg: "Missing params"
      };
      return;
    }
    const result = await checkPositionLibrary(login);
    returnSuccess(ctx, result);
  } catch (error) {
    returnError(ctx, error);
  }
}
exports.open = async (ctx) => {
  try {
    const { login, symbol, type, volume } = ctx.query;
    if (!login || !symbol || !type || !volume) {
      ctx.status = 400;
      ctx.body = {
        code: 1,
        msg: "Missing params"
      };
      return;
    }
    const result = await openLibrary(login, symbol, type, volume);
    returnSuccess(ctx, result);
  } catch (error) {
    returnError(ctx, error);
  }
}
exports.close = async (ctx) => {
  try {
    const { login, symbol, position, type, volume } = ctx.query;
    if (!login || !symbol || !position || !type || !volume) {
      ctx.status = 400;
      ctx.body = {
        code: 1,
        msg: "Missing params"
      };
      return;
    }
    const result = await closeLibrary(login, symbol, position, type, volume);
    returnSuccess(ctx, result);
  } catch (error) {
    returnError(ctx, error);
  }
}
exports.checkPassword = async (ctx) => {
  try {
    console.log('checkPassword params--', JSON.stringify(ctx.query));
    const { login, password, type } = ctx.query;
    if (!login || !type || !password) {
      ctx.status = 400;
      ctx.body = {
        code: 1,
        msg: "Missing params"
      };
      return;
    }
    const result = await checkPasswordLibrary(login, type, password);
    let dataStr = 'ok';
    if (result !== '0 Done') {
      dataStr = 'error';
    }
    returnSuccess(ctx, dataStr);
  } catch (error) {
    returnError(ctx, error);
  }
}
exports.userGet = async (ctx) => {
  try {
    console.log('userGet params--', JSON.stringify(ctx.query));
    const login = ctx.query.login;
    if (!login) {
      ctx.status = 400;
      ctx.body = { error: "Missing login" };
      return;
    }
    const result = await userGetLibrary(login);
    returnSuccess(ctx, result);
  } catch (error) {
    returnError(ctx, error);
  }
}
exports.groupGet = async (ctx) => {
  try {
    console.log('groupGet params--', JSON.stringify(ctx.query));
    const group = ctx.query.group;
    if (!group) {
      ctx.status = 400;
      ctx.body = { error: "Missing group" };
      return;
    }
    const result = await groupGetLibrary(group);
    returnSuccess(ctx, result);
  } catch (error) {
    returnError(ctx, error);
  }
}
exports.symbolGetGroup = async (ctx) => {
  try {
    console.log('symbolGetGroup params--', JSON.stringify(ctx.query));
    const { symbol, login } = ctx.query;
    if (!symbol || !login) {
      ctx.status = 400;
      ctx.body = { error: "Missing params" };
      return;
    }
    const result = await symbolGetGroupLibrary(symbol, login);
    returnSuccess(ctx, result);
  } catch (error) {
    returnError(ctx, error);
  }
}
