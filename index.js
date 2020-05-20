const express = require('express');
const download = require('downloadjs');
const path = require('path');
const http = require('http');
const fs = require('fs');
const bodyParser = require('body-parser');
const Datastore = require('nedb');
const db = new Datastore({
    filename: path.resolve(__dirname, "db/db")
});
db.loadDatabase();

const port = 3000;
const app = express()
const publicPath = path.resolve(__dirname, 'public')

app.use(express.static(publicPath))

app.use(bodyParser.json({
    limit: '50mb'
}));

app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: false
}));

app.get("/", (req, res) => {
    console.log('node.js getBack');
    res.sendFile('index.html', {
        root: path.join(__dirname, 'public')
    });
})

app.get("/logs", (req, res) => {
    res.sendFile('logs.html', {
        root: path.join(__dirname, 'public/logs')
    });
})

app.get("/getAllPics", (req, res) => {

    db.find({}, function (err, docs) {
        if (err) {
            throw 'error getting pics ' + err;
        }

        resp = {
            records: docs,
            status: 'success'
        };

        res.send(resp);

    });
});

app.post("/getPic", (req, res) => {

    var filePath = path.join('images/', req.body.data);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            throw 'file read error ' + err;
        }

        resp = {
            record: data,
            status: 'success'
        };
        res.send(resp);
    });

});

app.post("/deletePic", function (req, res) {

    var key = req.body.data;
    var path = 'images/' + key;

    db.remove({
        key: key
    }, function (err, numDeleted) {
        if (err) {
            throw 'delete pic error ' + err;
        }

        fs.unlink(path, (err) => {
            if (err) {
                throw 'error deleting file ' + err;
            }

            resp = {
                status: 'success'
            };
            res.send(resp);

        });

    });

});

app.post("/handleSubmit", (req, res) => {

    const unixTimeCreated = new Date().getTime();

    const newData = Object.assign({
        "created": unixTimeCreated,
        "key": req.body.key
    })

    db.insert(newData, (err, docs) => {

        if (err) {
            throw 'error inserting file ' + err;
        }

        let path = 'images/' + req.body.key;
        let buffer = Buffer.from(req.body.data);

        fs.open(path, 'w', function (err, fd) {
            if (err) {
                throw 'could not open file: ' + err;
            }

            fs.write(fd, buffer, 0, buffer.length, null, function (err) {
                if (err) {
                    throw 'error writing file: ' + err;
                }

                fs.close(fd, function () {
                    //console.log('wrote the file successfully');
                    resp = {
                        status: 'success'
                    };
                    res.send(resp);
                });
            });
        });
    });
})

app.post('/downloadPic', (req, res) => {
    let filePath = 'images/pic.png';
    //res.download(filePath);
    console.log(filePath);
    download(filePath, 'pic.png', 'image/png');
    // var files = fs.createReadStream(filePath);
    // files.writeHead(200, {
    //   'Content-disposition': 'attachment; filename=demo.pdf'
    // }); //here you can add more headers
    // files.pipe(res);
})

/**
 *
 * Export all images to PNG on the server
 * */
// app.get("/export/all", (req, res) => {
//   db.find({}).sort({
//     'created': 1
//   }).exec(function(err, docs) {
//     if (err) {
//       return err;
//     }
//     docs.forEach(item => {
//       const outImage = item.image.replace(/^data:image\/png;base64,/, '');
//       fs.writeFileSync(path.resolve(__dirname, `./exports/all/${item.created}.png`), outImage, 'base64');
//       console.log('writing ', `${item.created}.png`)
//     })
//     res.send('done!')
//   });
// })



// use the http module to create an http server listening on the specified port
http.createServer(app).listen(port, () => {
    console.log(`Server running at: http://localhost:${port}`)
})
