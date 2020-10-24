const express = require("express") // Webserver functionality of nodejs
const app = express();

app.get('/', (req,res) => {
    res.send("Hello World!")
})

module.exports.app = app;