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

let _nonce = 1
let _runTime = Date.now()

const _runIdentifier = function() {
    return (_nonce++) + '_' + _runTime
}

const sleep = function(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

const queryOpenSeaApi = async function(rid, run, endpoint, keepRaw = false, params) {
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
        let filename = rid + '_' + run + '_opensea_' + endpoint.replace(/\//g, '_') + '.data'
        let filepath = RAW_DATA_PATH + filename
        let buffer = ''
        responseObj.orders.forEach(order => {
            buffer += JSON.stringify(order) + '\r\n'
        })
        await writeFile(filepath, buffer)
    }

    return responseObj
}

const collectOpenSeaOrders = async function(rid) {
    let page = 0
    let limit = 50
    const lastPage = 500

    for (let i = page; i < lastPage; i++) {
        await sleep(1000)
        let offset = limit * i
        let response = await queryOpenSeaApi(rid, i, '/orders', true, {
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
        } else {
            console.log(i + ': end of orders')
            break
        }
    } 
}

const runTasks = async function() {
    let rid = _runIdentifier()
    return await collectOpenSeaOrders(rid)
}

runTasks().then(responseObj => {
    // console.log(responseObj.orders[35])
}).catch(error => {
    console.log(error)
})