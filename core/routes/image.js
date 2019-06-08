const fs = require('fs')
const path = require('path')
const base64ToImage = require('base64-to-image')

module.exports = {
    post: { upload },
    get: { remove }
}

function upload (req) {
    console.log('Incoming upload')
    var files = 0
    var self = this

    req.busboy.on('file', async function (fieldname, file, filename) {
        console.log('Incoming file', filename)
        ++files
        await saveFile( file, filename )

        console.log('File', filename, 'saved')
        if (files -1 === 0)
            return self.success()

        else --files
    })
}

function remove (req) {
    var self = this

    if (req.query.image === undefined)
        this.error({
            error: true,
            message: `image param is required, but didn't send`
        })

    else fs.unlink( path.join(config.storage.image, req.query.image), function (error) {
        if (error)
            self.error({
                error: true,
                message: 'Error when unlink file',
                details: error
            })

        else self.success()
    })
}

function saveFile (file, fileName) {
    var data = ''

    return new Promise(function (resolve) {
        file.on('data', chunk => file += chunk)
        file.on('end', function () {
            fs.writeFileSync(config.storage.image(fileName), data, 'base64')
            // base64ToImage(data, config.storage.image, options)
            resolve()
        })

    })
}