let Task = function (config) {
    const bent = require('bent')
    const getJSON = bent('json')
    const getBuffer = bent('buffer')
    const mysql = require('mysql')
    const fs = require('fs')
    const util = require('util')
    const writeFile = util.promisify(fs.writeFile)

    let _CONFIG = config
    let _NONCE = 0
    let _CYCLE = 0
    let _RUN_TIME = Date.now()

    const _runIdentifier = function() {
        return (_NONCE++) + '_' + _RUN_TIME
    }
    
    const _sleep = function(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    }

    const _apiUrl = function() {
        let apiUrl = _CONFIG.API_URL + _CONFIG.END_POINT
        if (_CONFIG.QUERY) {
            let paramsArr = []
            for (key in _CONFIG.QUERY) {
                paramsArr.push([key, _CONFIG.QUERY[key]].join('='))
            }
            apiUrl += '?' + paramsArr.join('&') + '&api_key=' + _CONFIG.API_KEY
        }
        return apiUrl
    }

    const _query = async function(keepRaw = true) {
        let apiUrl = _apiUrl()
        let responseObj = await getJSON(apiUrl)

        if (keepRaw) {
            let filename = _runIdentifier() + '_' + _CYCLE + '_' + _CONFIG.FILE_KEY + '_' + _CONFIG.END_POINT.replace(/\//g, '_') + '.data'
            let filepath = _CONFIG.RAW_DATA_PATH + filename
            let buffer = ''
            responseObj.forEach(order => {
                buffer += JSON.stringify(order) + '\r\n'
            })
            await writeFile(filepath, buffer)
        }

        return responseObj
    }

    return {
        getConfig: function () {
            return _CONFIG
        },
        setConfig: function (config) {
            for (key in config) {
                _CONFIG[key] = config[key]
            }
        },
        collect: async function(rid) {
            return await _query()
        }
    }
}

module.exports = Task