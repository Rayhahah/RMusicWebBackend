const PORT = 3000
const ENV = 'cloud1-9gmf1ssa11d2e293'
const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()
const cors = require('koa2-cors') //解决跨域问题
const koaBody = require('koa-body')
app.use(cors({
    /**
     * 批准跨域的地址
     */
    origin: ['http://localhost:9528'],
    credentials: true
}))

/**
 * 解决post参数解析
 */
app.use(koaBody({
    multipart: true
}))
app.use(async(ctx, next) => {
    console.log('全局中间件')
    ctx.state.env = ENV
    await next()
})

const playlist = require('./controller/playlist.js')
const swiper = require('./controller/swiper.js')
const blog = require('./controller/blog.js')
router.use('/playlist', playlist.routes())
router.use('/swiper', swiper.routes())
router.use('/blog', blog.routes())
app.use(router.routes())
app.use(router.allowedMethods())
app.use(async(ctx) => {
    ctx.body = 'Hello hahhaha'
})

app.listen(PORT, () => {
    console.log('服务器开启在' + PORT + '端口！')
})

/**
 * access_token 的存储与更新
access_token 的存储至少要保留 512 个字符空间；
access_token 的有效期目前为 2 个小时，需定时刷新，重复获取将导致上次获取的 access_token 失效；
建议开发者使用中控服务器统一获取和刷新 access_token，其他业务逻辑服务器所使用的 access_token 均来自于该中控服务器，不应该各自去刷新，否则容易造成冲突，导致 access_token 覆盖而影响业务；
access_token 的有效期通过返回的 expires_in 来传达，目前是7200秒之内的值，中控服务器需要根据这个有效时间提前去刷新。在刷新过程中，中控服务器可对外继续输出的老 access_token，此时公众平台后台会保证在5分钟内，新老 access_token 都可用，这保证了第三方业务的平滑过渡；
access_token 的有效时间可能会在未来有调整，所以中控服务器不仅需要内部定时主动刷新，还需要提供被动刷新 access_token 的接口，这样便于业务服务器在API调用获知 access_token 已超时的情况下，可以触发 access_token 的刷新流程。
 */
'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET'