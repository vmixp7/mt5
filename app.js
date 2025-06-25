const koa = require('koa');
const Router = require('koa-router');
const app = new koa();
const router = new Router();
const helmet = require('koa-helmet');
const views = require('koa-views');
const cors = require('koa2-cors');
const json = require('koa-json');
const bodyParser = require('koa-bodyparser');
const RateLimit = require('koa2-ratelimit').RateLimit;

app.proxy = true;
app.use(helmet());
app.use(bodyParser());
app.use(json());
app.use(require('koa-static')(__dirname + '/public'));
app.use(views(__dirname + '/views', {
	"extension": 'html'
}));
const limiter = RateLimit.middleware({
	interval: { min: 1 },
	max: 10000,
});

app.use(limiter);

app.use(cors({
	'origin': '*',
	'methods': 'GET',
	'credentials': true,
	'preflightContinue': false,
	'maxAge': 5
}));

router.get('/', (ctx) => {
  ctx.body = 'hello world';
});

const userRoutes = require('./routes/userRoutes');
const mt5Routes = require('./routes/mt5Routes');

app.use(router.routes(), router.allowedMethods());
app.use(userRoutes.routes()).use(userRoutes.allowedMethods());
app.use(mt5Routes.routes()).use(mt5Routes.allowedMethods());

app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});

// const options = {
//   key: fs.readFileSync('./ssl/key.pem'),
//   cert: fs.readFileSync('./ssl/cert.pem'),
// };
// // 建立 HTTPS Server
// https.createServer(options, app.callback()).listen(443, () => {
//   console.log('HTTPS Server is running at https://localhost');
// });



