import WebSocket from 'ws';
import createMessage from './createMessage.js';

const defaultPort = 3000;
let servers = {};
let servernum = 1;
let serverInstances = [];

/**
 * @brief generates a random UUID specific for this project
 * @returns the generated UUID
 */
function generateUUID() {
    let startString = "xxxx-xxxx".replace(/[xy]/g, c => {
        let num = Math.random() * 36 | 0;
        return String.fromCharCode((c === 'x' ? (Math.floor(num / 26) == 1) ? 48 + num-26 | 0 : 97 + num | 0: c)).toUpperCase();
    });
    return startString;
}

/**
 * @brief determines if a server instance is a real instance
 * @param instancePath instance to check
 * @returns a boolean value representing if a instance is in the serverInstances array
 */
export function validServerInstance(instancePath) {
    return serverInstances.includes(instancePath) 
}

/**
 * @brief creates a new server, initializes it and returns the server instance id
 */
export function createPrimaryServer() {
    const serverID = generateUUID();
    serverInstances.push(serverID);
    

    const socket = initializePrimaryServer(serverID);
    let cwc = "//Start coding here";

    /*Create the server object*/
    servers[serverID] = {
        "id":serverID,
        "serverSocket":socket,
        "connectedSockets":{},
        "socketIDs":[],
        "cwc":cwc,
        "servernum":defaultPort+servernum
    };
    servernum++;
    return serverID;

}

/**
 * @brief the function that creates the server through node.js and handles server requests
 * @returns the socket created
 */
export function initializePrimaryServer(serverID) {
    console.log('Created Server');
    const wss = new WebSocket.Server({
        port:defaultPort+servernum,
        path:'/' + serverID
    });
    let index = serverInstances.at(serverID);

    /*create a function to handle when another socket connects to the server */
    wss.on('connection', function connection(ws) {
        const socketID = generateUUID();
        servers[serverID].connectedSockets[socketID] = ws;
        servers[serverID].socketIDs.push(socketID);
        console.log("Client connected: " + socketID);
        ws.send(createMessage('initialize', undefined, servers[serverID].cwc, socketID));
        
        /*When the socket recieves a message*/
        ws.on('message', function incoming(message, other) {
            console.log('Received: %s', message);
            message = JSON.parse(message);

            /*If a socket wishes to update the current working code */
            if (message.type === 'updateCWC' || message.type === 'updateCWC--force') {
                updateCurrentWorkingCode(message.type, message.data, wss, message.sock, serverID);
            }

            /*If a socket wishes to recieve all other instances, and all other instance values */
            else if (message.type === 'requestInstances') {
                console.log("requestInstances");
                servers[index].socketIDs.forEach(sockID => {
                    if (sockID !== message.data) {
                        servers[index].connectedSockets[sockID].send(createMessage('serverRequestingInstance', wss, message.data, undefined));
                    }
                });
            }

            /*If another socket wishes to send data to another socket requesting its instance */
            else if (message.type === "clientSendingInstance") {
                //Improve later
                console.log("clientSendingInstance");
                servers[index].socketIDs.every(sockID => {
                    if (sockID === message.options[1]) {
                        console.log("found correct sock");
                        servers[index].connectedSockets[sockID].send(createMessage('serverSendingInstance', ws, message.data, message.options[0]));
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

    return wss;
}

/**
 * @brief the function communicates with each socket connected that the server ancestor has been updated
 * @param {string} type string to denote the function of the message being sent
 * @param {string} message the message to update each socket with
 * @param {WebSocket.Server} wss the server socket; contains all instances of each connected socket
 * @param {socket} ws the socket that initialized the updated the server
 */
function updateCurrentWorkingCode(type, message, wss, ws, serverID) {
    servers[serverID].cwc = message;
    console.log(wss.clients.size);
    wss.clients.forEach(client => {
        if (client !== ws) {
            client.send(createMessage(type, undefined, servers[serverID].cwc, undefined));
        }
    });
}

/**
 * @brief creates a host server that will handle all initial server requests
 * @returns the socket that represents it
 */
function createHostServer() {
    console.log('Created Host Server');
    const wss = new WebSocket.Server({ port: defaultPort});
    servernum++;

    /*create a function to handle when another socket connects to the server */
    wss.on('connection', function connection(ws) {
        /*Should really check in case there's a double*/
        const socketID = generateUUID();
        console.log("Client connected to host server: " + socketID);
        
        ws.on('message', function incoming(message, other) {
            console.log('Host Server Received: %s', message);
            message = JSON.parse(message);

            /*Create a new server*/
            if (message.type === 'createServer') {
                ws.send(createMessage('connectedServerID', null, createPrimaryServer(), undefined));
            }
            /*Check to see if a server exists or not*/
            if (message.type === 'checkServer') {
                ws.send(createMessage('validServerInstance', null, validServerInstance(message.data), undefined));
            }
            /*Client asking for port number of a specific instance*/
            if (message.type === 'getPortNumber') {
                ws.send(createMessage('sendPortNumber', null, servers[message.data].servernum, undefined));
            }

        });

        /*Handle when a socket disconnects from the server */
        ws.on('close', function() {
            console.log('Client disconnected from host server');
        })
    });

    return wss;
}

/*Initialization for node.js */
createHostServer();