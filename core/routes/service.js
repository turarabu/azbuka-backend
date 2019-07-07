module.exports = {
    post: { set, remove, list },
    get: { list }
}

async function set (req, res) {
    var self = this
    var result = await eachService(req.body, async function (service) {
        let update = await setService(service, self.db.service)
        return update
    })

    return setStatus(result, res, this.success)
}

async function remove (req, res) {
    var self = this
    var result = await eachService(req.body, async function (service) {
        let remove = await removeService(service, self.db.service)
        return remove
    })

    return setStatus(result, res, this.success)
}

function list (req, res) {
    this.db.service.find({}).toArray(function (error, result) {
        if (error === null) {
            res.send( JSON.stringify(result) )
            res.end()
        }

        else setStatus ({
            error: true,
            message: `Database error: Can't get services list`,
            details: JSON.stringify(service)
        }, res)
    })
}

async function eachService (body, handler) {
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
            let service = list[s]
            let result = await checkResult(service, handler)

            if (result !== true)
                return resolve(result)
        }

        return resolve(true)
    })
}

function checkResult (service, handler) {
    return new Promise(async function (resolve) {
        let check = checkService(service)

        if (check === true) {
            let result = await handler(service)
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

function checkService (service) {
        return service.id === undefined
        ? {
            error: true,
            message: 'ID is not defined',
            details: `Not found service ID in data ${ JSON.stringify(service) }`
        } : true
}

function setService (service, db) {
    var where = { id: service.id }
    var set = { $set: service }

    return new Promise(function (resolve) {
        db.updateOne(
            where, set, {upsert: true},
            dbHandler(resolve, `Can\'t update service by ID ${service.id}`)
        )
    })
}

function removeService (service, db) {
    return new Promise(function (resolve) {
        db.deleteOne(
            {id: service.id},
            dbHandler(resolve, `Can\'t delete service by ID ${service.id}`)
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