const pool = require('./db')

async function createSocketSocketID(socket, sockID) {
    try {
        const result = await pool.query(
            "INSERT INTO sockets (socket, sockID) VALUES ($1, $2) RETURNING id",
            [socket, sockID]
        );
        console.log('Succesffuly added to SocketSocketID');
    }
    catch (err) {
        console.log(err);
    }
    finally {
        pool.end();
    }
}