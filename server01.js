var express = require("express")
var hbs = require('express-handlebars');
var path = require("path")
var app = express()
var formidable = require('formidable');
var PORT = process.env.PORT || 3000;
var logged = false;
var context = { files: [] };
var id = 0;
//const bodyParser = require('body-parser');
app.use(express.urlencoded({
    extended: true
}));
app.set('views', path.join(__dirname, 'views'));         // ustalamy katalog views
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));   // domyślny layout, potem można go zmienić
app.set('view engine', 'hbs');
app.use(express.json());

app.get("/", function (req, res) {
    //res.render('index.hbs');   // nie podajemy ścieżki tylko nazwę pliku
    if (logged) {
        res.render('index.hbs')
    }
    else {
        res.render('login.hbs', { layout: "loginLayout.hbs" }); // opcjonalnie podajemy konkretny layout dla tego widoku
    }

})

app.post("/login", function (req, res) {
    if (logged || req.body.login == "tapala" && req.body.password == "yeet") {
        logged = true
        res.redirect("/")
    }
    else {
        res.render('login.hbs', { layout: "loginLayout.hbs" });
    }

})

app.get("/login", function (req, res) {
    if (logged) {
        res.redirect("/")
    }
    else {
        res.render('login.hbs', { layout: "loginLayout.hbs" });
    }

})

app.post("/fileUpload", function (req, res) {
    multipleFiles = "Zero";
    let form = formidable({});
    form.keepExtensions = true   // zapis z rozszerzeniem pliku
    form.multiples = true
    form.uploadDir = __dirname + '/static/upload/'
    form.parse(req, function (err, fields, files) {
        if (Array.isArray(files.fileToUpload)) {
            multipleFiles = "multiple"
        }
        else if (files.fileToUpload.size != 0) {
            multipleFiles = "single"
        }

        if (multipleFiles == "multiple") {

            for (const x in files.fileToUpload) {
                let image = "unknown"
                if (files.fileToUpload[x].type == "text/plain") {
                    image = "txt";
                }
                else if (files.fileToUpload[x].type == "image/png") {
                    image = "png";
                }
                else if (files.fileToUpload[x].type == "image/jpeg") {
                    image = "jpeg";
                }
                else if (files.fileToUpload[x].type == "image/gif") {
                    image = "gif";
                }
                else if (files.fileToUpload[x].type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                    image = "word";
                }
                else if (files.fileToUpload[x].type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                    image = "excel";
                }

                let data = { id: id, name: files.fileToUpload[x].name, path: files.fileToUpload[x].path, size: files.fileToUpload[x].size, type: files.fileToUpload[x].type, image: image, date: Date.now() };
                context.files.push(data);
                id += 1;
            }
        }
        else if (multipleFiles == "single") {
            let image = "unknown"
            if (files.fileToUpload.type == "text/plain") {
                image = "txt";
            }
            else if (files.fileToUpload.type == "image/png") {
                image = "png";
            }
            else if (files.fileToUpload.type == "image/jpeg") {
                image = "jpeg";
            }
            else if (files.fileToUpload.type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                image = "word";
            }
            else if (files.fileToUpload.type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                image = "excel";
            }
            let data = { id: id, name: files.fileToUpload.name, path: files.fileToUpload.path, size: files.fileToUpload.size, type: files.fileToUpload.type, image: image, date: Date.now() };
            context.files.push(data);
            id += 1;
        }
        else {
        }
        res.redirect("/");
    });
})

app.get("/filemanager", function (req, res) {
    if (logged) {
        res.render('fileManager.hbs', context)
    }
    else {
        res.render('login.hbs', { layout: "loginLayout.hbs" });
    }

})

app.post("/deleteFiles/:index", function (req, res) {
    let index = req.params.index;
    for (const x in context.files) {
        if (context.files[x].id == index) {
            context.files.splice(x, 1);
        }
    }
    res.redirect("/filemanager");
})
app.post("/download/:index", function (req, res) {
    let index = req.params.index;
    for (const x in context.files) {
        if (context.files[x].id == index) {
            res.download(context.files[x].path)
        }
    }
})
app.post("/deleteAll", function (req, res) {
    context.files.splice(0, context.files.length);
    res.redirect("/filemanager");
})
app.post("/info/:index", function (req, res) {
    let index = req.params.index;
    let infoContext = {};
    for (const x in context.files) {
        if (context.files[x].id == index) {
            infoContext = context.files[x];
        }
    }
    res.render('info.hbs', infoContext)
})
app.get("/logout", function (req, res) {
    logged = false;
    res.redirect("/login")
});
app.use(express.static('static/gfx'));
app.get("/*", function (req, res) {
    res.render('wrongLink.hbs', { layout: "wrongLoginLayout.hbs" });
    //res.sendFile(__dirname + '/static/gfx/maklowicz.jpg');
})

app.listen(PORT, function () {
    logged = false
    console.log("start serwera na porcie " + PORT)
})