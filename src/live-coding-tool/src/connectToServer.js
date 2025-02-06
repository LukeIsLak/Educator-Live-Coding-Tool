//import createClientSideServer from './server';

export function determineClientServer() {
    //let port = window.location.href.match(/.*:(\d+)\/$/)[1];
    return initializeClientSide();
}

function initializeClientSide() {
    console.log('Created Client');
    const socket = new WebSocket('ws://localhost:3001/');
    socket.onopen = function(event) {
        console.log("Connected to server!");
    }

    return socket;
}