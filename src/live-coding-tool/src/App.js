import React, { useEffect } from "react";
import initialize_background from "./backgroundEffect.js";
import { initializeClientSide } from "./connectToServer.js";
import './App.css';
import LiveCodeEditor from "./LiveCodeEditor.js";

async function startServerInstance() {
  let instance = window.location.href.match(/.*:\d+\/(.*)$/)[1];
  await initializeClientSide(instance, true);
}

async function attemptToConnect() {
  let val = document.getElementById('inputTxt').value;
  await initializeClientSide(val, false);
}
function LoadEditor() {
  return (
    <div className="App">
        <LiveCodeEditor />
    </div>
  );
}

function LoadLander() {
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("test");
      initialize_background(0);
    }, 0); // Delay of 1000 milliseconds (1 second)

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, []);
  return (
    <div id="background-container">
      <div className="landing">
        <div className="menu">
          <div className="enterClass">
            <h2>Join your class now</h2>
            <h4 className="subText">Code is on the presenter's screen</h4>
            <input type="text" id="inputTxt" className="classId" name="classval" placeholder="abcd-1234">
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
function App () {
  const [isEditor, setEditor] = React.useState(false);
  const [isLoading, setLoading] = React.useState(true);
  useEffect(() => {
    async function checkLoad(){
      const instance = window.location.href.match(/.*:\d+\/(.*)$/)[1];
      if (instance !== "") {
        try {
          const res = await initializeClientSide(instance, false);
          setEditor(res !== false);
        } catch (err) {
          setEditor(false);
        }
      }
      setLoading(false);
    }

    checkLoad();}, []);
  if (!isEditor && isLoading) {
    return <p>Loading...</p>;
  }
  return isEditor ? <LoadEditor /> : <LoadLander />;
}

export default App;