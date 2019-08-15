module.exports = {
    post: { set, remove, list },
    get: { list }
}

async function set (req, res) {
    console.log('Incoming stocks set request')
    var self = this
    var result = await eachStock(req.body, async function (stock) {
        let update = await setStock(stock, self.db.stock)
        return update
    })

    return setStatus(result, res, this.success)
}

async function remove (req, res) {
    var self = this
    var result = await eachStock(req.body, async function (stock) {
        let remove = await removeStock(stock, self.db.stock)
        return remove
    })

    return setStatus(result, res, this.success)
}

function list () {
    this.db.stock.find({}).toArray((error, result) => {
        if (error === null)
            this.success(result)

        else this.error({
            error: true,
            message: `Database error: Can't get stocks list`,
            details: JSON.stringify(stock)
        })
    })
}

async function eachStock (body, handler) {
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
            let stock = list[s]
            let result = await checkResult(stock, handler)

            if (result !== true)
                return resolve(result)
        }

        return resolve(true)
    })
}

function checkResult (stock, handler) {
    return new Promise(async function (resolve) {
        let check = checkStock(stock)

        if (check === true) {
            let result = await handler(stock)
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

function checkStock (stock) {
    return stock.id === undefined
        ? {
            error: true,
            message: 'ID is not defined',
            details: `Not found stock ID in data ${ JSON.stringify(stock) }`
        } : true
}

function setStock (stock, db) {
    var where = { id: stock.id }
    var set = { $set: stock }

    return new Promise(function (resolve) {
        db.updateOne(
            where, set, {upsert: true},
            dbHandler(resolve, `Can\'t update stock by ID ${stock.id}`)
        )
    })
}

function removeStock (stock, db) {
    return new Promise(function (resolve) {
        db.deleteOne(
            {id: stock.id},
            dbHandler(resolve, `Can\'t delete stock by ID ${stock.id}`)
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