var express = require('express');
var app = express();
var fs = require('fs');
let x = require('dotenv').config();
const Axios = require('axios');
var wget = require('node-wget');
 
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

    var url = `http://${process.env.ROOT_HOST}}:${process.env.ROOT_PORT}/audio/${filename}`;
 
    let tmpFilename = uuidv4();
    
    var filepath = `/tmp/${tmpFilename}.wav`;
    console.log(new Date(), 32, filepath);    

    wget({url: url, dest: filepath}, (e)=>{
        console.log(new Date(), 39, e);

        var stat = fs.statSync(filepath);
        res.header({
            'Content-Type': 'audio/wav',
            'Content-Length': stat.size
        });
        var readStream = fs.createReadStream(filepath);
        readStream.pipe(res);
    
        handleFileCopy(filepath, filename, lib);
    });
}

app.get('/audio/:filename', function(req, res) {

    var filename = req.params.filename;

    let regex = /^DSSD_(\d+)_(\d+)_(\d+)$/;
    let x = filename.replace(regex, '$1');
    let y = filename.replace(regex, '$2');
    let z = filename.replace(regex, '$3');

    let lib = y;

    console.log(x, y, z);

    var filepath = `${process.env.SERVE_FILES_FROM}/${lib}/${filename}.wav`;
    try {
        var stat = fs.statSync(filepath);

        console.log(new Date(), 15, filepath);
        res.header({
            'Content-Type': 'audio/wav',
            'Content-Length': stat.size
        });
    
    
        var readStream = fs.createReadStream(filepath);
        readStream.pipe(res);

    } catch (e) {
        if (e.toString().indexOf('no such file or directory') != -1) {
            try {
                console.log(e);
                handleMissingFile(req, res, filename, lib);
                return;

            } catch (e2) {
                console.log(e2);
            }
        } else {
            console.log(new Date(), 36, e);
        }
    }
});



