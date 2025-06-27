const https = require("https");
const crypto = require('crypto');
const buffer = require('buffer');
const symbolLibrary = require('../lib/symbol');
const lastTickLibrary = require('../lib/lastTick');
const checkPositionLibrary = require('../lib/checkPosition');
const openLibrary = require('../lib/open');
const closeLibrary = require('../lib/close');

const SERVER = 'webapi.anshinfx.com';
const LOGIN = '2003';
const PASSWORD = 'V!Ma5qIb123';
// const LOGIN = '10000';
// const PASSWORD = 'Test1234!';

exports.ping = async (ctx) => {
  ctx.status = 200;
  ctx.body = 'pong';
};
exports.testAccess = async (ctx) => {
  ctx.statusCode = 201;
  ctx.body = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];
};
exports.getSymbol = async (ctx) => {

  const result = await symbolLibrary('EURUSD');

  ctx.status = 200;
  ctx.body = {
    ok: result,
  }

};
exports.lastTick = async (ctx) => {
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
};
exports.checkPosition = async (ctx) => {
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
};
exports.open = async (ctx) => {
  const login = ctx.query.login;
  const symbol = ctx.query.symbol;
  const buyType = ctx.query.type;
  if (!login || !symbol || !buyType) {
    ctx.status = 400;
    ctx.body = {
      code: 1,
      msg: "Missing params"
    };
    return;
  }
  const result = await openLibrary(login, symbol, buyType);
  ctx.status = 200;
  ctx.body = {
    code: 0,
    data: result,
  }
};
exports.close = async (ctx) => {
  const login = ctx.query.login;
  const symbol = ctx.query.symbol;
  const position = ctx.query.position;
  if (!login || !symbol || !position) {
    ctx.status = 400;
    ctx.body = {
      code: 1,
      msg: "Missing params"
    };
    return;
  }
  const result = await closeLibrary(login, symbol, position);
  ctx.status = 200;
  ctx.body = {
    code: 0,
    data: result,
  }
};


