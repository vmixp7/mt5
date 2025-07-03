const koa = require('koa');
const Router = require('koa-router');
const app = new koa();
const router = new Router();
const helmet = require('koa-helmet');
const cors = require('koa2-cors');
const json = require('koa-json');
const bodyParser = require('koa-bodyparser');

app.proxy = true;
app.use(helmet());
app.use(bodyParser());
app.use(json());

app.use(cors({
	'origin': '*',
	'methods': 'GET',
	'credentials': true,
	'preflightContinue': false,
	'maxAge': 5
}));

router.get('/', async (ctx) => {
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



