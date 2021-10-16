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

const _sleep = function(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
const _apiUrl = function(endpoint, params) {
    let apiUrl = GLASSNODE_API_URL + endpoint
    if (params) {
        let paramsArr = []
        for (key in params) {
            paramsArr.push([key, params[key]].join('='))
        }
        apiUrl += '?' + paramsArr.join('&')
    }
    return apiUrl
}

const query = async function(rid, run, endpoint, keepRaw = false, params) {
    let apiUrl = _apiUrl(endpoint, params)
    let responseObj = await getJSON(apiUrl)

    if (keepRaw) {
        let filename = rid + '_' + run + '_glassnode_' + endpoint.replace(/\//g, '_') + '.data'
        let filepath = RAW_DATA_PATH + filename
        await writeFile(filepath, JSON.stringify(responseObj))
    }

    if (keepRaw) {
        let filename = rid + '_' + run + '_glassnode_' + endpoint.replace(/\//g, '_') + '.data'
        let filepath = RAW_DATA_PATH + filename
        let buffer = ''
        responseObj.forEach(order => {
            buffer += JSON.stringify(order) + '\r\n'
        })
        await writeFile(filepath, buffer)
    }

    return responseObj
}

const collect = async function(rid) {
    let response = await query(rid, 0, '/metrics/addresses/active_count', true, {
        api_key: GLASSNODE_API_KEY,
        a: 'BTC',
        i: '24h',
        f: 'json',
        timestamp_format: 'humanized'
    })
}

const runTasks = async function() {
    let rid = _runIdentifier()
    return await collect(rid)
}

runTasks().then(responseObj => {
    // console.log(responseObj.orders[35])
}).catch(error => {
    console.log(error)
})