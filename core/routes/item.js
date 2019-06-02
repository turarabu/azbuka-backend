const addRequires = ['id', 'parentId', 'name', 'headImage', 'buildable', 'manufacturer']

module.exports = {
    post: { add, edit, remove },
    get: { list }
}

async function add (req) {
    console.log('Adding item')
    var list = getList(req.body)

    for (let i = 0; i != list.length; ++i) {
        let item = list[i]
        let check = await checkRequires(item, ...addRequires)
        check = await existItem(this.db.item, item, check)
        check = await addItem(this.db.item, item, check)

        if (check !== true) {
            console.log('Error: ', check)
            return this.error(check)
        }
    }

    return this.success()
}

async function edit (req) {
    console.log('Editing item')
    var list = getList(req.body)

    for (let i = 0; i != list.length; ++i) {
        let item = list[i]
        let check = await checkRequires(item, 'id')
        check = await existItem(this.db.item, item, check)
        check = await editItem(this.db.item, item, check)

        if (check !== true) {
            console.log('Error: ', check)
            return this.error(check)
        }
    }

    return this.success()
}

async function remove (req) {
    console.log('Removing item')
    var list = getList(req.body)

    for (let i = 0; i != list.length; ++i) {
        let item = list[i]
        let check = await checkRequires(item, 'id')
        check = await removeItem(this.db.item, item, check)

        if (check !== true) {
            console.log('Error: ', check)
            return this.error(check)
        }
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
        
        console.log(where)

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
            console.log('Added item with id ', item.id)
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
                console.log('Edited item with id ', item.id)
                resolve(true)
            }))
        }
    })
}

function removeItem (db, item, check) {
    return iPromise(check, function (resolve) {
        let where = { id: item.id }
        db.deleteOne(where, dbHandler(resolve, function (result) {
            console.log('Removed item with id ', item.id)
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