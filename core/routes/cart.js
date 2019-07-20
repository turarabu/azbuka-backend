const http = require('http')
const auth = {
    user: 'Web',
    pass: ''
}

module.exports = {
    get: { bonuse }
}

function bonuse (req) {
    var phone = req.query.phone
    var path = `/madein/hs/mobileapp/bonuses?phoneNumber=${phone}`
    console.log(path)

    request(path, data => {
        console.log(data)
        this.success(data)
    })
}

function request (path, method, callback) {
    var data = ''
    var req = http.request({
        path,
        method,
        host: '192.168.1.196',
        port: '80',
        auth: `${auth.user}:${auth.pass}`
    })

    req.on('data', chunk => data += chunk)
    req.on('end', function () {
        var json = JSON.parse(data)
        callback(json)
    })
}