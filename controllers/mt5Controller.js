const https = require("https");
const crypto = require('crypto');
const buffer = require('buffer');
const symbolLibrary = require('../lib/symbol');
const lastTickLibrary = require('../lib/lastTick');
const checkPositionLibrary = require('../lib/checkPosition');
const openLibrary = require('../lib/open');
const closeLibrary = require('../lib/close');
const checkPasswordLibrary = require('../lib/checkPassword');

exports.ping = async (ctx) => {
  ctx.status = 200;
  ctx.body = 'pong';
}
exports.testAccess = async (ctx) => {
  ctx.statusCode = 201;
  ctx.body = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];
}
exports.getSymbol = async (ctx) => {
  const result = await symbolLibrary('EURUSD');
  ctx.status = 200;
  ctx.body = {
    ok: result,
  }
}
exports.lastTick = async (ctx) => {
  try {
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
    const login = ctx.query.login;
    const symbol = ctx.query.symbol;
    const buyType = ctx.query.type;
    const volume = ctx.query.volume;
    if (!login || !symbol || !buyType || !volume) {
      ctx.status = 400;
      ctx.body = {
        code: 1,
        msg: "Missing params"
      };
      return;
    }
    const result = await openLibrary(login, symbol, buyType, volume);
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
    const { login, symbol, position, type } = ctx.query;
    if (!login || !symbol || !position || !type) {
      ctx.status = 400;
      ctx.body = {
        code: 1,
        msg: "Missing params"
      };
      return;
    }
    const result = await closeLibrary(login, symbol, position, type);
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
    const login = ctx.query.login;
    const password = ctx.query.password;
    const mtype = ctx.query.type;
    if (!login || !mtype || !password) {
      ctx.status = 400;
      ctx.body = {
        code: 1,
        msg: "Missing params"
      };
      return;
    }
    const result = await checkPasswordLibrary(login, mtype, password);
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
