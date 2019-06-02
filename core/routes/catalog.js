const addRequires = ['id', 'name', 'parentId']

module.exports = {
    post: { add, edit, remove },
    get: { list }
}

async function add (req) {
    console.log('Adding catalog')
    var list = getList(req.body)

    for (let i = 0; i != list.length; ++i) {
        let catalog = list[i]
        let check = await checkRequires(catalog, ...addRequires)
        check = await existCatalog(this.db.catalog, catalog, check)
        check = await addCatalog(this.db.catalog, catalog, check)

        if (check !== true) {
            console.log('Error: ', check)
            return this.error(check)
        }
    }

    return this.success()
}

async function edit (req) {
    console.log('Editing catalog')
    var list = getList(req.body)

    for (let i = 0; i != list.length; ++i) {
        let catalog = list[i]
        let check = await checkRequires(catalog, 'id')
        check = await existCatalog(this.db.catalog, catalog, check)
        check = await editCatalog(this.db.catalog, catalog, check)

        if (check !== true) {
            console.log('Error: ', check)
            return this.error(check)
        }
    }

    return this.success()
}

async function remove (req) {
    console.log('Removing catalog')
    var list = getList(req.body)

    for (let i = 0; i != list.length; ++i) {
        let catalog = list[i]
        let check = await checkRequires(catalog, 'id')
        check = await removeCatalog(this.db.catalog, catalog, check)

        if (check !== true) {
            console.log('Error: ', check)
            return this.error(check)
        }
    }

    return this.success()
}

function list (req, res) {
    var self = this
    var where = req.query

    this.db.catalog.find(where).toArray(function (error, result) {
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

function checkRequires (catalog, ...requires) {
    return iPromise(true, function (resolve) {
        for(let r = 0; r != requires.length; ++r) {
            if ( catalog[ requires[r]] === undefined )
                return resolve({
                    error: true,
                    message: `Didn't recieve required param`,
                    details: `Property ${requires[r]} not found in data ${ JSON.stringify(catalog) }`
                })
        }

        return resolve(true)
    })
}

function existCatalog (db, catalog, check) {
    return iPromise(check, function (resolve) {
        var where = { id: catalog.id }
        
        console.log(where)

        db.findOne(where, dbHandler(resolve, function (result) {
            if (result === null)
                return resolve(false)
            else return resolve(true)
        }))
    })
}

function addCatalog (db, catalog, check) {
    return iPromise(check, function (resolve) {
        if (check === true)
            return resolve({
                error: true,
                message: `Catalog with id ${catalog.id} already exists`
            })

        else db.insertOne(catalog, dbHandler(resolve, function () {
            console.log(`Added catalog ${catalog.id} with name ${catalog.name}`)
            resolve(true)
        }))
    })
}

function editCatalog (db, catalog, check) {
    return iPromise(check, function (resolve) {
        if (check === false)
            return resolve({
                error: true,
                message: `Catalog with id ${catalog.id} not exists`
            })

        else {
            let where = { id: catalog.id }
            let set = { $set: catalog }

            db.updateOne(where, set, dbHandler(resolve, function () {
                console.log(`Edited catalog ${catalog.id}`)
                resolve(true)
            }))
        }
    })
}

function removeCatalog (db, catalog, check) {
    return iPromise(check, function (resolve) {
        let where = { id: catalog.id }
        db.deleteOne(where, dbHandler(resolve, function (result) {
            console.log(`Removed catalog ${catalog.id}`)
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