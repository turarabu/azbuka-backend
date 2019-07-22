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
    var data = JSON.parse(req.query.json)
    var order = {order: JSON.stringify(data.order)}
    this.success()
    request(path, 'POST', order, this.success)
}

function request (path, method, post, callback) {
    var options = getOptions(path, method)
    var req = http.request(options, (res) => {
        var data = ''
        console.log('start')
        res.on('data', chunk => {
            console.log('chunk')
            data += chunk
            console.log(chunk)
        })

        res.on('end', function () {
            data = data.replace(/\s/g, '')
            callback( JSON.parse(data) )
        })
    })

    console.log(post)
    req.write( qstr.stringify(post) )
    return req.end()
}

function getOptions (path, method) {
    return {
        path,
        method,
        host: '192.168.1.196',
        port: '80',
        auth: `${auth.user}:${auth.pass}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
}
