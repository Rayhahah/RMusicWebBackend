const axios = require('axios')
const getAccessToken = require('../utils/getAccessToken.js')
const rp = require('request-promise')
const fs = require('fs')
const FormData = require('form-data');

const cloudStorage = {
    async download(ctx, fileList) {
        const access_token = await getAccessToken()
        const url = 'https://api.weixin.qq.com/tcb/batchdownloadfile?access_token=' + access_token
        return await axios.post(url, {
            env: ctx.state.env,
            file_list: fileList
        }).then((res) => {
            return res
        }).catch(function(err) {

        })
    },
    async del(ctx, fileid) {
        const access_token = await getAccessToken()
        const url = 'https://api.weixin.qq.com/tcb/batchdeletefile?access_token=' + access_token
        return await axios.post(url, {
            env: ctx.state.env,
            fileid_list: fileid
        }).then((res) => {
            return res
        }).catch(function(err) {

        })
    },
    async upload(ctx) {
        const file = ctx.request.files.file
        const path = 'swiper/' + Date.now() + '-' + Math.random() + '-' + file.name
        const access_token = await getAccessToken()
        const url = 'https://api.weixin.qq.com/tcb/uploadfile?access_token=' + access_token
        const uploadInfo = await axios.post(url, {
            env: ctx.state.env,
            path: path
        }).then((res) => {
            // console.log(res)
            return res.data
        }).catch(function(err) {

        })

        const form = new FormData(); // 创建form对象
        form.append("key", path); // 通过append向form对象添加数据
        form.append("Signature", uploadInfo.authorization); // 添加form表单中其他数据
        form.append("x-cos-security-token", uploadInfo.token); // 添加form表单中其他数据
        form.append("x-cos-meta-fileid", uploadInfo.cos_file_id); // 添加form表单中其他数据
        form.append("file", fs.createReadStream(file.path)); // 添加form表单中其他数据
        // form.append("file", file); // 添加form表单中其他数据

        var headers = form.getHeaders(); //获取headers
        //使用Promise来等待回调的结果再返回
        return new Promise((resolve, reject) => {
            //获取form-data长度
            form.getLength(async function(err, length) {
                if (err) {
                    return;
                }
                //设置长度，important!!!
                headers['content-length'] = length;
                await axios({
                        method: "post",
                        url: uploadInfo.url,
                        data: form,
                        headers: headers
                    })
                    // await axios.post(uploadInfo.url, form, { headers })
                    .then((res) => {
                        // console.log(res)
                        console.log('upload success')

                    }).catch((res) => {
                        console.log(res)
                        console.log('upload fail')
                    })
                resolve(uploadInfo.file_id)
            })
        })

    },
    async uploadByRequestWay() {
        // headers['Content-type'] = "multipart/form-data";
        // let config = {
        //     headers: {
        //         'Content-length': length,
        //         'Content-type': 'multipart/form-data',
        //     }
        // };
        // await axios.post(uploadInfo.url, {
        //         data: form,
        //     }, config)

        //使用request上传
        // const params = {
        //     method: 'POST',
        //     headers: {
        //         'content-type': 'multipart/form-data'
        //     },
        //     uri: uploadInfo.url,
        //     formData: {
        //         key: path,
        //         Signature: uploadInfo.authorization,
        //         'x-cos-security-token': uploadInfo.token,
        //         'x-cos-meta-fileid': uploadInfo.cos_file_id,
        //         file: fs.createReadStream(file.path)
        //     },
        //     json: true
        // }
        // await rp(params)
        //     .then((res) => {
        //         console.log(res)
        //         console.log('upload success')

        //     }).catch((res) => {
        //         console.log(res)
        //         console.log('upload fail')
        //     })
    }
}
module.exports = cloudStorage