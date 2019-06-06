const fs = require('fs')

module.exports = {
    post: { upload },
    get: { remove }
}

function upload (req) {
    var self = this
    req.pipe(req.busboy)

    req.busboy.on('file', function (fieldname, file, filename) {
        fstream = fs.createWriteStream( config.storage.image(filename) )

        file.pipe(fstream)
        fstream.on('close', function () {       
            self.success()
        })
    })
}

function remove (req, res) {
    var self = this

    if (req.query.image === undefined)
        this.error({
            error: true,
            message: `image param is required, but didn't send`
        })

    else fs.unlink( config.storage.image(req.query.image), function (error) {
        if (error)
            self.error({
                error: true,
                message: 'Error when unlink file',
                details: error
            })

        else self.success()
    })
}