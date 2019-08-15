const fs = require('fs')
const path = require('path')

module.exports = {
    post: { upload },
    get: { remove }
}

function upload (req) {
    console.log('Incoming images upload request')
    var fileCount = 0
    var self = this

    function files (action) {
        return (action === undefined)
            ? fileCount - 1
            : (action === 'add')
                ? ++fileCount
                : --fileCount
    }

    req.busboy.on('file', async function (fieldname, file, filename) {
        await files('add')
        await saveFile( file, filename )

        if (files() === 0)
            return self.success()

        else files('sub')
    })
}

function remove (req) {
    console.log('Incoming images remove request')
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
        file.on('data', chunk => data += chunk)
        file.on('end', function () {
            var buff = new Buffer.from(data, 'base64')

            fs.writeFileSync(config.storage.image(fileName), buff)
            resolve()
        })
    })
}