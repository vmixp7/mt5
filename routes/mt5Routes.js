const Router = require('koa-router');
const router = new Router({ prefix: '/mt5s' });
const mt5Controller = require('../controllers/mt5Controller');

router.get('/', mt5Controller.ping);
router.get('/test', mt5Controller.testAccess);
router.get('/symbol/:id', mt5Controller.getSymbol);
router.get('/send', mt5Controller.send);
router.get('/check', mt5Controller.check);

module.exports = router;