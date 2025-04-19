import os from 'os';
import createHostServer from './server.js';
import { exec } from 'child_process';


export default function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) { // NOTE: was wrong in your code
                return iface.address;
            }
        }
    }
    return '0.0.0.0';
}

const localIP = getLocalIP();
const port = 3000;

console.log(`
========================================================
    Live Code Editor Server
========================================================
Server is running on the local network at:
    
    http://${localIP}:${port}
    
Other devices on the same network can connect using 
this address in their web browser.

To stop the server, press Ctrl+C
========================================================
`);

if (process.platform === 'win32') {
    exec(`start http://${localIP}:${port}`);
} else if (process.platform === 'darwin') {
    exec(`open http://${localIP}:${port}`);
} else {
    exec(`xdg-open http://${localIP}:${port}`);
}

createHostServer();
