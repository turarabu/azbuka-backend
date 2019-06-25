const Readable = require('stream').Readable
const Busboy = require('busboy')

module.exports = function (req, res, next) {
    if (req.headers['content-type'] === undefined)
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