const qstr = require('querystring')
const http = require('http')
const auth = {
    user: 'Web',
    pass: ''
}

module.exports = {
    get: { bonuse }
}

function bonuse (req) {
    var phoneNumber = req.query.phone
    var path = `/madein/hs/mobileapp/bonuses?${ qstr.stringify({phoneNumber}) }`
    console.log(path)

    request(path, 'GET', data => {
        console.log(data)
        this.success(data)
    })
}

function request (path, method, callback) {
    var options = getOptions(path, method)
    
    http.request(options, (res) => {
        var data = ''

        res.on('data', chunk => data += chunk)
        res.on('end', function () {
            var json = JSON.parse(data)
            callback(json)
        })
    })
}

function getOptions (path, method) {
    return {
        path,
        method,
        host: '192.168.1.196',
        port: '80',
        auth: `${auth.user}:${auth.pass}`
    }
}