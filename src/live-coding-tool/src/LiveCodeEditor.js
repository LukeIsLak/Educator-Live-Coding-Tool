/*Library Dependencies*/
import React, { useEffect, useState } from 'react';
import './LiveEditor.css'
import Editor from '@monaco-editor/react';
import EmbTerminal from "./Terminal.js"
import initialize_background from "./backgroundEffect.js";

/*Custom Dependencies*/
import createMessage from './createMessage.js'
import * as client from './connectToServer.js'

/*Global variables*/
let socket;
let socketInstance = {
    "id":null,
    "editor": null,
    "role":"teacher",
    "status":"ready",
    "socket":null,
    "previousInstance":"",
    "serverID":null,
    "update":false,
    "tree":null
};

let changeTimer;
let serverChangeSpeed = 300;
let isApplyingServerUpdate = false;
let lastThrottleTime = 0;
let throttleDelay = 500;
let isExecuting = false;

const updateBufferTime = 50;

const accent1 = "#F5EEDD";
const accent2 = "#7AE2CF";
const accent3 = "#196370";
const accent4 = "#06202B";

let lastUpdate;
let instances = [];
let name ='';

/**
 * @brief the function to create the LiveCodeEditor hook for the Live Coding Editor Tool
 * @returns the React Hook that contains the Editor Instance
 */
