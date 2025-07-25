const Router = require('koa-router');
const router = new Router({ prefix: '/mt5' });
const mt5Controller = require('../controllers/mt5Controller');

router.get('/', mt5Controller.ping);
router.get('/v1/test', mt5Controller.testAccess);
router.get('/v1/symbol/get', mt5Controller.getSymbol);
router.get('/v1/open', mt5Controller.open);
router.get('/v1/close', mt5Controller.close);
router.get('/v1/check_position', mt5Controller.checkPosition);
router.get('/v1/last_tick', mt5Controller.lastTick);
router.get('/v1/check_password', mt5Controller.checkPassword);
router.get('/v1/user/get', mt5Controller.userGet);
router.get('/v1/group/get', mt5Controller.groupGet);
router.get('/v1/symbol/get_group', mt5Controller.symbolGetGroup);

module.exports = router;