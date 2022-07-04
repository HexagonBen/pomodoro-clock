//note: the "alarm-sound.mp3" file is not being used; this project uses a url link in an audio tag instead.
function App(){
    const [displayTime, setDisplayTime] = React.useState(25 * 60)
    const [sessionLength, setSessionLength] = React.useState(25 * 60);
    const [breakLength, setBreakLength] = React.useState(5 * 60);
    const [sessionOrBreak, setSessionOrBreak] = React.useState(true);
    const [timerOn, setTimerOn] = React.useState(false);

    React.useEffect(() => {if (displayTime == 0) {playAlarm()}}, [displayTime])

    function reset() {
        setDisplayTime(25*60)
        setBreakLength(5*60)
        setSessionLength(25*60)
        setSessionOrBreak(true)
        beep.pause();
        beep.currentTime = 0;
        if (timerOn) {
            clearInterval(localStorage.getItem("interval-id"));
            setTimerOn(prev => !prev)
        }
    }

    function playAlarm() {
        beep.currentTime = 0;
        beep.play();
    }

    function formatTime(time) {
        let minutes = Math.floor(time/60);
        let seconds = time % 60;
        return (
            (minutes < 10? "0" + minutes: minutes) + 
            ":" +
            (seconds < 10? "0" + seconds : seconds)
            );
    };

    //this function adjusts session & break length
    function adjustTime(timeType, amount) {
        //conditions for ignoring input
        if (timeType == "session" && amount > 0 && sessionLength >= 60 * 60) {return}
        if (timeType == "session" && amount < 0 && sessionLength <= 1 * 60) {return}
        if (timeType == "break" && amount > 0 && breakLength >= 60 * 60) {return}
        if (timeType == "break" && amount < 0 && breakLength <= 1 * 60) {return}
        //logic
        if (timeType == "session") {
            setSessionLength(prev => prev + amount)
            if (sessionOrBreak) {setDisplayTime(prev => prev + amount)}
        }
        if (timeType == "break") {
            setBreakLength(prev => prev + amount)
            if (!sessionOrBreak) {setDisplayTime(prev => prev + amount)}
        }
    }

    //this function sets the `setInterval` unique ID to local storage so it can be reliably retrived anywhere in the code to stop the timer (using a global variable didn't work)
    function timeFlow() {
        let second = 1000;
        let date = new Date().getTime();
        let nextDate = new Date().getTime() + second;
        let sessionBreakControl = sessionOrBreak
        if (!timerOn) {
            let interval = setInterval(() => {
                date = new Date().getTime();
                if (date > nextDate){
                    setDisplayTime(prev => {
                        if(prev <= 0 && sessionBreakControl){
                            sessionBreakControl = false;
                            setSessionOrBreak(false)
                            return breakLength;
                        }else if(prev <= 0 && !sessionBreakControl) {
                            sessionBreakControl = true;
                            setSessionOrBreak(true)
                            return sessionLength;
                        }
                        return prev - 1;
                    });
                    nextDate += second;
                }
            }, 50)
            localStorage.clear();
            localStorage.setItem("interval-id", interval)
        }

        if (timerOn) {
            clearInterval(localStorage.getItem("interval-id"));
        }
        setTimerOn(prev => !prev)
    }

    return (
        <div className="background">
            <main>
                <h2 className="title">The 25 + 5 Clock</h2>
                <div className="lengthControls">
                    <div className="sessionWrapper">
                        <div id="break-label">Session Length</div>
                        <div id="session-increment" onClick={() => adjustTime("session", 60)}><i className="fa-solid fa-angle-up"></i></div>
                        <div id="session-length">{sessionLength / 60}</div>
                        <div id="session-decrement" onClick={() => adjustTime("session", -60)}><i className="fa-solid fa-angle-down"></i></div>
                    </div>
                    <div className="breakWrapper">
                        <div id="session-label">Break Length</div>
                        <div id="break-increment" onClick={() => adjustTime("break", 60)}><i className="fa-solid fa-angle-up"></i></div>
                        <div id="break-length">{breakLength / 60}</div>
                        <div id="break-decrement" onClick={() => adjustTime("break", -60)}><i className="fa-solid fa-angle-down"></i></div>
                    </div>
                </div>
                <Timer 
                displayTime={displayTime} 
                timerOn={timerOn} 
                timeFlow={timeFlow} 
                reset={reset}
                formatTime={formatTime}
                sessionOrBreak={sessionOrBreak}
                sessionLength={sessionLength} 
                breakLength={breakLength}
                />
            </main>
            <audio id="beep" src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav" preload="auto"/>
        </div>
    );
}

function Timer (props) {

    return (
        <div className="timerWrapper">
            <div className="timerDisplay">
                <div id="timer-label">{props.sessionOrBreak ? "session" : "break"}</div>
                <div id="time-left">{props.formatTime(props.displayTime)}</div>
            </div>
            <div className="timerControls">
                <i className="fa-solid fa-play" id="start_stop" onClick={props.timeFlow}></i>
                <i class="fa-solid fa-pause" onClick={props.timeFlow}></i>
                <i className="fa-solid fa-arrows-rotate" id="reset" onClick={props.reset}></i>
            </div>
        </div>
    );
}

ReactDOM.render(<App/>, document.getElementById("root"));