module.exports = {
    post: { set, remove, list },
    get: { list }
}

async function set (req, res) {
    var self = this
    var result = await eachWarehouse(req.body, async function (warehouse) {
        let update = await setWarehouse(warehouse, self.db.warehouse)
        return update
    })

    return setStatus(result, res, this.success)
}

async function remove (req, res) {
    var self = this
    var result = await eachWarehouse(req.body, async function (warehouse) {
        let remove = await removeWarehouse(warehouse, self.db.warehouse)
        return remove
    })

    return setStatus(result, res, this.success)
}

function list (req, res) {
    this.db.warehouse.find({}).toArray(function (error, result) {
        if (error === null) {
            res.send( JSON.stringify(result) )
            res.end()
        }

        else setStatus ({
            error: true,
            message: `Database error: Can't get warehouses list`,
            details: JSON.stringify(warehouse)
        }, res)
    })
}

async function eachWarehouse (body, handler) {
    return new Promise(async function (resolve) {
        let list = body.many === undefined
            ? [ body ] : body.list

        let each = await runEach(list, handler)
        resolve(each)
    })
}

function runEach (list, handler) {
    return new Promise(async function (resolve) {
        for (let s = 0; s != list.length; ++s) {
            let warehouse = list[s]
            let result = await checkResult(warehouse, handler)

            if (result !== true)
                return resolve(result)
        }

        return resolve(true)
    })
}

function checkResult (warehouse, handler) {
    return new Promise(async function (resolve) {
        let check = checkWarehouse(warehouse)

        if (check === true) {
            let result = await handler(warehouse)
            resolve(result)
        }
    
        else resolve(check)
    })
}

function setStatus (result, res, success) {
    if (result === true)
        return success()
    
    else {
        res.status(400)
        res.send( JSON.stringify(result) )

        return res.end()
    }
}

function checkWarehouse (warehouse) {
        return warehouse.id === undefined
        ? {
            error: true,
            message: 'ID is not defined',
            details: `Not found warehouse ID in data ${ JSON.stringify(warehouse) }`
        } : true
}

function setWarehouse (warehouse, db) {
    var where = { id: warehouse.id }
    var set = { $set: warehouse }

    return new Promise(function (resolve) {
        db.updateOne(
            where, set, {upsert: true},
            dbHandler(resolve, `Can\'t update warehouse by ID ${warehouse.id}`)
        )
    })
}

function removeWarehouse (warehouse, db) {
    return new Promise(function (resolve) {
        db.deleteOne(
            {id: warehouse.id},
            dbHandler(resolve, `Can\'t delete warehouse by ID ${warehouse.id}`)
        )
    })
}

function dbHandler (resolve, errorText) {
    return function (error) {
        if (error) return resolve({
            error: true,
            message: `Database error: ${errorText}`,
            details: JSON.stringify(error)
        })

        else resolve(true)
    }
}