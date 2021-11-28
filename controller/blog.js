const Router = require('koa-router')
const router = new Router()
const axios = require('axios')

const callCloudFunction = require('../utils/callCloudFunction.js')
const callCloudDB = require('../utils/callCloudDB.js')
const cloudStorage = require('../utils/callCloudStorage.js')

router.get('/list', async(ctx, next) => {
    const query = ctx.request.query
    const data = await callCloudFunction(ctx, "blog", {
        $url: 'list',
        start: parseInt(query.start),
        count: parseInt(query.count),
        keyWord: query.keyWord
    }).then((res) => {
        return JSON.parse(res.data.resp_data)
    })
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.img.length > 0) {
            let fileList = []
            item.imgUrls = []
            item.img.forEach(img => {
                fileList.push({
                    fileid: img,
                    max_age: 7200
                })
            });
            const downloadRes = await cloudStorage.download(ctx, fileList)
            downloadRes.data.file_list.forEach(imgFile => {
                item.imgUrls.push(imgFile.download_url)
            });
        } else {
            item.imgUrls = []
        }
    }
    ctx.body = {
        code: 20000, //这个是vue-template-admin所需要的,其他情况不需要
        data: data
    }
})


router.post('/del', async(ctx, next) => {
    const params = ctx.request.body
    const blogId = params.id
    const img = params.img
    console.log(params)
    let resData = 0
        //删除blog
    const queryDelBlog = `db.collection('blog').doc('${blogId}').remove()`
    const delBlog = await callCloudDB(ctx, "databasedelete", queryDelBlog)
        .then((res) => {
            console.log(res.data)
            return res.data.deleted
        })
    if (delBlog > 0) {
        resData = resData + 1
    }

    //删除blog-comment
    const queryDelBlogComment = `db.collection('blog-comment').where({blogId:'${blogId}'}).remove()`
    const delBlogComment = await callCloudDB(ctx, "databasedelete", queryDelBlogComment)
        .then((res) => {
            console.log(res.data)
            return res.data.deleted
        })
    if (delBlogComment > 0) {
        resData = resData + 10
    }
    //删除图片

    if (img.length < 1) {
        resData = resData + 100
    } else {
        const delBlogImg = await cloudStorage.del(ctx, img)
        console.log(delBlogImg.data)
        if (delBlogImg.data.delete_list.length == img.length) {
            resData = resData + 100
        }
    }
    ctx.body = {
        code: 20000, //这个是vue-template-admin所需要的,其他情况不需要
        data: resData
    }
})
module.exports = router