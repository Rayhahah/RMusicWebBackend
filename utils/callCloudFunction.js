const axios = require('axios')
const getAccessToken = require('../utils/getAccessToken.js')
const callCloudFunction = async(ctx, functionName, params) => {
    const access_token = await getAccessToken()
    const url = "https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=" + access_token +
        "&env=" + ctx.state.env +
        "&name=" + functionName
    return await axios.post(url, {
        ...params
    }).then((res) => {
        return res
    }).catch(function(err) {

    })
}
module.exports = callCloudFunction