function handleMerge(previousInstance, newInstance) {
    //let mergedLines = "";

    console.log(previousInstance)
    console.log(newInstance)
    let lines1 = previousInstance.split('\n');
    lines1.forEach(line => {
        line = removeWhiteSpace(line);
    });
    let lines2 = newInstance.split('\n');
    lines2.forEach(line => {
        line = removeWhiteSpace(line);
    });
    console.log(lines1, lines2);

    /*Determine some sort of custom ancestor*/
    const determineCustomAncestor = (l1, l2) => {
        //let common = []

        l2.forEach((line1, index) => {
            l1.forEach(line2 => {
                if (line1 === line2) {
                    console.log("found match")
                }
            })
        });


    }
    determineCustomAncestor(lines1, lines2);
}

function removeWhiteSpace(input) {
    let result = "";
    let inString = false;
    let stringCont = "";
    //let escape = false;

    for (let i = 0; i < input.length; i++) {
        let char = input[i];
        if (inString) {
            result += char;
            if (char === stringCont) {
                inString = false;
            }
        }
        else {
            if (char ==='"' || char === "'" || char === "`") {
                inString = true;
                stringCont = char;
                result += char;
            }
            else if(!char.match(/\s/)) {
                result += char;
            }
        }
    }
    return result;
}

module.exports = handleMerge;