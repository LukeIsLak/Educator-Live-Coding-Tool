const WebSocket = require('ws');
const createMessage = require('./createMessage');
const { randomUUID } = require('crypto');
//const createSocketSocketID = require('./database/create');

let cwc = "//Start coding here...";
let sockets = {};
let socketIDs = []

/**
 * @brief the function that creates the server through node.js and handles server requests
 */
function initializePrimaryServer() {
    console.log('Created Server');
    const wss = new WebSocket.Server({ port: 3001 });

    /*create a function to handle when another socket connects to the server */
    wss.on('connection', function connection(ws) {
        const socketID = randomUUID();
        sockets.id = ws;
        //createSocketSocketID(ws, socketID);
        console.log(socketID);
        console.log("Client connected");
        ws.send(createMessage('initialize', undefined, cwc, socketID));
        
        ws.on('message', function incoming(message, other) {
            console.log('Received: %s', message);
            message = JSON.parse(message);
            if (message.type === 'updateCWC' || message.type === 'updateCWC--force') {
                updateCurrentWorkingCode(message.type, message.data, wss, message.sock);
            }

            else if (message.type === 'requestInstances') {
                socketIDs.forEach(sockID => {
                    if (sockets[sockID] !== ws) {
                        sockets[sockID].send(createMessage('serverRequestingInstance', wss, message.data, undefined));
                    }
                });
            }
            else if (message.type === "clientSendingInstance") {
                //Improve later
                socketIDs.every(sockID => {
                    if (sockID === message.options[0]) {
                        sockets[sockID].send(createMessage('serverSendingInstance', ws, message.data, message.options[1]));
                        return false;
                    }

                    return true;
                }); 
            }

        });

        /*Handle when a socket disconnects from the server */
        ws.on('close', function() {
            console.log('Client disconnected');
        })
    });
}

/**
 * @brief the function communicates with each socket connected that the server ancestor has been updated
 * @param {string} type string to denote the function of the message being sent
 * @param {string} message the message to update each socket with
 * @param {WebSocket.Server} wss the server socket; contains all instances of each connected socket
 * @param {socket} ws the socket that initialized the updated the server
 */
function updateCurrentWorkingCode(type, message, wss, ws) {
    cwc = message;
    console.log(wss.clients.size);
    wss.clients.forEach(client => {
        if (client !== ws) {
            client.send(createMessage(type, undefined, cwc, undefined));
        }
    });
}

//createClientSideServer();

/*Initialization for node.js */
initializePrimaryServer();