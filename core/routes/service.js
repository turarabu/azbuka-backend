module.exports = {
    get: {
        list,
        'remove-prices': removePrices,
        'remove-lefts': removeLefts
    },
    post: {
        'set-prices': setPrices,
        'set-lefts': setLeft
    }
}

function setPrices (req) {
    var json = getData(req.body)
    var type = 'price'

    set.call(this, type, json)
}

function setLeft (req) {
    var json = getData(req.body)
    var type = 'lefts'

    set.call(this, type, json)
}

function set (type, list) {
    var wasError = false

    list.forEach(data => {
        console.log(`updating service ${type}:`, data)

        let where = { id: data.id }
        let update = { $set: Object.assign(data, { type }) }

        this.db.service.updateOne(where, update, {upsert: true}, error => {
            wasError = ifError.call(this, error, wasError, {
                message: `Databse error: Can\'t update service by ID ${data.id}`,
                details: error
            })
        })
    })

    if (wasError === false)
        return this.success()
}

function removePrices (req) {
    var where = Object.assign(req.query, { type: 'lefts' })

    this.db.service.deleteMany(where, error => {
        if ( error === null )
            return this.success()
        
        else this.error({
            message: `Databse error: Can\'t update service by ID ${data.id}`,
            details: error
        })
    })
}

function removeLefts () {
    var where = Object.assign(req.query, { type: 'price' })

    this.db.service.deleteMany(where, error => {
        if ( error === null )
            return this.success()
        
        else this.error({
            message: `Databse error: Can\'t update service by ID ${data.id}`,
            details: error
        })
    })
}

function list (req) {
    var type = req.query.type

    if (type == false)
        return ifError.call(this, true, false, {
            message: 'type param is required!'
        })

    else this.db.service.find(req.query).toArray((error, array) => {
        var wasError = ifError.call(this, error, wasError, {
            message: 'Databse error',
            details: error
        })

        if (wasError === false)
            return this.success(array)
    })
}

function getData (body) {
    return body.many === true
        ? body.list : [body]
}

function ifError (error, wasError, data) {
    if (wasError === true)
        return true

    else if (error !== null) {
        this.error({
            error: true,
            message: data.message || data,
            details: data.details || ''
        })

        return true
    }

    else return false 
}