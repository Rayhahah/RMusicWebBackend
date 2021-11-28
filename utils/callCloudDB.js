const axios = require('axios')
const getAccessToken = require('../utils/getAccessToken.js')
const callCloudDB = async(ctx, functionName, query = {}) => {
    /**
     * databasequery
     */
    const access_token = await getAccessToken()
    const url = "https://api.weixin.qq.com/tcb/" + functionName + "?access_token=" + access_token
    return await axios.post(url, {
        query,
        env: ctx.state.env
    }).then((res) => {
        return res
    }).catch(function(err) {
        console.log(err)
    })
}
module.exports = callCloudDB