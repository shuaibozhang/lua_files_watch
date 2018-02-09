var target_xml_path
var source_lua_path
var xmlreader = require("xmlreader");
var fs = require("fs");

var fs = require('fs');
var path = require('path');

/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */
function fileDisplay(filePath, target_file, findFunc, norFunc) {
    //根据文件路径读取文件，返回文件列表
    fs.readdir(filePath, function (err, files) {
        if (err) {
            console.warn(err)
        } else {
            //遍历读取到的文件列表
            files.forEach(function (filename) {
                //获取当前文件的绝对路径
                var filedir = path.join(filePath, filename);
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                fs.stat(filedir, function (eror, stats) {
                    if (eror) {
                        console.warn('获取文件stats失败');
                    } else {
                        var isFile = stats.isFile();//是文件
                        var isDir = stats.isDirectory();//是文件夹
                        if (isFile) {
                            var targetPath = filedir.split(".")[0]
                            var temp = targetPath.split("/").pop()
                            if (temp == target_file){
                                findFunc(filedir)
                            }

                            if (norFunc){
                                norFunc(filedir)
                            }
                        }
                        if (isDir) {
                            fileDisplay(filedir, target_file, findFunc);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                        }
                    }
                })
            });
        }
    });
}


function findErrorFor(path) {
    var luaArray = new Array()
    var xmlArray = new Array()
    var state = 0
    function dealWithXml(xmlPath) {
        const readline = require('readline')
        const r1 = readline.createInterface({
            input: fs.createReadStream(xmlPath)
        });

        r1.on('line', (str) => {
            var reg = /"@\w+"/g;
            var reg2 = /'@\w+'/g;
            var math1 = str.match(reg)
            var math2 = str.match(reg2)
            if (math1) {
                xmlArray.push(math1)
            }

            if (math2) {
                xmlArray.push(math2)
            }
        });

        r1.on('close', () => {
            
            state = state + 1
            finalDealFunc()
        });
    }
    function dealWithFile(luapath) {
        const readline = require('readline')
        const r1 = readline.createInterface({
            input: fs.createReadStream(luapath)
        });

        r1.on('line', (str) => {
            var reg = /"@\w+"/g;
            var reg2 = /'@\w+'/g;
            var math1 = str.match(reg)
            var math2 = str.match(reg2)
            if (math1) {
                luaArray.push(math1)
            }

            if (math2) {
                luaArray.push(math2)
            }
        });

        r1.on('close', () => {
            
            state = state + 1
            finalDealFunc()
        });
    }
    var finalDealFunc = function () {
        if (state == 2) {
            var xmlstring = xmlArray.toString()
            //console.log(xmlstring)
            var luaSet = null
            while (luaSet = luaArray.pop()) {
                var reg = /\w+/g;
                var math1 = luaSet.toString().match(reg)
      
                if (xmlstring.indexOf(math1) < 0){
                    console.log("can not find set: " + luaSet + " in " + path)
                }
            }
        }
    }
    dealWithFile(path, 0)
    var xml = path.split(".")[0]
    xml = xml.split("/").pop()
    fileDisplay("xmls/", xml, function (filedir) {
        console.log(filedir);
        dealWithXml(filedir, state)
    })
}

//findErrorFor("script/DLoginP.lua")
fileDisplay("script/", null, null, function (filepath) {
    findErrorFor(filepath)
})
