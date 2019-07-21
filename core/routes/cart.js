const qstr = require('querystring')
const http = require('http')
const auth = {
    user: 'Web',
    pass: ''
}

module.exports = {
    get: { bonuse },
    post: { order }
}

function bonuse (req) {
    var phoneNumber = req.query.phone
    var path = `/madein/hs/mobileapp/bonuses?${ qstr.stringify({phoneNumber}) }`
    request(path, 'GET', {}, this.success)
}

function order (req, res) {
    var id = req.query.shop
    var path = `/madein/hs/mobileapp/orders?${ qstr.stringify({id}) }`
    console.log(req.query)

    request(path, 'POST', {}, this.success)
}

function request (path, method, post, callback) {
    var options = getOptions(path, method)
    var req = http.request(options, (res) => {
        var data = ''

        res.on('data', chunk => {
            
            data += chunk
            console.log(data)
        })
        res.on('end', function () {
            data = data.replace(/\s/g, '')
            callback( JSON.parse(data) )
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
