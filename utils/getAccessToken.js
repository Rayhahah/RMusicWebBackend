const APP_ID = "wx77907dc93495ca17"
const SECRET_KEY = "43db973cd9c53db33f6fe8e8d1667682"
const URL = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + APP_ID + "&secret=" + SECRET_KEY

const axios = require('axios')
const fs = require('fs')
const path = require('path')
const fileName = path.resolve(__dirname, './access_token.json')


const updateAccessToken = async() => {
    const res = await axios.get(URL)
    console.log(res.data)
    if (res.data.access_token) {
        fs.writeFileSync(fileName, JSON.stringify({
            access_token: res.data.access_token,
            create_time: new Date()
        }))
    } else {
        await updateAccessToken()
    }
}

const getAccessToken = async() => {
    try {
        const readRes = fs.readFileSync(fileName, 'utf8')
        const readObj = JSON.parse(readRes)

        const createTime = new Date(readObj.create_time).getTime()
        const nowTime = new Date().getTime()
            // console.log(readObj)
        if ((nowTime - createTime) / 1000 / 60 / 60 >= 2) {
            await updateAccessToken()
            await getAccessToken()
        }
        return readObj.access_token
    } catch (error) {
        await updateAccessToken()
        await getAccessToken()
    }
}
setInterval(async() => {
    await updateAccessToken()
}, (7200 - 300) * 1000)

module.exports = getAccessToken