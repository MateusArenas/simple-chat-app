const apiConfig = require('../config/api.json')

import io from 'socket.io-client'

const socket = io(apiConfig.baseURL, {
    autoConnect: false,
    transportOptions: {
        polling: {
            extraHeaders: { },
        },
    },
});

export default socket