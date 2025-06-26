const Router = require('koa-router');
const router = new Router({ prefix: '/mt5' });
const mt5Controller = require('../controllers/mt5Controller');

router.get('/', mt5Controller.ping);
router.get('/v1/test', mt5Controller.testAccess);
router.get('/v1/symbol/:id', mt5Controller.getSymbol);
router.get('/v1/send', mt5Controller.send);
router.get('/v1/check', mt5Controller.check);
router.get('/v1/last_tick', mt5Controller.lastTick);

module.exports = router;