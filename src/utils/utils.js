const getMediaType = require('./mediatype')

function dateFormat(fmt = 'yyyy-MM-dd hh:mm:ss', date = new Date()) {
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'S+': date.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, String(date.getFullYear()).substr(4 - RegExp.$1.length));
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(String(o[k]).length)));
    }
  }
  return fmt;
};

function isFunction(param) {
  return typeof (param) === 'function'
}

function isObject(param) {
  return Object.prototype.toString.call(param) === '[object Object]'
}

function isRegExp(param) {
  return Object.prototype.toString.call(param) === '[object RegExp]'
}

function isArray(param) {
  return Array.isArray(param)
}

function getMimeType(suffix, encoding = 'charset=UTF-8') {
  let type = getMediaType(suffix)

  return encoding ? type + ';' + encoding : type
}

/**
 * 合并buffer
 * @param {*} buffers 
 */
function bufferConcat(buffers = []) {
  const totalLength = buffers.reduce((len, item) => len + item.length, 0)

  return Buffer.concat(buffers, totalLength)
}

function jsonParse(data) {
  let params = null

  try {
    params = JSON.parse(data)
  } catch (err) {

  }
  return params
}

function jsonStringify(data) {
  return JSON.stringify(JSON.stringify())
}

function deepClone(target) {
  let temp;

  if (typeof target === 'object') {
    if (Array.isArray(target)) {
      temp = [];
      for (let k in target) {
        temp.push(deepClone(target[k]))
      }
    } else if (target === null) {
      temp = null;
    } else if (target.constructor === RegExp) {
      temp = target;
    } else {
      temp = {};
      for (let k in target) {
        temp[k] = deepClone(target[k]);
      }
    }
  } else {
    temp = target;
  }
  return temp;
}

function merge() {
  var options, name, src, copy, copyIsArray, clone,
    target = arguments[0] || {},
    i = 1,
    length = arguments.length,
    deep = false;

  if (typeof target === "boolean") {
    deep = target;
    target = arguments[1] || {};
    i = 2;
  }

  if (typeof target !== "object" && !isFunction(target)) {
    target = {};
  }

  if (length === i) {
    target = this;
    --i;
  }

  for (; i < length; i++) {
    if ((options = arguments[i]) != null) {
      for (name in options) {
        src = target[name];
        copy = options[name];

        if (target === copy) {
          continue;
        }

        if (deep && copy && (isObject(copy) || (copyIsArray = isArray(copy)))) {
          if (copyIsArray) {
            copyIsArray = false;
            clone = src && isArray(src) ? src : [];
          } else {
            clone = src && isObject(src) ? src : {};
          }

          target[name] = merge(deep, clone, copy);

        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }

  return target;
}

// 把一个对象的属性引用到另一个对象里
function copyAttr(current, copy) {
  if (copy && current) {
    for (var k in copy) {
      current[k] = copy[k]
    }
  }
}

function convertArray(obj) {
  return Array.prototype.slice.call(obj)
}

// 把一些函数的this指定为一个固定的对象
function bindFixedThis(obj, fns = []) {
  if (Array.isArray(fns)) {
    return fns.map(fnc => {
      const newFnc = fnc.bind(obj)
      obj[fnc.name] = newFnc
      return newFnc
    })
  }
  Object.keys(fns).map(name => {
    const fnc = fns[name]
    const newFnc = fnc.bind(obj)
    obj[name] = newFnc
  })
}

module.exports = {
  dateFormat,
  isFunction,
  isObject,
  isRegExp,
  getMimeType,
  bufferConcat,
  jsonParse,
  jsonStringify,
  deepClone,
  merge,
  copyAttr,
  convertArray,
  bindFixedThis
}