/*Library Dependencies*/
import * as React from 'react';
import Editor from '@monaco-editor/react';

/*Custom Dependencies*/
import createMessage from './createMessage.js'
import * as client from './connectToServer.js'
//import handleMerge from './client/handleMerge.js'

/*Global variables*/
let socket;
let socketInstance = {
    "id":null,
    "editor": null,
    "role":"teacher",
    "status":"ready",
    "socket":null,
    "previousInstance":"",
    "update":true
}

/**
 * @brief the function to create the LiveCodeEditor hook for the Live Coding Editor Tool
 * @returns the React Hook that contains the Editor Instance
 */
function LiveCodeEditor () {
    /*Default values*/
    const startCode = "// Start Coding Here..."
    const startLanugage = "javascript"
    const [code, setCode] = React.useState(startCode);
    const [language, setLanguage] = React.useState(startLanugage);
    const editorRef = React.useRef(null);

    /**
     * @brief handles is the editor has mounted to the webpage
     * @param {*} editor the specific monaco editor instance
     */
    async function handleEditorDidMount(editor) {
        editorRef.current = editor;
        socketInstance.editor = editor;
        socketInstance.previousInstance = editor.getValue();
        /*If the socket to the server has not been initialized, connect to and initialize it*/
        if (!socket) {

            /*Wait to connect to the socket*/
            socket = await client.determineClientServer();
            socketInstance.socket = socket;
            socketInstance.socket.onmessage = function(event) {
                const message = JSON.parse(event.data);
                console.log(socket);
                console.log(message.type)
                /*If the socket has connected to the server halfway through, initialize it to the beginning*/
                if (message.type === 'initialize') {
                    console.log('Initialize Initial State');
                    console.log(message)
                    socketInstance.id = message.options;
                    editor.setValue(message.data);
                    console.log('Instance: %s, connected to the server!', socketInstance.id);
                }

                /*If the editor has been updated*/
                if (message.type === "updateCWC") {
                    console.log("Updating Editor")
                    socketInstance.status = "busy";
                    const position = editor.getPosition();
                    const scrollTop = editor.getScrollTop();
                    const scrollLeft = editor.getScrollLeft();
                    socketInstance.previousInstance = editor.getValue();
                    editor.setValue(message.data);
                    editor.setPosition(position);
                    editor.setScrollTop(scrollTop);
                    editor.setScrollLeft(scrollLeft);
                    socketInstance.status = "ready";
                }
                /*If the editor has been forcefully updated*/
                if (message.type === "updateCWC--force") {
                    console.log("Processing Merge");
                    socketInstance.status = "busy";
                    const position = editor.getPosition();
                    const scrollTop = editor.getScrollTop();
                    const scrollLeft = editor.getScrollLeft();
                    socketInstance.previousInstance = editor.getValue();
                    //handleMerge(socketInstance.previousInstance, message.data);
                    editor.setValue(message.data);
                    editor.setPosition(position);
                    editor.setScrollTop(scrollTop);
                    editor.setScrollLeft(scrollLeft);
                    socketInstance.status = "ready";
                }
                /*If the editor has been sent instances*/
                if (message.type === "sentInstances") {
                    console.log(message.data)
                }
                /*If the server is requesting for the current instance*/
                if (message.type === "serverRequestingInstance") {
                    console.log("sending instance");
                    socket.send(createMessage('clientSendingInstance', socketInstance.socket, socketInstance.editor.getValue(), [socketInstance.id, message.data]))
                }

                /*If the server is sending the instance*/
                if (message.type === "serverSendingInstance") {
                    console.log(message.options);
                    console.log(message.data);
                }
            }
            console.log("Correctly connected to socket!")
        }
        console.log("Editor mounted successfully");
    }

    /**
     * @brief handles updating the server when the instance gets updated
     * @param {string} value the value of the react component as it gets update 
     */
    function handleEditorChange (value) {
        setCode(value);
        console.log(socketInstance.status)
        /*Push the code if connected to a server and permited to*/
        if (socketInstance.socket && socketInstance.role === "teacher" && socketInstance.status === "ready" && socketInstance.update) {
            console.log("Sending Message");
            socket.send(createMessage('updateCWC', socketInstance.socket, value, undefined));
        }
    }

    /**
     * @brief handles changing the language of the editor
     * @param event event to grab value from
     */
    function handleLanguageChange (event) {
        setLanguage(event.target.value);
    }

    /**
     * @brief handles changin the role of the user
     * @param event event to grab value from 
     */
    function handleRoleChange (event) {
        socketInstance.role = event.target.value;
        console.log(socketInstance.role);
    }

    /**
     * @brief handles pushing code
    */
    function handlePush (event) {
        if (socketInstance.role === "teacher") {
            console.log("Forcing Push");
            socket.send(createMessage('updateCWC--force', socketInstance.socket, socketInstance.editor.getValue(), undefined));
        }
    }
    /**
     * @brief handles updating the push settings 
     */
    function handlePushSettings (event) {
        socketInstance.update = (event.target.value !== "no-push");
        console.log(socketInstance.update);
    }

    /**
     * @brief handles requesting instances
     */
    function selectOptions() {
        //console.log(socket);
        //console.log(createMessage('requestInstances', socketInstance.socket, "socketInstance", undefined));
        socket.send(createMessage('requestInstances', socketInstance.socket, socketInstance.id, undefined));
    }

    /*React Hook component*/
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
            <select
                onChange={handleRoleChange}
            >
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
            </select>
            <select
                onChange={handlePushSettings}
            >
                <option value="push">Push</option>
                <option value="no-push">No Push</option>
            </select>
            <button 
                type="button"
                onClick={handlePush}
            >
                Push Code
            </button>
            <button 
                type="button"
                onClick={selectOptions}
            >
                Get Instances
            </button>
            
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