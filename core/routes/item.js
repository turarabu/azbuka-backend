module.exports = {
    post: { add, edit },
    get: { list }
}

function add (req, res) {
    return getDB.call(this, req.body, async db => {
        let data = getData(req.body)
        let errors = []

        await each(data, (item, resolve) => {
            db.findOne({id: item.id}, (error, result) => {
                if (error)
                    resolve(errors.push({
                        message: 'Database error',
                        details: error
                    }))

                else if (result !== null)
                    resolve(errors.push({
                        message: `Item with id ${item.id} already exists`
                    }))

                else db.insertOne(item, (error) => {
                    if (error) errors.push({
                        message: 'Database error',
                        details: error
                    })

                    return resolve()
                })
            })
        })

        if (errors.length === 0)
            return this.success()
            
        else {
            res.statusCode = 400
            res.send(JSON.stringify({
                error: true,
                success: true,
                message: 'Error details in `details`',
                details: errors
            }))

            return res.end()
        }
    })
}

function edit (req, res) {
    console.log('Incoming items edit request')
    return getDB.call(this, req.body, async db => {
        let data = getData(req.body)
        let errors = []

        await each(data, (item, resolve) => {
            db.findOne({id: item.id}, (error, result) => {
                if (error)
                    resolve(errors.push({
                        message: 'Database error',
                        details: error
                    }))

                else if (result === null)
                    resolve(errors.push({
                        message: `Item with id ${item.id} not exists`
                    }))

                else db.updateOne({id: item.id}, { $set: item }, (error) => {
                    if (error) errors.push({
                        message: 'Database error',
                        details: error
                    })

                    return resolve()
                })
            })
        })

        if (errors.length === 0)
            return this.success()

        else {
            res.statusCode = 400
            res.send(JSON.stringify({
                error: true,
                success: true,
                message: 'Error details in `details`',
                details: errors
            }))

            return res.end()
        }
    })
}

function list (req) {
    return getDB.call(this, req.query, async db => {
        delete req.query.shop
        
        db.find(req.query).toArray((error, result) => {
            console.log(result)
            if (error)
                return this.error({
                    error: true,
                    message: `Database error`,
                    details: JSON.stringify(error) 
                })

            else return this.success(result)
        })
    })
}


function getDB (body, callback) {
    if (body.shop === undefined)
        return this.error({
            message: `${c} param is required!`
        })

    else {
        var db = this.db.get.collection(`shop-${ body.shop }-items`)
        return callback(db)
    }
}

function getData (data) {
    return data.many === true
        ? data.list : [data]
}

function each (data, callback) {
    var promises = []

    data.forEach(function (item) {
        promises.push(new Promise(function (resolve, reject) {
            delete item.shop
            callback(item, resolve, reject)
        }))
    })

    return Promise.all(promises)
}
