/*Custom Dependencies*/
import createMessage from './createMessage.js';

/**
 * @brief function for the editor component to determine a connection to the server
 * @returns a promise that resolves to the socket connection
 */
export async function determineClientServer() {

    /*Initialize promise*/
    return new Promise((resolve, reject) => {
        /*Get the instance path from the URL*/
        let instance = window.location.href.match(/.*:\d+\/(.*)$/)[1];
        
        /*Connect to the host server, see if the instance exists*/
        const socket = new WebSocket('ws://localhost:3000/');
        socket.onopen = function(event) {
            /*On connection, get the specific port number needed*/
            socket.send(createMessage('getPortNumber', null, instance, undefined));
        }

        /*Check when the socket has recieved a message*/
        socket.onmessage = function(message) {
            let mes = JSON.parse(message.data);

            /*If the server is sending over a port number*/
            if (mes.type === 'sendPortNumber') {
                let portnum = mes.data;

                /*connect to the server with the specific port number and instance*/
                const retSocket = new WebSocket('ws://localhost:' + portnum + '/' + instance);

                /*On successful connection, resolve promise with the new socket*/
                retSocket.onopen = function(event) {
                    console.log("Connected to Server");
                    socket.close();
                    resolve(retSocket);
                }
                retSocket.onerror = function(event) {
                    reject(event);
                }
            }
        }
        socket.onerror = function(event) {
            reject(event);
        }
    });
}

/**
 * @brief function to determine client side on lander site
 * @param {String} instancePath specific instance path to connect to
 * @param {Boolean} create create a new server instance
 * @returns promise that resolves to a boolean value if the server instance
 */
export async function initializeClientSide(instancePath, create) {
    
    /*Initialize promise*/
    return new Promise((resolve, reject) => {

        /*Connect to the host server*/
        const socket = new WebSocket('ws://localhost:3000/');
        socket.onopen = function(event) {
            console.log("Connected to Server");

            /*Ask server if the instance exists*/
            if (!create && instancePath !== undefined) {
                socket.send(createMessage('checkServer', null, instancePath, undefined));
            }

            /*Ask server to create a new server instance*/
            else if (create){
                socket.send(createMessage('createServer', null, null, undefined));
            }
        }
        
        /*Check when the socket has recieved a message*/
        socket.onmessage = function(message) {
            let mes = JSON.parse(message.data);

            /*If the server created a new server*/
            if (mes.type === 'connectedServerID') {
                /*Change url to the specific server URL*/
                window.location.href = mes.data;
            }
            /*If the server sent data regarding a valid server*/
            if (mes.type === 'validServerInstance') {

                /*If the server is valid, resolve the promise*/
                if (mes.data === true) {
                    resolve(true);
                }

                /*If the server is not valid, resolve the promise to false*/
                else {
                    console.log("Not a valid server instance");
                    try {
                        document.getElementById('inputTxt').classList.add("invalid");
                        resolve(false);
                    }
                    catch (e) {
                        resolve(false);
                    }
                }
            }
        }
        socket.onerror = function(event) {
            reject(event);
        }
    });
}