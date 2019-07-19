module.exports = {
    post: { set, remove },
    get: { list }
}

async function set (req, res) {
    var self = this
    var result = await eachCity(req.body, async function (city) {
        let update = await setCity(city, self.db.city)
        return update
    })

    return setStatus(result, res, this.success)
}

async function remove (req, res) {
    var self = this
    var result = await eachCity(req.body, async function (city) {
        let remove = await removeCity(city, self.db.city)
        return remove
    })

    return setStatus(result, res, this.success)
}

function list (req, res) {
    this.db.city.find(req.query).toArray((error, result) => {
        if (error === null)
            this.success(result)

        else setStatus ({
            error: true,
            message: `Database error: Can't get cities list`,
            details: JSON.stringify(city)
        }, res)
    })
}

async function eachCity (body, handler) {
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
            let city = list[s]
            let result = await checkResult(city, handler)

            if (result !== true)
                return resolve(result)
        }

        return resolve(true)
    })
}

function checkResult (city, handler) {
    return new Promise(async function (resolve) {
        let check = checkCity(city)

        if (check === true) {
            let result = await handler(city)
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

function checkCity (city) {
        return city.id === undefined
        ? {
            error: true,
            message: 'ID is not defined',
            details: `Not found city ID in data ${ JSON.stringify(city) }`
        } : true
}

function setCity (city, db) {
    var where = { id: city.id }
    var set = { $set: city }

    return new Promise(function (resolve) {
        db.updateOne(
            where, set, {upsert: true},
            dbHandler(resolve, `Can\'t update city by ID ${city.id}`)
        )
    })
}

function removeCity (city, db) {
    return new Promise(function (resolve) {
        db.deleteOne(
            {id: city.id},
            dbHandler(resolve, `Can\'t delete city by ID ${city.id}`)
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