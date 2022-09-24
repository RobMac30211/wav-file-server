var express = require('express');
var app = express();
var fs = require('fs');
let x = require('dotenv').config();
const axios = require('axios');

const { v4: uuidv4 } = require('uuid');

let port = process.env.HTTP_PORT
app.listen(port, function() {
    console.log(`shakeShack fileServer -- Listening on Port ${port}`);
});

const handleFileCopy = async (filepath, filename, lib) => {

    const fse = require('fs-extra')

    try {
        let x = await fse.mkdir(`/opt/audio/${lib}`);
    } catch(e) {
        console.log(new Date(), 22, e);
    }

    try {
        const src = filepath
        const dest = `/opt/audio/${lib}/${filename}.wav`
        
        fse.move(src, dest, err => {
          if (err) return console.error(err)
          console.log('success!')
        })

    } catch(e) {
        console.log(new Date(), 30, e);
    }
}

const handleMissingFile = async (req, res, filename, lib) => {

    var url = `http://${process.env.ROOT_HOST}:${process.env.ROOT_PORT}/audio/${filename}`;
    console.log(new Date(), 41, url);
 
    axios({
        method: "get",
        url: url,
        responseType: "stream"
    }).then(function (response) {
        
        res.header({
            'Content-Type': 'audio/wav',
            'Content-Length': response.headers['content-length']
        });

        response.data.pipe(res);
    });
}

const getLib = (filename) => {

    let regex = /^DSSD_(\d+)_(\d+)_(\d+)$/;

    let x = filename.replace(regex, '$1');
    let y = filename.replace(regex, '$2');
    let z = filename.replace(regex, '$3');

    console.log(new Date(), 68, x, y, z);

    let lib = y;

    return lib;
}

app.get('/audio/:filename', function(req, res) {

    console.log(new Date(), `app.get('/audio/:filename'`);

    var filename = req.params.filename;
    let lib = getLib(filename);

    var filepath = `${process.env.SERVE_FILES_FROM}/${lib}/${filename}.wav`;
    console.log(new Date(), 15, filepath);
    try {
        var stat = fs.statSync(filepath);

        res.header({
            'Content-Type': 'audio/wav',
            'Content-Length': stat.size
        });
    
        var readStream = fs.createReadStream(filepath);
        readStream.pipe(res);
    } catch (e) {
        if (e.toString().indexOf('no such file or directory') != -1) {
            handleMissingFile(req, res, filename, lib);
        } else {
            console.log(new Date(), 36, e);
        }
    }
});



