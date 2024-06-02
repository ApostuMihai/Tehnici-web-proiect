const express = require("express");
const fs= require('fs');
const path=require('path');
const sharp=require('sharp');
// const sass=require('sass');
// const ejs=require('ejs');
vect_foldere=["temp", "temp1"]
for(let folder of vect_foldere){
let caleFolder = path.join(__dirname, folder)
if(!fs.existsSync(caleFolder)){
    fs.mkdirSync(caleFolder)
}
}
obGlobal = {
    obErori:null,
    obImagini:null
}
app= express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

app.set("view engine","ejs");

app.use("/resurse", express.static(__dirname+"/resurse"));
// app.use("/node_modules", express.static(__dirname+"/node_modules"));

// app.get(["/", "/home","/index"], function (req, res){
//     res.sendFile(__dirname + "/index.html")
// })

app.get(["/", "/home","/index"], function (req, res){
    res.render("pagini/index", {ip:req.ip, imagini: obGlobal.obImagini.imagini})
})

app.get("/galerie", function(req,res){
    res.render("pagini/galerie-statica", {imagini: obGlobal.obImagini.imagini});
})
app.get("/cerere", function(req, res){
    res.send("Hello!")
})

app.get("/favicon.ico", function(req,res){
    res.sendFile(path.join(__dirname, "resurse/ico/favicon.ico"))
})

app.get(new RegExp("^\/[a-z0-9A-Z\/]*\/$"), function(req, res){
    afisareEroare(res, 403);
})

app.get("/*.ejs", function(req, res){
    afisareEroare(res, 400);
})
app.get('/video', (req, res) => {
    res.render('pagini/video', {imagini: obGlobal.obImagini.imagini});
  });
  
app.get("/*", function(req, res){
    //res.send("whatever");
    try{
        res.render("pagini"+req.url, function(err, rezHtml){
            if (err){
                if (err.message.startsWith("Failed to lookup view")){
                    afisareEroare(res, 404)
                    console.log("Nu a gasit pagina: ", req.url)
                }
            }
            else{
                
                res.send(rezHtml+"");
            }
        
            
        });
    }
    catch(err){
        if (err){
            if (err.message.startsWith("Cannot find module")){
                afisareEroare(res, 404)
                console.log("Nu a gasit resursa: ", req.url)
            }
            else{
                afisareEroare(res);
                console.log("Eroare"+err)
            }
        }
    }
})


function initErori(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    
    obGlobal.obErori=JSON.parse(continut);
    for (let eroare of obGlobal.obErori.info_erori){
        eroare.imagine=path.join(obGlobal.obErori.cale_baza,eroare.imagine)
    }
    obGlobal.obErori.eroare_default.imagine=path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)

} 



initErori();

function afisareEroare(res, _identificator, _titlu, _text, _imagine){
    let eroare=obGlobal.obErori.info_erori.find(
        function(elem){
            return elem.identificator==_identificator
        }
    )
    if(!eroare){
        res.render("pagini/eroare", {
            titlu: _titlu || eroare_default.titlu,
            text: _text || eroare_default.text,
            imagine: _imagine || eroare_default.imagine,
        })
    }
    else{
        if(eroare.status)
        res.status(eroare.identificator)
    res.render("pagini/eroare",{
        titlu: _titlu || eroare.titlu,
            text: _text || eroare.text,
            imagine: _imagine || eroare.imagine,
    })
    }
}

function initImagini(){
    var continut= fs.readFileSync(__dirname+"/resurse/json/galerie.json").toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;

    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    //for (let i=0; i< vErori.length; i++ )
    for (let imag of vImagini){
        [numeFis, ext]=imag.fisier.split(".");
        let caleFisAbs=path.join(caleAbs,imag.fisier);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs);
        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp" )
        imag.fisier=path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier )
        
    }
    console.log(obGlobal.obImagini);
}
initImagini();

app.listen(8080);
console.log("Serverul a pornit (port 8080)");