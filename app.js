const GLASSNODE_API_URL = 'https://api.glassnode.com/v1'
const GLASSNODE_API_KEY = '1tG7KaW0esEgOyhYcBwTGP2JUZ2'
const OPENSEA_API_URL = 'https://api.opensea.io/wyvern/v1'
const RAW_DATA_PATH = './_raw/'

const bent = require('bent')
const getJSON = bent('json')
const getBuffer = bent('buffer')
const mysql = require('mysql')
const fs = require('fs')
const util = require('util')
const writeFile = util.promisify(fs.writeFile)

let connectionPool;

const createTcpPool = async config => {
    // Extract host and port from socket address
    const dbSocketAddr = ['127.0.0.1', '3306'] //process.env.DB_HOST.split(':'); google => ['35.242.223.87', '3306']

    // Establish a connection to the database
    return await mysql.createPool({
        user: 'opensea', // e.g. 'my-db-user'
        password: '12345678', // e.g. 'my-db-password'
        database: 'nft_opensea', //process.env.DB_NAME, // e.g. 'my-database'
        host: dbSocketAddr[0], // e.g. '127.0.0.1'
        port: dbSocketAddr[1], // e.g. '3306'
        // ... Specify additional properties here.npm
        connectionLimit: 10, //   ...config,
    });
}

const getGlassnodeApiUrl = function(endpoint) {
    return GLASSNODE_API_URL + endpoint + '?api_key=' + GLASSNODE_API_KEY
}

const queryGlassnodeApi = async function(endpoint, keepRaw = false) {
    let apiUrl = getGlassnodeApiUrl(endpoint)
    let responseObj = await getJSON(apiUrl)

    if (keepRaw) {
        let filename = 'glassnode-' + endpoint.replace(/\//g, '_') + '_' + Date.now() + '.txt'
        let filepath = RAW_DATA_PATH + filename
        await writeFile(filepath, JSON.stringify(responseObj))
    }

    return responseObj
}

const queryOpenSeaApi = async function(endpoint, keepRaw = false, params) {
    let apiUrl = OPENSEA_API_URL + endpoint
    if (params) {
        let paramsArr = []
        for (key in params) {
            paramsArr.push([key, params[key]].join('='))
        }
        apiUrl += '?' + paramsArr.join('&')
    }
    
    let responseObj = await getJSON(apiUrl)

    if (keepRaw) {
        let filename = 'opensea-' + endpoint.replace(/\//g, '_') + '_' + Date.now() + '.data'
        let filepath = RAW_DATA_PATH + filename
        let buffer = ''
        responseObj.orders.forEach(order => {
            buffer += JSON.stringify(order) + '\r\n'
        })
        await writeFile(filepath, buffer)
    }

    return responseObj
}

const generateInsertOrderSql = function(order) {
    let values = [order.id, `'${order.maker.address}'`, `'${order.taker.address}'`, order.current_price, order.side, order.sale_kind, `'${order.created_date}'`]
    values.push(order.closing_date ? `'${order.closing_date}'` : 'null')
    values.push(order.expiration_time)
    values.push(order.listing_time)
    let sql = `insert into orders (order_id, maker_address, taker_address, current_price, side, sale_kind, created_date, closing_date, expiration_time, listing_time) values (${values.join(',')})`
    return sql
}

const collectOpenSeaOrders = async function() {
    let page = 0
    let limit = 50
    const lastPage = 1

    for (let i = page; i < lastPage; i++) { 
        let offset = limit * page
        let response = await queryOpenSeaApi('/orders', true, {
            limit: limit, 
            offset: offset,
            bundled: false,
            include_bundled: false,
            include_invalid: false,
            order_by: 'created_date',
            order_direction: 'desc'
        })
    
        if (response.count > 0) {
            let orders = response.orders
            console.log(i + ': ' + orders.length)
            // let records = []
            // orders.forEach(order => {
                // let sql = generateInsertOrderSql(order)
                // console.log(sql)
                // connectionPool.query(sql, function (error) {
                //     if (error) throw error
                //     // console.log(results[0])
                // })
            // })
            
        } else {
            console.log(i + ': end of orders')
        }
    }

    
}

const runTasks = async function() {
    // return await queryGlassnodeApi('/metrics/assets', true)
    connectionPool = await createTcpPool()
    return await collectOpenSeaOrders()
}

runTasks().then(responseObj => {
    // console.log(responseObj.orders[35])
}).catch(error => {
    console.log(error)
})





// createTcpPool().then(pool => {
//     pool.query('select * from assets', function (error, results, fields) {
//     if (error) throw error
//         console.log(results[0])
//     })
// })