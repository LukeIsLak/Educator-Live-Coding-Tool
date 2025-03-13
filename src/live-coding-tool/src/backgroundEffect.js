/*Initialize how many nodes to create*/
const numNodes = 30;

let ac = [];
let moveAC = [];

/*Accent colours referenced from App.css*/
let grad1 = [166, 201, 172];
let grad2 = [242, 241, 235];

/*Ensures darker colour is always on the bottom*/
if (grad1[0] + grad1[1] + grad1[2] > grad2[0] + grad2[1] + grad2[2]) {
    let temp = grad2;
    grad2 = grad1;
    grad1 = temp;
}

document.documentElement.style.setProperty('--accent-colour1', "rgb(" + grad2[0] + ", " + grad2[1] + ", " + grad2[2] + ")");
document.documentElement.style.setProperty('--accent-colour2', "rgb(" + grad1[0] + ", " + grad1[1] + ", " + grad1[2] + ")");

/**
 * @brief Initializes the background effect for the landing page
 */
export default function initialize_background() {

    /*Randomly scatter points across the page*/
    for (let i = 0; i < numNodes; i++) {
        let posX = Math.random() * 100, posY = Math.random() * 100;
        let scale = Math.random() + 0.3;
        let coord = [posX, posY, scale];
        ac.push(coord);

        let vecX = Math.random() * 2 - 1, vecY = Math.random() * 2 - 1;
        let vector = [vecX, vecY];
        moveAC.push(vector);
    }

    /*"Smooth" the edges by adding points outside of the screen*/
    let edgeSmooth = 5;
    for (let i = 1; i < edgeSmooth; i++) {
        let pos = (i / edgeSmooth) * 100;
        ac.push([pos, 0, 0]);
        ac.push([pos, 100, 0]);
        ac.push([0, pos, 0]);
        ac.push([100, pos, 0]);
        moveAC.push([Math.random() * 2 - 1, 0]);
        moveAC.push([Math.random() * 2 - 1, 0]);
        moveAC.push([0, Math.random() * 2 - 1]);
        moveAC.push([0, Math.random() * 2 - 1]);
    }

    /*Add points to the corner*/
    ac.push([0, 0, 0], [0, 100, 0], [100, 0, 0], [100, 100, 0]);
    moveAC.push([0, 0], [0, 0], [0, 0], [0, 0]);
    
    updateBackground();
}

function updateElementPosition(element, index) {
    let speed = 0.1;
    let newX = element[0] + moveAC[index][0]*speed;
    let newY = element[1] + moveAC[index][1]*speed;

    newX = (newX < 0)? 100 : ((newX > 100)? 0 : newX);
    newY = (newY < 0)? 100 : ((newY > 100)? 0 : newY);

    ac[index] = [newX, newY, ac[index][2]];
}

async function updateBackground() {
    document.querySelectorAll(".triangle").forEach((element) => {
        element.remove();
    });

    for (let i = 0; i < ac.length; i++) {
        updateElementPosition(ac[i], i);
    }
    const docFrag = document.createDocumentFragment();

    let triangles = orderCoordinatesToTriangles();

    triangles.forEach((element) => {
         let child = createTriangle(ac[element[0]], ac[element[1]], ac[element[2]], element[4]);
         if (child != null) docFrag.appendChild(child);
    });

    document.getElementById("background-container").appendChild(docFrag);

    await delay(20);
    updateBackground();
    
}

function orderCoordinatesToTriangles() {
    let triangles = [];
    for (let e1 = 0; e1 < ac.length; e1 ++) {
        for (let e2 = e1+1; e2 < ac.length; e2 ++) {
            for (let e3 = e2+1; e3 < ac.length; e3 ++) {
                let coord = sortToCounterClockwise(e1, e2, e3, ac);
                let anyPointsWithin = false;

                for (let e4 = 0; e4 < ac.length; e4 ++) {
                    if (e1 === e4 || e2 === e4 || e3 === e4) {
                        continue;
                    }
                    if (calculateDeterminant3x3(coord, e4)) {
                        anyPointsWithin = true;
                        break;
                    }
                }

                if (!anyPointsWithin) {
                    triangles.push(coord);
                }
            }
        }
    }

    return triangles;
}

function calculateDeterminant3x3(coord, e4) {
    const ax = ac[(coord[0])][0];
    const ay = ac[coord[0]][1];
    const bx = ac[coord[1]][0];
    const by = ac[coord[1]][1];
    const cx = ac[coord[2]][0];
    const cy = ac[coord[2]][1];
    const dx = ac[e4][0];
    const dy = ac[e4][1];

    const det1 = (ax-dx) * calculateDeterminant2x2((by-dy), calcDifferentDet(bx, dx, by, dy), (cy-dy), calcDifferentDet(cx, dx, cy, dy));
    const det2 = (ay-dy) * calculateDeterminant2x2((bx-dx), calcDifferentDet(bx, dx, by, dy), (cx-dx), calcDifferentDet(cx, dx, cy, dy));
    const det3 = calcDifferentDet(ax, dx, ay, dy) * calculateDeterminant2x2((bx-dx), (by-dy), (cx-dx), (cy-dy));

    const result = det1 - det2 + det3;
    return (result > 0);
}

