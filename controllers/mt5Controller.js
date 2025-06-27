const https = require("https");
const crypto = require('crypto');
const buffer = require('buffer');
const symbolLibrary = require('../lib/symbol');
const lastTickLibrary = require('../lib/lastTick');
const checkOrderLibrary = require('../lib/checkOrder');
const buyLibrary = require('../lib/buy');
const sellLibrary = require('../lib/sell');

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
exports.checkOrder = async (ctx) => {
    const login = ctx.query.login;
    if (!login) {
      ctx.status = 400;
      ctx.body = {
        code: 1,
        msg: "Missing params"
      };
      return;
    }
    const result = await checkOrderLibrary(login);
    ctx.status = 200;
    ctx.body = {
      code: 0,
      data: result,
    }
};
exports.buy = async (ctx) => {
  const login = ctx.query.login;
  const symbol = ctx.query.symbol;
  if (!login || !symbol) {
    ctx.status = 400;
    ctx.body = {
      code: 1,
      msg: "Missing params"
    };
    return;
  }
  const result = await buyLibrary(login, symbol);
  ctx.status = 200;
  ctx.body = {
    code: 0,
    data: result,
  }
};
exports.sell = async (ctx) => {
  const login = ctx.query.login;
  const symbol = ctx.query.symbol;
  const order = ctx.query.order;
  if (!login || !symbol || !order) {
    ctx.status = 400;
    ctx.body = {
      code: 1,
      msg: "Missing params"
    };
    return;
  }
  const result = await sellLibrary(login, symbol, order);
  ctx.status = 200;
  ctx.body = {
    code: 0,
    data: result,
  }
};


