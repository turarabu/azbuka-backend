const addRequires = ['id', 'parentId', 'name', 'headImage', 'buildable', 'manufacturer']

module.exports = {
    post: { add, edit, remove },
    get: { list }
}

async function add (req) {
    var list = getList(req.body)

    for (let i = 0; i != list.length; ++i) {
        let item = list[i]
        let check = await checkRequires(item, ...addRequires)
        check = await existItem(this.db.item, item, check)
        check = await addItem(this.db.item, item, check)

        if (check !== true)
            return this.error(check)        
    }

    return this.success()
}

async function edit (req) {
    var list = getList(req.body)

    for (let i = 0; i != list.length; ++i) {
        let item = list[i]
        let check = await checkRequires(item, 'id')
        check = await existItem(this.db.item, item, check)
        check = await editItem(this.db.item, item, check)

        if (check !== true)
            return this.error(check)        
    }

    return this.success()
}

async function remove (req) {
    var list = getList(req.body)

    for (let i = 0; i != list.length; ++i) {
        let item = list[i]
        let check = await checkRequires(item, 'id')
        check = await removeItem(this.db.item, item, check)

        if (check !== true)
            return this.error(check)        
    }

    return this.success()
}

function list (req) {

}

function getList (body) {
    return body.many === true
        ? body.list : [body]
}

function checkRequires (item, ...requires) {
    return iPromise(true, function (resolve) {
        for(let r = 0; r != requires.length; ++r) {
            if ( item[ requires[r]] === undefined )
                return resolve({
                    error: true,
                    message: `Didn't recieve required param`,
                    details: `Property ${requires[r]} not found in data ${ JSON.stringify(item) }`
                })
        }

        return resolve(true)
    })
}

function existItem (db, item, check) {
    return iPromise(check, function (resolve) {
        var where = { id: item.id }
        
        db.findOne(where, dbHandler(resolve, function (result) {
            if (result === null)
                return resolve(false)
            else return resolve(true)
        }))
    })
}

function addItem (db, item, check) {
    return iPromise(check, function (resolve) {
        if (check === true)
            return resolve({
                error: true,
                message: `Item with id ${item.id} already exists`
            })

        else db.insertOne(item, dbHandler(resolve, function () {
            resolve(true)
        }))
    })
}

function editItem (db, item, check) {
    return iPromise(check, function (resolve) {
        if (check === false)
            return resolve({
                error: true,
                message: `Item with id ${item.id} not exists`
            })

        else {
            let where = { id: item.id }
            let set = { $set: item }

            db.updateOne(where, set, dbHandler(resolve, function () {
                resolve(true)
            }))
        }
    })
}

function removeItem (db, item, check) {
    return iPromise(check, function (resolve) {
        let where = { id: item.id }
        db.deleteOne(where, dbHandler(resolve, function (result) {
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