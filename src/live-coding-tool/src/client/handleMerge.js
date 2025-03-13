
/**
 * Algorithm
 * Serperate lines and tokenize each line
 * Match "Similar" lines
 * Have segmented group to determine clusters of similar lines
 * With the new instance as a priority, "merge the cluster of similar line"q 
 */

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
        let common = []

        l2.forEach((line1, index) => {
            l1.forEach((line2, index2) => {
                if (line1 === line2) {
                    common.push((index, index2));
                }
                else {

                }
            })
        });


    }
    determineCustomAncestor(lines1, lines2);
}

function removeWhiteSpace(input) {
    let tokenizeLine = []
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
            else {
                tokenizeLine.push(result);
                result = '';
            }
        }
    }
    return result;
}

module.exports = handleMerge;