function LiveCodeEditor () {
    /*Default values*/
    const startCode = "// Start Coding Here..."
    const startLanugage = "javascript"
    const [code, setCode] = useState(startCode);
    const [language, setLanguage] = useState(startLanugage);
    const [pushRequest, setPushRequest] = useState(false);
    const [getInstances, setInstances] = useState(false);
    const editorRef = React.useRef(null);
    const terminalRef = React.useRef(null);

    function handleEditorBeforeMount(monaco) {
        // Define theme before the editor mounts
        monaco.editor.defineTheme('live-editor-theme', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: accent4 },
                { token: 'keyword', foreground: accent2 },
                { token: 'string', foreground: accent1 },
                { token: 'identifier', foreground: accent2 },
                { token: 'number', foreground: accent2 }
            ],
            colors: {
                'editor.background': accent3,
                'editorLineNumber.foreground': '#ffa500',
                'editorCursor.foreground': '#ffa500',
                'editor.selectionBackground': '#ffa500',
                'editor.foreground': '#ffa500'
            }
        });
    }

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
                    socketInstance.id = message.options[0];
                    socketInstance.serverID = message.options[1];
                    if (message.options[2]) socketInstance.role = "teacher";
                    else socketInstance.role = "student";
                    editor.setValue(message.data);
                    console.log('Instance: %s, connected to the server!', socketInstance.id);
                }

                /*If the editor has been updated*/
                if (message.type === "updateCWC") {
                    isApplyingServerUpdate = true;
                    clearTimeout(changeTimer);
                    console.log("Updating Editor")
                    socketInstance.status = "busy";
                    const position = editor.getPosition();
                    const scrollTop = editor.getScrollTop();
                    const scrollLeft = editor.getScrollLeft();
                    socketInstance.previousInstance = editor.getValue();

                    setTimeout(() => {
                        isApplyingServerUpdate = false;
                    }, updateBufferTime);


                    editor.setValue(message.data);
                    editor.setPosition(position);
                    editor.setScrollTop(scrollTop);
                    editor.setScrollLeft(scrollLeft);
                    socketInstance.status = "ready";
                }
                /*If the editor has been forcefully updated*/
                if (message.type === "updateCWC--force" && socketInstance.role === 'student') {
                    lastUpdate = message.data;
                    setPushRequest(true);
                }
                /*If the editor has been sent instances*/
                if (message.type === "sentInstances") {
                    console.log(message.data)
                }
                /*If the server is requesting for the current instance*/
                if (message.type === "serverRequestingInstance") {
                    console.log("sending instance");
                    name = document.getElementById('inputTxt').value;
                    socketInstance.socket.send(createMessage('clientSendingInstance', socketInstance.socket, [name, socketInstance.id], [socketInstance.id, message.data]))
                }

                /*If the server is sending the instance*/
                if (message.type === "serverSendingInstance") {
                    instances.push(message.data);
                    console.log(instances);
                }

                if (message.type === "returningExecutedCode") {
                    console.log(message.data);
                    terminalRef.current?.writeToTerminal(message.data);
                    isExecuting = false;
                }
                if (message.type === 'makeTeacher') {
                    socketInstance.role = 'teacher';
                }
            }
            console.log("Correctly connected to socket!")
        }
        console.log("Editor mounted successfully");

        editor.onDidChangeModelContent((event) => {
            function throttle(callback) {
                const now = Date.now();
                if (now - lastThrottleTime >= throttleDelay) {
                    lastThrottleTime = now;
                    callback();
                }
            }
        
            function debounce(callback) {
                clearTimeout(changeTimer);
                changeTimer = setTimeout(() => {
                    callback();
                }, serverChangeSpeed);
            }

            function update() {
                if (socketInstance.socket && socketInstance.role === "teacher" && socketInstance.status === "ready" && socketInstance.update) {
                    console.log("Sending Message");
                    socket.send(createMessage('updateCWC', socketInstance.socket, editor.getValue(), socketInstance.id));
                }
            }

            /*Handle the case when the user is currently typing (check every x~ of seconds)*/
            throttle(() => {update();});

            /*Handle the case when the user stops typing after typing (after x~ seconds of not typing)*/
            debounce(() => {update();});
        });
    }

    /**
     * @brief handles updating the server when the instance gets updated
     * @param {string} value the value of the react component as it gets update 
     */
    function handleEditorChange (value) {
        setCode(value);
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
        instances = [];
        socketInstance.socket.send(createMessage('requestInstances', socketInstance.socket, socketInstance.id, undefined));
        setInstances(true);
    }
    function runCode() {
        if (!isExecuting) {
            isExecuting = true;
            console.log("Executing Code");
            socket.send(createMessage('executeCode', socketInstance.socket, socketInstance.editor.getValue(), socketInstance.id));
        }
    }
    function HandleRole() {
        if (socketInstance.role === "teacher") {
            return (
                <div class="EditorOptions">
                    <div class="FileButton"></div>
                    <select
                        class="Selector"
                        onChange={handleRoleChange}
                    >
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                    </select>
                    <select
                        class="Selector"
                        value={language}
                        onChange={handleLanguageChange}
                    >
                        <option value="javascript">JavaScript</option>
                    </select>
                    <select
                        class="Selector"
                        onChange={handlePushSettings}
                    >
                        <option value="no-push">No Push</option>
                        <option value="push">Push</option>
                    </select>
                    <button
                        class="EditorButton"
                        type="button"
                        onClick={handlePush}
                    >
                        Push Code
                    </button>
                    <button
                        class="EditorButton"
                        type="button"
                        onClick={selectOptions}
                    >
                        Instances
                    </button>
                    <button
                        class={"RunButton" + (isExecuting ? " isExecuting" : "")}
                        type="button"
                        onClick={runCode}
                    >
                        {">"}
                    </button>
                    <input type="text" id="inputTxt" class="nameImp" name="classval" placeholder="name"></input>
                    <div class="Description">
                        Join the class by using the code:
                    </div>
                    <div class="ClassInstance">
                        {socketInstance.serverID}
                    </div>
                </div>
            );
        }
        else {
            return (
                <div class="EditorOptions">
                    <div class="FileButton"></div>
                    <button
                        class={"RunButton" + (isExecuting ? " isExecuting" : "")}
                        type="button"
                        onClick={runCode}
                    >
                        {">"}
                    </button>
                    <input type="text" id="inputTxt" class="nameImp" name="classval" placeholder="name"></input>
                    <div class="Description">
                        Join the class by using the code:
                    </div>
                    <div class="ClassInstance">
                        {socketInstance.serverID}
                    </div>
                </div>
            );
        }
    }

    useEffect(() => {
        initialize_background(0);
    }, []);

    function PushPopUp() {
        function closePopup() {
            setPushRequest(false);
        }
        function Override() {
            isApplyingServerUpdate = true;
            console.log("Overiding Editor");
            socketInstance.editor.setValue(lastUpdate);
            setTimeout(() => {
                isApplyingServerUpdate = false;
            }, updateBufferTime);
            closePopup();
        }
        function Comment() {
            isApplyingServerUpdate = true;
            console.log("Saving changes as comments");
            let comments = '/*BELOW IS THE PRESENTERS CODE*/\n/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/\n\n'
            comments +='//' + lastUpdate.split('\n').join('\n//') + '\n\n\n'; 
            comments += '/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/\n\n';
            comments += socketInstance.editor.getValue();
            socketInstance.editor.setValue(comments);
            setTimeout(() => {
                isApplyingServerUpdate = false;
            }, updateBufferTime);
            closePopup();
        }

    
        return (
            <div>
                {pushRequest && (
                    <div class='overlay'>
                        <div class='popup'>
                            <h2>The presenter is pushing their code</h2>
                            <p>You need to handle how how to incorperate it</p>
                            <div class='groupButton'>
                                <button onClick={Override}>Override</button>
                                <button onClick={Comment}>Comment</button>
                                <button onClick={closePopup}>Ignore</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    function PopUpInstances() {

        function makeTeacher(item) {
            socketInstance.socket.send(createMessage('makeTeacher', null, item, null));
        }
        function onClose() {
            setInstances(false);
        }
        return (
            <div>
                {getInstances &&(
                <div className="overlay">
                    <div className="popup">
                        <h2>List of Items</h2>
                        <div className="listContainer">
                            {instances.map((item, index) => (
                                <div className="listItem" key={index}>
                                    <span className="itemText">{item[0]}</span>
                                    <button className="itemButton" onClick={() => makeTeacher(item)}>
                                        Select
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="groupButton">
                            <button onClick={onClose}>Close</button>
                        </div>
                    </div>
                </div>)}
            </div>
        );
    }

    /*React Hook component*/
    return (
        <div>
            <div id="background-container"></div>
            <div id="foreground-container">
                <PushPopUp pushRequest={pushRequest} setPushRequest={setPushRequest}/>
                <PopUpInstances/>
                <HandleRole/>
                <div class="EditorContainer">
                    <Editor
                        class ="Editor"
                        height="90vh"
                        width="50%"
                        defaultLanguage={language}
                        defaultValue={code}
                        onChange={handleEditorChange}
                        onMount={handleEditorDidMount}
                        beforeMount={handleEditorBeforeMount}
                        loading={<div>Loading editor...</div>}
                        theme="live-editor-theme"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            automaticLayout: true
                        }}
                    />
                    <EmbTerminal 
                        class="Editor EmbTerminal"
                        ref={terminalRef}
                        height="500px"
                        width="50%"
                    />
                </div>
            </div>
        </div>
    );
};


export default LiveCodeEditor;