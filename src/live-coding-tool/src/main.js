const titleHeaderStages = {
    "elements":
    [
        null,
        "HELLO",
        "HELLO, I'M LUKE KULIGOWICZ",
        "HELLO, I'M A "
    ],
    "timing":
    [
        2000,
        1000,
        2000,
        0
    ],
    "repeat": false,
    "func_after_rep": "transition_header_title()",
    "func_file": "script.js",
    "cursor_colour": "rgb(228, 225, 221)"
};

const delay_time = 1000;

async function onLoad() {
    const handleOnMouseMoveBorder = e => {
        const {currentTarget: target} = e;
        const rect = target.getBoundingClientRect(),
                x = e.clientX - rect.left;
                y = e.clientY - rect.top;
        
        target.style.setProperty("--x-pos", x + "px");
        target.style.setProperty("--y-pos", y + "px");
    }

    const scrollListener = e => {
        console.log(window.scrollY);
    }

    const handleOnMouseMove = e => {
        // if (document.getElementById("menu-container").classList.contains("in-transition")) {
        //     const curTarget =  -(e.x-window.innerWidth/2)/window.innerWidth*100;
        //     const curX = parseFloat(getComputedStyle(document.getElementById("menu-container")).getPropertyValue('left').replace("px", ''))/window.innerWidth*100;
        //     const makeUp = 1;
        //     //console.log(curX, curTarget);
        //     if (curTarget < curX + makeUp && curTarget > curX - makeUp) {
        //         document.getElementById("menu-container").classList.remove("in-transition");
        //     }
        // }
        document.documentElement.style.setProperty('--x', (e.x-window.innerWidth/2)/window.innerWidth*100 + "%");
    }

    const handleOnMouseEnter = e => {
        const { currentTarget: target } = e;
        document.getElementById("menu-container").classList.add("in-transition");
        document.documentElement.style.setProperty('--x', (e.x-window.innerWidth/2)/window.innerWidth*100 + "%");

        document.getElementById("background-container").style.opacity = "0.2";
        // const promise = delay_sv(delay_time, 1);

        // promise.then((v) => {
        //     document.getElementById("menu-container").classList.remove("in-transition");
        // });
    }

    const handleOnMouseLeave = e => {
        document.getElementById("background-container").style.opacity = "1";
    }

    const newCursor = document.createElement("div");
    newCursor.id = "type-cursor";
    document.getElementById("main-header-container").appendChild(newCursor);
    document.getElementById("menu-container").onmousemove = e => handleOnMouseMove(e);
    document.getElementById("menu-container").onmouseenter = e => handleOnMouseEnter(e);
    document.getElementById("menu-container").onmouseleave = e => handleOnMouseLeave(e);

    document.addEventListener.scrollListener = e => scrollListener(e);
    newCursor.style.backgroundColor = titleHeaderStages.cursor_colour;

    document.querySelectorAll(".border").forEach(element => {
        element.onmousemove = e => handleOnMouseMoveBorder(e);
    });

    initialize_parallax();
    initialize_background();
    await createCurrentTitle(titleHeaderStages, "header-title", false, titleHeaderStages.cursor_colour);
    initialteUpdatingTitle(titleHeaderStages, "header-title", false, titleHeaderStages.cursor_colour);
    setInterval(updateAngle, 5);
}

function updateAngle() {
    let curAngle = window.getComputedStyle(document.documentElement).getPropertyValue('--border-angle');
    curAngle = +curAngle.slice(0, -3);
    curAngle -= 1;
    if (curAngle < 0) curAngle = 360;
    document.documentElement.style.setProperty('--border-angle', curAngle + "deg");
}