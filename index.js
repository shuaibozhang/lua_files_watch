var chokidar = require('chokidar')

var watcher = null
var ready = false
var ANDROIDFILESYS = "sdcard/Android/data/com.kzgj.heroes.jiancn/files/main/"

var createFunc = function (targetPath, callback) {
    var cmdStr = 'adb shell mkdir ' + targetPath
    var exec = require('child_process').exec;
    exec(cmdStr, function (err, stdout, stderr) {
        if (err) {
            console.log('get weather api error:' + stderr);
        } else {
            console.log('create dir: ' + targetPath);
            callback()
        }
    });
}

var pushFunc = function (path, targetPath) {
    var exec = require('child_process').exec;
    var cmdStr = 'adb push ' + path + ' ' + targetPath;
    console.log(cmdStr)
    exec(cmdStr, function (err, stdout, stderr) {
        if (err) {
            console.log('get weather api error:' + stderr);
        } else {

        }
    });
}

var pushAndroidFiled = function (path) {
    var exec = require('child_process').exec;
    var s = path.indexOf('script'); 
    var targetPath = path.slice(s)
    console.log(targetPath)
    targetPath = targetPath.split(".")[0]
    var temp = targetPath.split("/").pop()
    targetPath = targetPath.slice(0, targetPath.indexOf(temp))

    targetPath = ANDROIDFILESYS + targetPath
    
    var exec = require('child_process').exec;
    var cmdStr = 'adb shell ls ' + targetPath
    exec(cmdStr, function (err, stdout, stderr) {
        var commend = ("" + err)
        if (commend.indexOf("No such file or directory") >= 0) {
            createFunc(targetPath, function () {
                pushFunc(path, targetPath)
            })
        }
        else{
            pushFunc(path, targetPath)
        }

    });
}
var luawatch = function () {

    // 文件新增时
    function addFileListener(path_) {
        if (ready) {
            var arr = path_.split(".")
            var end = arr.pop()
            console.log('File', path_, 'has been added')
            if(end == "lua"){
                pushAndroidFiled(path_)
            }    
        }
    }
    function addDirecotryListener(path) {
        if (ready) {
            console.log('Directory', path, 'has been added')
        }
    }

    // 文件内容改变时
    function fileChangeListener(path_) {
        console.log('File', path_, 'has been changed')
        var arr = path_.split(".")
        var end = arr.pop()
        console.log('File', path_, 'has been added')
        if (end == "lua") {
            pushAndroidFiled(path_)
        }    
    }

    // 删除文件时，需要把文件里所有的用例删掉
    function fileRemovedListener(path_) {
        console.log('File', path_, 'has been removed')
    }

    // 删除目录时
    function directoryRemovedListener(path) {
        console.log('Directory', path, 'has been removed')
    }

    if (!watcher) {
        watcher = chokidar.watch('/Volumes/MacHDD/Projects/KongZhiGuiJi/GleeWork/Baby/Resources/script')
    }
    watcher
        .on('add', addFileListener)
        .on('addDir', addDirecotryListener)
        .on('change', fileChangeListener)
        .on('unlink', fileRemovedListener)
        .on('unlinkDir', directoryRemovedListener)
        .on('error', function (error) {
            console.log('Error happened', error);
        })
        .on('ready', function () {
            console.info('Initial scan complete. Ready for changes.');
            ready = true
        })
}

luawatch()