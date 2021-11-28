const Router = require('koa-router')
const router = new Router()
const axios = require('axios')

const callCloudFunction = require('../utils/callCloudFunction.js')
const callCloudDB = require('../utils/callCloudDB.js')

router.get('/list', async(ctx, next) => {
    const query = ctx.request.query
    const data = await callCloudFunction(ctx, "music", {
        $url: 'playlist',
        start: parseInt(query.start),
        count: parseInt(query.count)
    }).then((res) => {
        return JSON.parse(res.data.resp_data).data
    })
    ctx.body = {
        code: 20000, //这个是vue-template-admin所需要的,其他情况不需要
        data: data
    }
})
router.get('/getById', async(ctx, next) => {
    const query = `db.collection('playlist').doc('${ctx.request.query.id}').get()`
    const data = await callCloudDB(ctx, "databasequery", query, {

    }).then((res) => {
        return JSON.parse(res.data.data)
    })
    ctx.body = {
        code: 20000, //这个是vue-template-admin所需要的,其他情况不需要
        data: data
    }
})

router.post('/updatePlaylist', async(ctx, next) => {
    const params = ctx.request.body
        // console.log(params)
    const query = `db.collection('playlist')
    .doc('${params._id}').update({
        data:{
            name:'${params.name}',
            copywriter:'${params.copywriter}'
        }
    })`
    const data = await callCloudDB(ctx, "databaseupdate", query).then((res) => {
        return res.data
    })
    ctx.body = {
        code: 20000, //这个是vue-template-admin所需要的,其他情况不需要
        data: data
    }
})

router.get('/del', async(ctx, next) => {
    const params = ctx.request.query
        // console.log(params)
    const query = `db.collection('playlist')
    .doc('${params.id}').remove()`
    const data = await callCloudDB(ctx, "databasedelete", query).then((res) => {
        return res.data
    })
    ctx.body = {
        code: 20000, //这个是vue-template-admin所需要的,其他情况不需要
        data: data
    }
})
module.exports = router