import React, { useEffect } from "react";
import initialize_background from "./backgroundEffect.js";
import { initializeClientSide } from "./connectToServer.js";
import './App.css';
import LiveCodeEditor from "./LiveCodeEditor.js";

/**
 * @brief the function to start a new primary server
 */
async function startServerInstance() {
  let instance = window.location.href.match(/.*:\d+\/(.*)$/)[1];
  await initializeClientSide(instance, true);
}

/**
 * @brief the function to attempt to connect to a server instance
 */
async function attemptToConnect() {
  let val = document.getElementById('inputTxt').value;
  let res = await initializeClientSide(val, false);
  if (res === true) window.location.href += val;
}

/**
 * @breif loads the editor component for react
 * @returns the React hook for the editor
 */
function LoadEditor() {
  return (
    <div class="CodingLander">
        <LiveCodeEditor />
    </div>
  );
}

/**
 * @brief loads the landing page for the live coding tool
 * @returns the React hook for the lander
 */
function LoadLander() {
  /*Initialize the background effect*/
  useEffect(() => {
      initialize_background(0);
  }, []);

  /*React Hook*/
  return (
    <div id="background-container">
      <div className="landing">
        <div className="menu">
          <div className="enterClass">
            <h2>Join your class now</h2>
            <h4 className="subText">Code is on the presenter's screen</h4>
            <input type="text" id="inputTxt" className="classId" name="classval" placeholder="ABCD-1234">
            </input>
            <div className="joinButton button"
              onClick={attemptToConnect}>
              <p>Join class</p>
            </div>
          </div>
          <div className="startClass">
            <h4>Looking to start a class?</h4>
            <div 
              className="startButton button"
              onClick={startServerInstance}
            >
              <p>Start a class</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * @brief the main App component for the live coding tool 
 * @returns the App component for the live coding tool
 */
function App () {
  /*Create React states to handle loading*/
  const [isEditor, setEditor] = React.useState(false);
  const [isLoading, setLoading] = React.useState(true);

  /*Check if the editor is loaded, useEffect to allow syncronous*/
  useEffect(() => {
    async function checkLoad(){
      const instance = window.location.href.match(/.*:\d+\/(.*)$/)[1];
      
      /*If the URL suggests that the client is connecting to an instance*/
      if (instance) {

        /*Attempt to connect to the server instance*/
        try {
          const res = await initializeClientSide(instance, false);
          setEditor(res !== false);
        } catch (err) {
          setEditor(false);
        }
      }

      /*Upon resolution, no longer loading*/
      setLoading(false);
    }

    checkLoad();}, []);

  /*If the socket is not connected or still waiting upon server, don't load page*/
  if (!isEditor && isLoading) {
    return <p>Loading...</p>;
  }

  /*Otherwise, set the page to the editor or lander*/
  return isEditor ? <LoadEditor /> : <LoadLander />;
}

export default App;