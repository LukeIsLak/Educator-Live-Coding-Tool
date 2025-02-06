/**
 * @brief a centrailized way to recognize messages between the client and server
 * @param {string} type string to represent purpose of message
 * @param {socket} sock socket that the message is coming from
 * @param {string} data string of data the message carries
 * @param {*} options additional information attachted to the message, if any
 * @returns a JSON string that represents the format of any message sent between the client and server
 */
function createMessage(type, sock, data, options) {
    //console.log(JSON.stringify(sock));
    return (JSON.stringify(
        {
            "instance":"",
            "type":type,
            "socket":sock,
            "data":data,
            "options":options
        })
    );
}

module.exports = createMessage;