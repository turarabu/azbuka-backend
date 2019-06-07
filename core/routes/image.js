const fs = require('fs')

module.exports = {
    post: { upload },
    get: { remove }
}

function upload (req) {
    console.log('Incoming upload')
    var files = 0
    var self = this

    req.busboy.on('file', function (fieldname, file, filename) {
        console.log('Incoming file', filename)
        var fstream = fs.createWriteStream( config.storage.image(filename) )
        ++files

        file.pipe(fstream)
        fstream.on('close', function () {
            console.log('File', filename, 'saved')
            if (files -1 === 0)
                return self.success()

            else --files
        })
    })
}

function remove (req) {
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