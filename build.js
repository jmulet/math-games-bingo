const fs = require("fs")
const path = require("path");
const { exit } = require("process");
var UglifyJS = require("uglify-js");  
var uglifycss = require("uglifycss");

var options = { 
    //Do not mange BingoClassic, BingoEquacions, etc ...
    mangle: {
        reserved: ['BingoClassic', 'BasicGenerator', 'EqnGenerator', 'DifGenerator', 'NumGenerator', 'CheGenerator']
      }
};

console.log("**************************************")
console.log("** Compile and minify bingo client  **") 
console.log("**************************************")
console.log(" ")

const dst = "./client/build/" 
const srcClient = "./client/src/" 
const autoClient = "./client/src/auto/" 
const srcServer = "./server/"

console.log(`> srcClient=${srcClient}`)
console.log(`> srcServer=${srcServer}`)
console.log(`> dst=${dst}`)
console.log(" ")

const loader = `
window._modules = {};
window.require = function(modname) {
    modname = modname.replace("./", "");
    return (window._modules[modname] || {}).exports || {};
};
`

function windofy(src) {
    src = src.replace(/const /g, 'var ').replace(/let /g, 'var ').replace(/require\(".\//g, 'require("').replace(/Muvar/g, 'Mulet')
    src = replaceBlock(src, '//!!start:nodist!!', '//!!end:nodist!!', '');
    src = replaceBlockFn(src, '//!!start:onlydist!!', '//!!end:onlydist!!', (txt) => {
        const parts = txt.split('\n').map(line => {
            return line.trim().substring(2);
        });
        return parts.join('\n')
    });
    return src;
}

function packModule(modname, parts) {
    let packing = `
// Automatically generated on ${new Date()}. Do not modify.
window._modules["${modname}"] = {exports: {}};
(function(module){
`
    parts.forEach( (p) => {
        packing += windofy(p) + '\n'
    })

    packing += 
`}(window._modules["${modname}"] ));
`
    return packing
}

function pack() {
    var args = Array.prototype.slice.call(arguments);
    let packing = `
(function(){
`
    args.forEach( (p) => {
        packing += p + '\n'
    })

    packing += 
`}());
`
    return packing
}

function replaceBlock(txt, tagStart, tagEnd, replacement) {
    var i0 = txt.indexOf(tagStart) 
    var i1 = txt.indexOf(tagEnd) + tagEnd.length;
    if(i0 < 0) {
        return txt;
    }
    var txt2 = txt.substring(0, i0) + replacement + txt.substring(i1);
    if(txt2.indexOf(tagStart)>=0) {
        return replaceBlock(txt2, tagStart, tagEnd, replacement) 
    }
    return txt2;
}
function replaceBlockFn(txt, tagStart, tagEnd, cb) {
    var i0 = txt.indexOf(tagStart) 
    var i1 = txt.indexOf(tagEnd);
    if(i0 < 0 || i1 < 0) {
        return txt;
    }
    console.log(i0,i1)
    var txt2 = txt.substring(0, i0) + cb(txt.substring(i0+tagStart.length, i1)) + txt.substring(i1+tagEnd.length);
    if(txt2.indexOf(tagStart)>=0) {
        return replaceBlockFn(txt2, tagStart, tagEnd, cb) 
    }
    return txt2;
}

// Generate bingo_utils

let sutils = fs.readFileSync(path.join(srcServer, "utils.js"), "utf8") 
sutils = packModule("utils", [sutils])
sutils = loader + "\n" + sutils


let stimer = fs.readFileSync(path.join(srcServer, "timer.js"), "utf8") 
stimer = packModule("timer", [stimer]);

let botPlayer = fs.readFileSync(path.join(srcServer, "bot_player.js"), "utf8") 
botPlayer = packModule("bot_player", [botPlayer]);

let cartro = fs.readFileSync(path.join(srcServer, "cartro.js"), "utf8") 
cartro = packModule("cartro", [cartro]);

let sclassic = fs.readFileSync(path.join(srcServer, "bingo_classic.js"), "utf8") 
sclassic = packModule("bingo_classic", [sclassic]);

let sderivades = fs.readFileSync(path.join(srcServer, "dif_generator.js"), "utf8") 
sderivades = packModule("dif_generator", [sderivades]);

let sequacions = fs.readFileSync(path.join(srcServer, "eqn_generator.js"), "utf8") 
sequacions = packModule("eqn_generator", [sequacions]);

let snumeric = fs.readFileSync(path.join(srcServer, "num_generator.js"), "utf8") 
snumeric = packModule("num_generator", [snumeric]);

let squimica = fs.readFileSync(path.join(srcServer, "che_generator.js"), "utf8") 
squimica = packModule("che_generator", [squimica]);

let sbu = fs.readFileSync(path.join(srcClient, "bingo_utils.js"), "utf8")  

let fakesocket = fs.readFileSync(path.join(srcClient, "fake-socket.js"), "utf8") 
fakesocket = windofy(fakesocket);

let theserver = fs.readFileSync(path.join(srcServer, "bingo_server.js"), "utf8") 
theserver = theserver.replace(/io\./g, 'ioServerLocal.')
theserver = windofy(theserver);

fs.writeFileSync(path.join(autoClient, "bingo_server.js"), theserver);

let theapp = fs.readFileSync(path.join(srcClient, "bingo_app.js"), "utf8") 
theapp = windofy(theapp);

theapp = pack(fakesocket, theserver, theapp)

fs.writeFileSync(path.join(autoClient, "utils.js"), sutils);
fs.writeFileSync(path.join(autoClient, "timer.js"), stimer);
fs.writeFileSync(path.join(autoClient, "bingo_classic.js"), sclassic);
fs.writeFileSync(path.join(autoClient, "dif_generator.js"), sderivades);
fs.writeFileSync(path.join(autoClient, "eqn_generator.js"), sequacions);
fs.writeFileSync(path.join(autoClient, "num_generator.js"), snumeric);
fs.writeFileSync(path.join(autoClient, "che_generator.js"), squimica);
fs.writeFileSync(path.join(autoClient, "bot_player.js"), botPlayer);
fs.writeFileSync(path.join(autoClient, "cartro.js"), cartro);

let bundle = [sutils, cartro, stimer, botPlayer, sclassic, sderivades, sequacions, snumeric, squimica, sbu, theapp]
bundle = bundle.join("\n");
fs.writeFileSync(path.join(dst, "bundle.js"), bundle);

const compilation = UglifyJS.minify(fs.readFileSync(path.join(dst, "bundle.js"), "utf8"), options)

if(compilation.error) {
    console.error(compilation.error)
    process.exit(1)
} else if(compilation.warnings) {
    console.log(compilation.warnings)
} 

// Append to the compilation code the library growl
const growl = fs.readFileSync(path.join(srcClient, "../lib/angular-growl.min.js"), "utf8")
compilation.code = growl + "\n" + compilation.code 
fs.writeFileSync(path.join(dst, "bundle.min.js"), compilation.code);
 
//Copy libs
fs.copyFileSync(path.join(srcClient, "../lib/socket.io.min.js"), path.join(dst, "socket.io.min.js"))

// Generate index files
let indexFile = fs.readFileSync(path.join(srcClient, "index.html"), "utf8")
indexFile = replaceBlock(indexFile, "<!--start:bundlejs-->", "<!--end:bundlejs-->", 
`
<script src="./bundle.min.js"></script>
`
);

indexFile = replaceBlock(indexFile, "<!--start:nodist-->", "<!--end:nodist-->", "")

// Replace libs
indexFile = indexFile.replace("../lib/socket.io.min.js", "./socket.io.min.js")
// Css by bundle
indexFile = indexFile.replace('<link rel="stylesheet" href="../lib/angular-growl.css">','')
indexFile = indexFile.replace('<link rel="stylesheet" href="./bingo.css">', '<link rel="stylesheet" href="./bundle.min.css">')

// Minify css
const f1 = path.join(srcClient, "bingo.css")
const f2 = path.join(srcClient, "../lib/angular-growl.css")
var uglifiedCss = uglifycss.processFiles(
    [ f1, f2 ],
    { maxLineLen: 500, expandVars: true }
);
fs.writeFileSync(path.join(dst, "bundle.min.css"), uglifiedCss);

// Index of classic, and flavours
fs.writeFileSync(path.join(dst, "equacions.html"), indexFile);
let index2 = indexFile.replace("window.BINGO_FLAVOR = 'eqn';", "window.BINGO_FLAVOR = 'cla';")
fs.writeFileSync(path.join(dst, "classic.html"), index2);
index2 = indexFile.replace("window.BINGO_FLAVOR = 'eqn';", "window.BINGO_FLAVOR = 'num';")
fs.writeFileSync(path.join(dst, "operacions.html"), index2);
index2 = indexFile.replace("window.BINGO_FLAVOR = 'eqn';", "window.BINGO_FLAVOR = 'dif';")
fs.writeFileSync(path.join(dst, "derivacio.html"), index2);
index2 = indexFile.replace("window.BINGO_FLAVOR = 'eqn';", "window.BINGO_FLAVOR = 'che';")
fs.writeFileSync(path.join(dst, "quimica.html"), index2);

console.log("BINGO BUILD FINISHED SUCCESFULLY");