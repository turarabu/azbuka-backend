const colors = require('colors');

module.exports = { init };

function init (config, MongoClient) {
    return new Promise(async function (resolve, reject) {
        const url = `mongodb://${config.host}:${config.port}/`;
        const mongoClient = new MongoClient(url, { useNewUrlParser: true });

        mongoClient.connect(connect(config, resolve, reject));
    });
}

function connect (config, resolve, reject) {
    return function (error, client) {
        if ( error ) {
            console.error(
                '\n', colors.red('Ошибка при подключении к базе данных'),
                '\n', colors.yellow(error),
            '\n');

            return reject(error);
        }

        const database = client.db( config.base );

        return resolve({
            get: database,

            city: database.collection('city'),
            shop: database.collection('shop'),
            warehouse: database.collection('warehouse'),
            service: database.collection('service'),
            item: database.collection('item'),
            catalog: database.collection('catalog'),
        });
    }
}