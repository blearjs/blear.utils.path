/**
 * 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var path = require('../src/index.js');

describe('index.js', function () {
    it('.normalize', function (done) {
        expect(path.normalize('/')).toEqual('/');
        expect(path.normalize('/a/..')).toEqual('/');
        expect(path.normalize('//')).toEqual('/');
        expect(path.normalize('/./')).toEqual('/');
        expect(path.normalize('/a/b/c/..')).toEqual('/a/b/');
        expect(path.normalize('/a/b/c/.')).toEqual('/a/b/c/');
        expect(path.normalize('/a/b/c/../d/')).toEqual('/a/b/d/');
        expect(path.normalize('/a/b/c/./d/')).toEqual('/a/b/c/d/');
        done();
    });

    it('.isAbsolute', function () {
        expect(path.isAbsolute('/')).toEqual(true);
        expect(path.isAbsolute('./')).toEqual(false);
    });

    it('.dirname', function () {
        expect(path.dirname('a')).toEqual('/');
        expect(path.dirname('/')).toEqual('/');
        expect(path.dirname('./')).toEqual('./');
        expect(path.dirname('./a/b/c')).toEqual('./a/b/');
    });

    it('.join', function () {
        expect(path.join('/', '/')).toEqual('/');
        expect(path.join('./', '/')).toEqual('/');
        expect(path.join('./a/b/c', '..')).toEqual('./a/');
    });
});
