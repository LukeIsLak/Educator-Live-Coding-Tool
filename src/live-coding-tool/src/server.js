let cwc = "wow";

function initializeServer() {  
    console.log('Created Server');
    const WebSocket = require('ws');
    const createMessage = require('./createMessage');
    const wss = new WebSocket.Server({ port: 3001 });

    wss.on('connection', function connection(ws) {
        console.log("Client connected");
        ws.send(createMessage('initialize', undefined, cwc, undefined));
        
        ws.on('message', function incoming(message, other) {
            console.log('Received: %s', message);
            message = JSON.parse(message);
            if (message.type === 'updateCWC') {
                updateCurrentWorkingCode(message.data, wss);
            }
        });

        ws.on('close', function() {
            console.log('Client disconnected');
        })
    });
}

function updateCurrentWorkingCode(message, wss) {
    cwc = message;
    // wss.clients.forEach(client => {
    //     client.send(createMessage('updateCWC', undefined, cwc, undefined));
    // });
}


initializeServer();