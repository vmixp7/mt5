const https = require("https");
const crypto = require('crypto');
const buffer = require('buffer');
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

exports.ping = async (ctx) => {
  ctx.status = 200;
  ctx.body = 'pong';
}
exports.testAccess = async (ctx) => {
  try {
    const result = await testAccessLibrary();
    ctx.statusCode = 200;
    ctx.body = {
      code: 0,
      data: result,
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      code: 1,
      msg: "Internal Server Error",
      error: error.message ? error.message : error
    }
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
    ctx.status = 200;
    ctx.body = {
      code: 0,
      data: result,
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      code: 1,
      msg: "Internal Server Error",
      error: error.message
    }
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
    ctx.status = 200;
    ctx.body = {
      code: 0,
      data: result,
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      code: 1,
      msg: "Internal Server Error",
      error: error.message
    }
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
    ctx.status = 200;
    ctx.body = {
      code: 0,
      data: result,
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      code: 1,
      msg: "Internal Server Error",
      error: error.message
    }
  }
}
exports.open = async (ctx) => {
  try {
    console.log('open params--', JSON.stringify(ctx.query));
    const {login,symbol,type,volume } = ctx.query;
    if (!login || !symbol || !type || !volume) {
      ctx.status = 400;
      ctx.body = {
        code: 1,
        msg: "Missing params"
      };
      return;
    }
    const result = await openLibrary(login, symbol, type, volume);
    ctx.status = 200;
    ctx.body = {
      code: 0,
      data: result,
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      code: 1,
      msg: "Internal Server Error",
      error: error.message
    }
  }
}
exports.close = async (ctx) => {
  try {
    console.log('close params--', JSON.stringify(ctx.query));
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
    ctx.status = 200;
    ctx.body = {
      code: 0,
      data: result,
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      code: 1,
      msg: "Internal Server Error",
      error: error.message
    }
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
    ctx.status = 200;
    let dataStr = 'ok';
    if (result !== '0 Done') {
      dataStr = 'error';
    }
    ctx.body = {
      code: 0,
      data: dataStr,
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      code: 1,
      msg: "Internal Server Error",
      error: error.message
    }
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
    ctx.status = 200;
    ctx.body = {
      code: 0,
      data: result,
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      code: 1,
      msg: "Internal Server Error",
      error: error.message
    }
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
    ctx.status = 200;
    ctx.body = {
      code: 0,
      data: result,
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      code: 1,
      msg: "Internal Server Error",
      error: error.message
    }
  }
}
exports.symbolGetGroup = async (ctx) => {
  try {
    console.log('symbolGetGroup params--', JSON.stringify(ctx.query));
    const {symbol, group } = ctx.query;
    if (!symbol || !group) {
      ctx.status = 400;
      ctx.body = { error: "Missing params" };
      return;
    }
    const result = await symbolGetGroupLibrary(group);
    ctx.status = 200;
    ctx.body = {
      code: 0,
      data: result,
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      code: 1,
      msg: "Internal Server Error",
      error: error.message
    }
  }
}