// returns (e1 - e2)^2 + (e3 - e4)^2
function calcDifferentDet(e1, e2, e3, e4) {
    return Math.pow(e1 - e2, 2) + Math.pow(e3 - e4, 2);
}

// | e1, e2 |
// | e3, e4 |
function calculateDeterminant2x2(e1, e2, e3, e4) {
    return ((e1 * e4) - (e2*e3));
}

function sortToCounterClockwise(e1, e2, e3, ac) {
    let coord = [];
    const centerX = (ac[e1][0] + ac[e2][0] + ac[e3][0])/3;
    const centerY = (ac[e1][1] + ac[e2][1] + ac[e3][1])/3;

    let angle1 = get_angle([ac[e1][0] - centerX, ac[e1][1] - centerY]);
    let angle2 = get_angle([ac[e2][0] - centerX, ac[e2][1] - centerY]);
    let angle3 = get_angle([ac[e3][0] - centerX, ac[e3][1] - centerY]);

    if (angle1 < 90) angle1 += 360;
    if (angle2 < 90) angle2 += 360;
    if (angle3 < 90) angle3 += 360;

    if (angle1 < angle2 && angle1 < angle3) {
        coord.push(e1);
        if (angle2 < angle3) {coord.push(e2); coord.push(e3);}
        else {coord.push(e3); coord.push(e2);}
    }
    else if (angle2 < angle1 && angle2 < angle3) {
        coord.push(e2);
        if (angle1 < angle3) {coord.push(e1); coord.push(e3);}
        else {coord.push(e3); coord.push(e1);}
    }
    else {
        coord.push(e3);
        if (angle1 < angle2) {coord.push(e1); coord.push(e2);}
        else {coord.push(e2); coord.push(e1);}
    }

    coord.push(centerX);
    coord.push(centerY);

    return coord;
}

const getScale = (cX, cY, pX, pY, s) => {

    let v = make_vector([pX, pY], [cX, cY]);
    let u = unit_vector(v);

    return (pX + s*u[0]) + "% " + (pY + s*u[1]) + "%";
}

/**
 * @brief creates a triangle html element given 3 points and the center of the triangle
 * @param {vector} p1 point 1
 * @param {vector} p2 point 2
 * @param {vector} p3 point 3
 * @param centerY center of the triangle
 * @returns triangle html element
 */
function createTriangle(p1, p2, p3, centerY) {
    const newTriangle = document.createElement("div");
    newTriangle.className = "triangle";
    let cX = (p1[0] + p2[0] + p3[0]) / 3;
    let cY = ((p1[1]) + (p2[1]) + (p3[1])) / 3;
    let scale = 0;
    
    let coord1 = getScale(cX, cY, p1[0], (p1[1]), scale);
    let coord2 = getScale(cX, cY, p2[0], (p2[1]), scale);
    let coord3 = getScale(cX, cY, p3[0], (p3[1]), scale);
    newTriangle.style.backgroundColor = "rgb(" + colourFunction(0, centerY) + ", " + colourFunction(1, centerY) + ", " + colourFunction(2, centerY) + ")";
    newTriangle.style.clipPath = "polygon(" + coord1 + ", " + coord2 + ", " + coord3 + ")";
    newTriangle.style.opacity = centerY/window.innerHeight + 1;

    if (!newTriangle.style.clipPath) {
        return null;
    }

    return newTriangle;
}

function colourFunction(i, cY) {
    return (grad1[i] + ((grad2[i] - grad1[i]) * (1 - (cY / 100))));
}

//make a vector given arrays
const make_vector = (e1, e2) => {
    const wa = e2[1] - e1[1];
    const wb = e2[0] - e1[0];
    return [wb, wa];
};

//Get current width of a vector
const get_width = (v) => {
    const wa = Math.pow(v[0], 2);
    const wb = Math.pow(v[1], 2);
    return Math.sqrt(wa + wb);
};


//Get current angle of a vector with the line <1, 0>
const get_angle = (v) => {
    let angle = Math.acos((v[0] / get_width(v)))*180/Math.PI;
    if (v[1] < 0) {angle = 360 - angle;}
    return angle;
};

//get unit vector
const unit_vector= (v) => {
    let width = get_width(v);
    return [v[0]/width, v[1]/width];
};

//delay a function by m ms
async function delay(m) {
    let promise = new Promise(function(resolve, reject) {
        setTimeout(() => {
            resolve()
        }, m);
    });

    return promise;
}