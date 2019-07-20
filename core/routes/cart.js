const qstr = require('querystring')
const http = require('http')
const auth = {
    user: 'Web',
    pass: ''
}

module.exports = {
    get: { bonuse }
}

function bonuse (req, res) {
    var phoneNumber = req.query.phone
    var path = `/madein/hs/mobileapp/bonuses?${ qstr.stringify({phoneNumber}) }`

    request(path, 'GET', {}, data => {
        console.log('cart', data.idCart)
        JSON.parse(data)
        res.send(data)
        res.end()
    })
}

function request (path, method, post, callback) {
    var options = getOptions(path, method)
    var req = http.request(options, (res) => {
        var data = ''

        res.on('data', chunk => data += chunk)
        res.on('end', function () {
            callback(data)
        })
    })

    req.write( qstr.stringify(post) )
    return req.end()
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