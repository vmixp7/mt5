const Router = require('koa-router');
const router = new Router({ prefix: '/mt5' });
const mt5Controller = require('../controllers/mt5Controller');

router.get('/', mt5Controller.ping);
router.get('/v1/test', mt5Controller.testAccess);
router.get('/v1/symbol/:id', mt5Controller.getSymbol);
router.get('/v1/open', mt5Controller.open);
router.get('/v1/close', mt5Controller.close);
router.get('/v1/check_position', mt5Controller.checkPosition);
router.get('/v1/last_tick', mt5Controller.lastTick);

module.exports = router;