const Readable = require('stream').Readable
const Busboy = require('busboy')

module.exports = function (req, res, next) {
    console.log('Incoming request for', req.url)
    if (req.headers['content-type'] === undefined || req.url.search('image') < 0 )
        return next()

    var body = ''
    var busboy = new Busboy({ headers: req.headers })
    var files = new Readable

    req.on('data', chunk => body += chunk)

    req.on('end', function () {
        files.pipe( busboy )

        files.push( body.replace(/ \-\-/g, '--'))
        files.push(null)

        req.busboy = busboy
        return next()
    })
}