module.exports = {
    get: {
        list,
        // 'remove-prices': removePrices,
        // 'remove-lefts': removeLefts
    },
    post: {
        'set-prices': setPrices,
        'set-lefts': setLeft
    }
}

async function setPrices (req) {
    console.log('Incoming service price set request')
    var data = getData(req.body)
    var errors = []

    for ( let service of data ) {
        let where = priceWhere(service)
        let error = await set.call(this, where, service)

        if ( error !== true )
            errors.push(error)
    }

    return errors.length === 0
        ? this.success()
        : this.error({
            error: true,
            success: false,
            details: errors
        })
}

function priceWhere (service) {
    var where = {
        type: 'price',
        name: service.name
    }
    
    if ( service.name == 'Доставка' )
        where.idLocality = service.idLocality
    else where.id = service.id

    return where
}

// Left services
async function setLeft (req) {
    console.log('Incoming service left set request')
    var data = getData(req.body)
    var errors = []

    for ( let service of data ) {
        let where = leftWhere(service)
        let error = await set.call(this, where, service)

        if ( error !== true )
            errors.push(error)
    }

    return errors.length === 0
        ? this.success()
        : this.error({
            error: true,
            success: false,
            details: errors
        })
}

function leftWhere (service) {
    return {
        type: 'left',
        id: service.id,
        name: service.name
    }
}

// Setter
function set (where, service) {
    var data = { $set: service }

    return new Promise(resolve => {
        this.db.service.updateOne(where, data, {upsert: true}, error => {
            if ( !error ) {
                resolve(true)
                console.log('Writted service', service)
            }
            
            else resolve({
                message: `Databse error: Can\'t update service ${ JSON.stringify(where) }`,
                details: JSON.stringify(error)
            })
        })
    })
}

function list (req) {
    console.log('Incoming service list request')
    var type = req.query.type

    if ( !type )
        return this.error({
            error: true,
            success: false,
            message: 'type param is required!'
        })

    else this.db.service.find(req.query).toArray((error, array) => {
        if ( !error )
            this.success(array)

        else this.error({
            error: true,
            success: false,
            message: 'Databse error',
            details: error
        })
    })
}

function getData (body) {
    return body.many === true
        ? body.list : [body]
}

/*
function setPrices (req) {
    console.log('Incoming service prices set request')
    var json = getData(req.body)
    var type = 'price'

    set.call(this, type, json)
}

function setLeft (req) {
    console.log('Incoming lefts service set request')
    var json = getData(req.body)
    var type = 'lefts'

    set.call(this, type, json)
}

function set (type, list) {
    console.log('Incoming service set request')
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

function removeLefts () {
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
}*/