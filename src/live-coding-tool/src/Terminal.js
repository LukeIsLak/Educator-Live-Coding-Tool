/*Library Dependencies*/
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Terminal } from 'xterm';
import "xterm/css/xterm.css";
import './LiveEditor.css'

const terminalIntro =
[
'===================================================================================\r\n\n\r',
'Welcome to the Console!\r\n\n\r\t',
'You are currently using the xterm.js console, followed by the Monaco Editor\r\n\n\r\t',
'Any output from the code in the editor will be displayed here.\r\n\n\r',
'NOTE: The presenters output will not show here\r\n\n\r',
'==================================================================================='
];
const indent = "  ";

const EmbTerminal = forwardRef(function EmbTerminal({height, width, className}, ref) {
    const terminalRef = useRef(null);
    const term = useRef(null);

    useEffect(() => {
        if (terminalRef.current && !term.current) {

            const fontSize = 12;
            const containerHeight = window.innerHeight;
            const containerWidth = window.innerWidth / 2;
            const fontHeight = fontSize * 1.4;
            const fontWidth = 8;
            const rows = Math.floor(containerHeight / fontHeight);
            const cols = Math.floor(containerWidth / fontWidth);

            term.current = new Terminal({
                rows: rows,
                cols: cols,
                fontSize: 12,
                cursorBlink: true,
                theme: {
                    background: "#1e1e1e",
                    foreground: "#000000",
                },
                
                width: "50%"
            });

            term.current.open(terminalRef.current);
            term.current?.write(indent + "\r\n");
            terminalIntro.forEach(line => {
                term.current.write(indent + line);
            });
            term.current?.write("\r\n" + indent + ">> ");
            

            term.current.onData((input) => {
                if (input === "\r") {
                    term.current?.write("\r\n" + indent + ">> ");
                }
                else {
                    term.current?.write(input);
                }
            });
        }

    return () => {
        term.current?.dispose();
        term.current = null;
    };
    }, []);

    useImperativeHandle(ref, () => ({
        writeToTerminal: (text) => {
            let out = text.split('\n').join(indent + '\n');
            if (term.current) {
                term.current.write("\r\n" + indent + out + "\r\n" + indent + ">> ");
            }
        }
    }));

    return <div ref={terminalRef} className="EmbTerminal"></div>;
});

export default EmbTerminal;