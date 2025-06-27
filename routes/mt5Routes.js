const Router = require('koa-router');
const router = new Router({ prefix: '/mt5' });
const mt5Controller = require('../controllers/mt5Controller');

router.get('/', mt5Controller.ping);
router.get('/v1/test', mt5Controller.testAccess);
router.get('/v1/symbol/:id', mt5Controller.getSymbol);
router.get('/v1/buy', mt5Controller.buy);
router.get('/v1/sell', mt5Controller.sell);
router.get('/v1/check_order', mt5Controller.checkOrder);
router.get('/v1/last_tick', mt5Controller.lastTick);

module.exports = router;