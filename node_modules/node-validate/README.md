node-validate
=============

Heavily inspired by (stolen from) [validator](https://github.com/chriso/validator.js) and [express-validator](https://github.com/ctavan/express-validator).

Installation
------------

```js
$ npm install node-validate
```

Usage
---

```js
var v = validate().isEmail('foo', 'Must provide valid email').isLength('bar', 6, 'Password must be at least six letter');
console.log(v.errors);
//=> ['Must provide valid email', 'Password must be at least six letters']
```
