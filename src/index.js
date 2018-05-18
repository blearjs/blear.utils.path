'use strict';

var array = require('blear.utils.array');
var access = require('blear.utils.access');

var pathSeperatorRE = /\//;
var endWidthSlashRE = /\/$/;
var clearProtocolStartRE = /^.+:/;
var autoProtocolStartRE = /^\/\//;
var absolutePathRE = /^\//;
var DOT_ONCE = '.';
var DOT_TWICE = '..';


/**
 * 路径标准化
 * @param path
 * @returns {string}
 */
var normalize = exports.normalize = function (path) {
    path = path
    // 去掉 query、hash
        .replace(/[?#].*$/, '')
        // 转换 \ 为 /
        .replace(/\\/g, '/')
        // 替换 //// => /
        .replace(/\/{2,}/g, '/');
    var pathList1 = path.split(pathSeperatorRE);
    var pathList2 = [];

    array.each(pathList1, function (_, item) {
        var index = pathList2.length - 1;
        var prev = pathList2[index];

        switch (item) {
            case DOT_ONCE:
                return;

            case DOT_TWICE:
                if (!prev || prev === DOT_ONCE || prev === DOT_TWICE) {
                    pathList2.push(item);
                } else {
                    pathList2.pop();
                }
                break;

            default:
                pathList2.push(item);
        }
    });

    if (pathList2.length === 1 && pathList2[0] === '') {
        return '/';
    }

    return pathList2.join('/');
};


/**
 * 是否为静态路径
 * @type {Function}
 * @return {Boolean}
 */
var isStatic = exports.isStatic = function (path) {
    return clearProtocolStartRE.test(path) || autoProtocolStartRE.test(path);
};


/**
 * 是否为绝对路径
 * @type {Function}
 * @return {Boolean}
 */
var isAbsolute = exports.isAbsolute = function (path) {
    return !isStatic(path) && absolutePathRE.test(path);
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
    if (!pathSeperatorRE.test(path)) {
        return '/';
    }

    path += endWidthSlashRE.test(path) ? '' : '/../';
    return normalize(path);
};


/**
 * 解决路径
 * @param from {String} 起始路径
 * @param to {String} 目标路径
 * @param ignore {Boolean} 是否忽略绝对路径
 * @returns {String}
 */
var resolve = function (from, to, ignore) {
    from = normalize(from);
    to = normalize(to);

    if (!ignore && (isStatic(to) || isAbsolute(to))) {
        return to;
    }

    from += endWidthSlashRE.test(from) ? '' : '/';
    return normalize(from + to);
};

var relative = function (from, to) {
    from = normalize(from);
    to = normalize(to);

    var fromStacks = from.split(pathSeperatorRE);
    var toStacks = to.split(pathSeperatorRE);
    var inRelative = false;
    var pathList = [];

    array.each(toStacks, function (index, toItem) {
        var fromItem = fromStacks[index];

        // 已确定相对关系
        if (inRelative) {
            if (fromItem) {
                pathList.push('..');
            } else {
                pathList.push(toItem);
            }
        }
        // 未确定相对关系
        else {
            // 路点相同
            if (fromItem === toItem) {
                pathList.push('.');
            }
            // 路点不同
            else {
                inRelative = true;
                pathList.push(toItem);
            }
        }
    });

    while (pathList.length < fromStacks.length) {
        pathList.push('..');
    }

    return normalize(pathList.join('/'));
};


/**
 * 解决路径
 * @param from {String} 起始路径
 * @param to {String} 目标路径
 * @returns {String}
 */
exports.resolve = function (from, to/*arguments*/) {
    var args = access.args(arguments);
    var current = 1;
    var end = args.length;
    var ret = args[0];

    while (current < end) {
        ret = resolve(ret, args[current], false);
        current++;
    }

    return ret;
};


/**
 * 合并路径
 * @param from {String} 起始路径
 * @param to {String} 目标路径
 * @returns {String}
 */
exports.join = function (from, to/*arguments*/) {
    var args = access.args(arguments);
    var current = 1;
    var end = args.length;
    var ret = args[0];

    while (current < end) {
        ret = resolve(ret, args[current], true);
        current++;
    }

    return ret;
};


exports.relative = function (from, to/*arguments*/) {
    var args = access.args(arguments);
    var current = 1;
    var end = args.length;
    var ret = args[0];

    while (current < end) {
        ret = relative(ret, args[current]);
        current++;
    }

    return ret;
};
