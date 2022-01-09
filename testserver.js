
/**
 * Small local server for testing
 */
const express = require('express');
const port = 3000
const app = express()
app.use('/bingo', express.static('./client/build'))
app.use('/bingodev', express.static('./client/src'))
app.use('/lib', express.static('./client/lib'))
app.listen(port, () => {
    console.log(`Servidor iniciado en el puerto ${port}`) 
    console.log(`http://localhost:${port}/bingo/classic.html`)
    console.log(`http://localhost:${port}/bingodev/index.html`)
});