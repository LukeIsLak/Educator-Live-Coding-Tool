/*Library Dependencies*/
import * as React from 'react';
import Editor from '@monaco-editor/react';

/*Custom Dependencies*/
import createMessage from './createMessage.js'
import * as client from './connectToServer.js'

let socket;

/**
 * @brief the function to create the LiveCodeEditor hook for the Live Coding Editor Tool
 * @returns the React Hook that contains the Editor Instance
 */
function LiveCodeEditor () {
    const startCode = "// Start Coding Here..."
    const startLanugage = "javascript"
    const [code, setCode] = React.useState(startCode);
    const [language, setLanguage] = React.useState(startLanugage);

    /**
     * @brief handles is the editor has mounted to the webpage
     * @param {*} editor the specific monaco editor instance
     */
    function handleEditorDidMount(editor) {

        /*If the socket to the server has not been initialized, connect to and initialize it*/
        if (!socket) {
            socket = client.determineClientServer();
            socket.onmessage = function(event) {
                const message = JSON.parse(event.data);

                /*If the socket has connected to the server halfway through, initialize it to the beginning*/
                if (message.type === 'initialize') {
                    console.log('Initialize Initial State');
                    editor.setValue(message.data);
                }
            }
            console.log("Correctly connected to socket!")
        }
        console.log("Editor mounted successfully");
    }

    function handleEditorChange (value) {
        setCode(value);
        if (socket) {
            socket.send(createMessage('updateCWC', socket, value, undefined));
        }
    }

    function handleLanguageChange (event) {
        setLanguage(event.target.value);
    }

    /*HTML React component*/
    return (
        <div style={{ padding: '20px' }}>
            <select
                value={language}
                onChange={handleLanguageChange}
                style={{ marginBottom: '10px' }}
            >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
            </select>
            
            <Editor
                height="500px"
                defaultLanguage={language}
                defaultValue={code}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                loading={<div>Loading editor...</div>}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true
                }}
            />
        </div>
    );
};

export default LiveCodeEditor;