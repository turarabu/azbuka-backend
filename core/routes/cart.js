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
        this.success(data)
        // res.send( success(data) )
        // res.end()
    })
}

function request (path, method, post, callback) {
    var options = getOptions(path, method)
    var req = http.request(options, (res) => {
        var data = ''

        res.on('data', chunk => data += chunk)
        res.on('end', function () {
            data = data.replace(/ \{/g, '{')
            data = data.replace(/ \}/g, '}')
            data = data.replace(/\ "/g, '"')
            data = data.replace(/\: /g, ':')
            
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


function success (data) {
    var result = {
        error: false,
        success: true,
        data: '%data%'
    }

    return JSON.stringify(result).replace('"%data%"', data)
}