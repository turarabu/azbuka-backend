const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const colors = require('colors');

const config = require('./config');
const routes = require('./core/routes');
const database = require('./core/database');
const fileParser = require('./core/file-parser')

const app = express();
const DB = database.init(config.database, MongoClient);

global.config = config

app.use( fileParser );
app.use( express.json({ limit: '100mb' }) );
app.use( express.urlencoded({ extended: true, limit: '100mb' }) );

app.listen(config.server.port, async function () {
    var db = await DB.catch(process.exit);
    var router = routes.init(express, db);

    app.use(router);

    console.log( colors.green(`Сервер запущен на порту ${config.server.port}`) );
});