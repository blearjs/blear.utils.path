'use strict';

var array = require('blear.utils.array');

var rePathQuerystringHashstring = /[?#].*$/;
var reThisPath = /\/\.\//g;
var rePathSep = /\//;
var reStartWidthSlash = /^\//;
var reEndWidthSlash = /\/$/;
var reMoreSlash = /\/{2,}/;
var reEndThis = /\/.$/;
var reStaticPath = /^([a-z\d_-]+:)?\/\//i;
var reAbsolutePath = /^\//;
var THIS_PATH_FLAG = '.';
var LAST_PATH_FLAG = '..';


/**
 * 路径标准化
 * @param path
 * @returns {string}
 */
var normalize = exports.normalize = function (path) {
    path = path
    // 去掉 query、hash
        .replace(rePathQuerystringHashstring, '')
        // 去掉 /{2,}
        .replace(reMoreSlash, '/')
        // 去掉 ./
        .replace(reThisPath, '/')
        // 去掉末尾 /.
        .replace(reEndThis, '/');

    var pathList = path.split(rePathSep);
    var lastItem = '';
    var pathList2 = [];
    var slashFlag = '/';
    var startWidthSlash = reStartWidthSlash.test(path);
    var endWidthSlash = reEndWidthSlash.test(path);

    array.each(pathList, function (index, item) {
        if (item === LAST_PATH_FLAG && lastItem && lastItem !== LAST_PATH_FLAG) {
            endWidthSlash = true;
            pathList2.pop();
        } else {
            pathList2.push(item);
        }

        if (index) {
            lastItem = item;
        }
    });

    path = pathList2.join(slashFlag);

    if (startWidthSlash && !reStartWidthSlash.test(path)) {
        path = slashFlag + path;
    }

    if (endWidthSlash && !reEndWidthSlash.test(path)) {
        path += slashFlag;
    }

    return path;
};


/**
 * 是否为静态路径
 * @type {Function}
 * @return {Boolean}
 */
var isStatic = exports.isStatic = function (path) {
    return reStaticPath.test(path);
};


/**
 * 是否为绝对路径
 * @type {Function}
 * @return {Boolean}
 */
var isAbsolute = exports.isAbsolute = function (path) {
    return !isStatic(path) && reAbsolutePath.test(path);
};


/**
 * 是否为相对路径
 * @type {Function}
 * @return {Boolean}
 */
var isRelative = exports.isRelative = function (path) {
    return !isStatic(path) && !isAbsolute(path);
};


/**
 * 获取路径的目录
 * @param path
 */
var dirname = exports.dirname = function (path) {
    if (!rePathSep.test(path)) {
        return '/';
    }

    path += reEndWidthSlash.test(path) ? '' : '/../';
    return normalize(path);
};


/**
 * 合并路径
 * @param from {String} 起始路径
 * @param to {String} 目标路径
 * @returns {String}
 */
exports.join = function (from, to) {
    from = normalize(from);
    to = normalize(to);

    // 如果 to 为绝对，则直接返回
    if (isAbsolute(to)) {
        return to;
    }

    var fromDirname = dirname(from);

    return normalize(fromDirname + to);
};