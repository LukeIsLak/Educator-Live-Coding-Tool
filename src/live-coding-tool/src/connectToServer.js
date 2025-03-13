import createMessage from './createMessage.js';

export async function determineClientServer() {
    return new Promise((resolve, reject) => {
        console.log("test");
        let instance = window.location.href.match(/.*:\d+\/(.*)$/)[1];
        let retSocket = null;
        const socket = new WebSocket('ws://localhost:3000/');
        socket.onopen = function(event) {
            socket.send(createMessage('getPortNumber', null, instance, undefined));
        }
        socket.onmessage = function(message) {
            let mes = JSON.parse(message.data);
            console.log(mes);
            if (mes.type === 'sendPortNumber') {
                let portnum = mes.data;
                console.log(portnum);
                retSocket = new WebSocket('ws://localhost:' + portnum + '/' + instance);
                retSocket.onopen = function(event) {
                    console.log("Connected to Server");
                    console.log(retSocket);
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

export function initializeClientSide(instancePath, create) {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket('ws://localhost:3000/');
        socket.onopen = function(event) {
            console.log("Connected to Server");
            if (!create && instancePath !== undefined) {
                socket.send(createMessage('checkServer', null, instancePath, undefined));
            }
            else if (create){
                socket.send(createMessage('createServer', null, null, undefined));
            }
        }
        socket.onmessage = function(message) {
            let mes = JSON.parse(message.data);
            console.log(mes);
            if (mes.type === 'connectedServerID') {
                window.location.href = mes.data;
            }
            if (mes.type === 'validServerInstance') {
                if (mes.data === true) {
                    window.location.href = instancePath;
                }
                else {
                    console.log("Not a valid server instance");
                    try {
                        document.getElementById('inputTxt').classList.add("invalid");
                        resolve(true);
                    }
                    catch (e) {
                        resolve(false);
                    }
                }
            }
        }
    });
}