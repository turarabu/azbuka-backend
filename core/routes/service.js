const addRequires = ['id', 'idProduct']

module.exports = {
    post: { add, edit, remove },
    get: { list }
}

async function add (req) {
    console.log('Adding service')
    var list = getList(req.body)

    for (let i = 0; i != list.length; ++i) {
        let service = list[i]
        let check = await checkRequires(service, ...addRequires)
        check = await existService(this.db.service, service, check)
        check = await addService(this.db.service, service, check)

        if (check !== true) {
            console.log('Error: ', check)
            return this.error(check)
        }
    }

    return this.success()
}

async function edit (req) {
    console.log('Editing service')
    var list = getList(req.body)

    for (let i = 0; i != list.length; ++i) {
        let service = list[i]
        let check = await checkRequires(service, 'id')
        check = await existService(this.db.service, service, check)
        check = await editService(this.db.service, service, check)

        if (check !== true) {
            console.log('Error: ', check)
            return this.error(check)
        }
    }

    return this.success()
}

async function remove (req) {
    console.log('Removing service')
    var list = getList(req.body)

    for (let i = 0; i != list.length; ++i) {
        let service = list[i]
        let check = await checkRequires(service, 'id')
        check = await removeService(this.db.service, service, check)

        if (check !== true) {
            console.log('Error: ', check)
            return this.error(check)
        }
    }

    return this.success()
}

function list (req, res) {
    console.log('Getting service by ', req.query)
    var self = this
    var where = req.query

    this.db.service.find(where).toArray(function (error, result) {
        if (error)
            self.error({
                error: true,
                message: `Database error`,
                details: JSON.stringify(error) 
            })

        else {
            res.status(200)
            res.send( JSON.stringify({
                error: false,
                success: true,
                data: result
            }) )

            res.end()
        }
    })
}

function getList (body) {
    return body.many === true
        ? body.list : [body]
}

function checkRequires (service, ...requires) {
    return iPromise(true, function (resolve) {
        for(let r = 0; r != requires.length; ++r) {
            if ( service[ requires[r]] === undefined )
                return resolve({
                    error: true,
                    message: `Didn't recieve required param`,
                    details: `Property ${requires[r]} not found in data ${ JSON.stringify(service) }`
                })
        }

        return resolve(true)
    })
}

function existService (db, service, check) {
    return iPromise(check, function (resolve) {
        var where = { id: service.id }
        
        console.log(where)

        db.findOne(where, dbHandler(resolve, function (result) {
            if (result === null)
                return resolve(false)
            else return resolve(true)
        }))
    })
}

function addService (db, service, check) {
    return iPromise(check, function (resolve) {
        if (check === true)
            return resolve({
                error: true,
                message: `Service with id ${service.id} already exists`
            })

        else db.insertOne(service, dbHandler(resolve, function () {
            console.log(`Added service ${service.id} with name ${service.name}`)
            resolve(true)
        }))
    })
}

function editService (db, service, check) {
    return iPromise(check, function (resolve) {
        if (check === false)
            return resolve({
                error: true,
                message: `Service with id ${service.id} not exists`
            })

        else {
            let where = { id: service.id }
            let set = { $set: service }

            db.updateOne(where, set, dbHandler(resolve, function () {
                console.log(`Edited service ${service.id}`)
                resolve(true)
            }))
        }
    })
}

function removeService (db, service, check) {
    return iPromise(check, function (resolve) {
        let where = { id: service.id }
        db.deleteOne(where, dbHandler(resolve, function (result) {
            console.log(`Removed service ${service.id}`)
            resolve(true)
        }))

    })
}

function iPromise (check, callback) {
    return new Promise(function (resolve, reject) {
        if (check !== true && check !== false)
            return resolve(check)
        else return callback(resolve, reject)
    })
}

function dbHandler (resolve, callback) {
    return function (error, result) {
        if (error)
            resolve({
                error: true,
                message: `Database error`,
                details: JSON.stringify(error) 
            })

        else callback(result)
    }
}