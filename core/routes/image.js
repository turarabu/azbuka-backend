const fs = require('fs')

module.exports = {
    post: { upload },
    get: { remove }
}

function upload (req) {
    console.log('\nIncoming upload')
    console.log(req.headers)
    console.log('theBody', req.theBody === undefined)
    var files = 0
    var self = this
    req.pipe(req.busboy)

    req.busboy.on('file', function (fieldname, file, filename) {
        console.log('Triggered file', filename)
        var fstream = fs.createWriteStream( config.storage.image(filename) )
        ++files

        file.pipe(fstream)
        fstream.on('close', function () {
            console.log('Saved', filename)
            if (files -1 === 0) {
                console.log('All files uploaded!')
                return self.success()
            }
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