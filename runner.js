const Bree = require('bree');

const bree = new Bree({
    // logger: new Cabin(),
    jobs: [
        {
            name: 'opensea_orders',
            interval: '1m',
            timeout: 0
        }
    ]
})

bree.start()