/*
/addresses/count
addresses_active_count
sending_to_exchanges_count
receiving_from_exchanges_count
addresses_non_zero_count
/addresses/min_point_zero_1_count
/addresses/min_point_1_count
/addresses/min_1_count
/market/price_usd_ohlc
/market/price_usd_close
/market/marketcap_usd
/market/price_realized_usd
/market/marketcap_realized_usd
/metrics/supply/current
/supply/current_adjusted
/supply/issued
/supply/inflation_rate
/transactions/transfers_volume_sum
/transactions/transfers_volume_mean
/transactions/transfers_volume_median
*/

let Task = require('./Task.js')

let task = new Task({
    ID: '',
    FILE_KEY: 'glassnode',
    RAW_DATA_PATH: './_raw/',
    API_URL: 'https://api.glassnode.com/v1/metrics',
    API_KEY: '1tG7KaW0esEgOyhYcBwTGP2JUZ2',
    END_POINT: '/supply/issued',
    QUERY: {
        a: 'BTC',
        i: '24h',
        f: 'json',
        timestamp_format: 'humanized'
    }
})

task.collect().then(responseObj => {

}).catch(error => {
    console.log(error)
})