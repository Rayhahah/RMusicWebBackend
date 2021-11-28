const Router = require('koa-router')
const router = new Router()
const axios = require('axios')

const callCloudFunction = require('../utils/callCloudFunction.js')
const callCloudDB = require('../utils/callCloudDB.js')
const cloudStorage = require('../utils/callCloudStorage.js')
const getAccessToken = require('../utils/getAccessToken.js')

router.get('/list', async(ctx, next) => {
    const query = ctx.request.query
    const data = await callCloudFunction(ctx, "music", {
        $url: 'swiper',
        start: parseInt(query.start),
        count: parseInt(query.count)
    }).then((res) => {
        return JSON.parse(res.data.resp_data).data
    })
    let fileList = []
    data.forEach(item => {
        fileList.push({
            fileid: item.fileid,
            max_age: 7200
        })
    });
    const downloadRes = await cloudStorage.download(ctx, fileList)
    let responseData = []
    for (let i = 0; i < downloadRes.data.file_list.length; i++) {
        const item = downloadRes.data.file_list[i];
        responseData.push({
            _id: data[i]._id,
            fileid: item.fileid,
            download_url: item.download_url
        })
    }
    ctx.body = {
        code: 20000, //这个是vue-template-admin所需要的,其他情况不需要
        data: responseData
    }
})

router.post('/upload', async(ctx) => {
    const fileid = await cloudStorage.upload(ctx)
    console.log(fileid)
    const query = `
        db.collection('swiper').add(
            {
                data:{
                    fileid:'${fileid}'
                }
            }
        )
        `
    const res = await callCloudDB(ctx, 'databaseadd', query)
        // console.log(res)
    ctx.body = {
        code: 20000,
        id_list: res.data.id_list
    }
})

router.get('/del', async(ctx, next) => {
    const query = ctx.request.query
    const id = query.id
    const fileid = query.fileid
        //从文件服务器中删除
    const delRes = await cloudStorage.del(ctx, [fileid])
    console.log(delRes)
    let responseData = []
    for (let i = 0; i < delRes.data.delete_list.length; i++) {
        const item = delRes.data.delete_list[i];
        responseData.push({
            _id: id,
            fileid: item.fileid
        })
    }
    //从数据库中删除
    const q = `
        db.collection('swiper').doc('${id}').remove()
        `
    const dbDelRes = await callCloudDB(ctx, 'databasedelete', q)
    ctx.body = {
        code: 20000, //这个是vue-template-admin所需要的,其他情况不需要
        data: responseData
    }
})
module.exports = router