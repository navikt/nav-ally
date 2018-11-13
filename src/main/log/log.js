exports.log = function(obj, args) {
  __log(console.log, obj);
  __log(console.log, args);
};

exports.error = function(obj, args) {
  __log(console.error, obj);
  __log(console.error, args);
};

exports.trace = function(obj, args) {
  __log(console.error, obj);
  __log(console.error, args);
  __log(console.error, console.trace());
};

exports.warn = function(obj, args) {
  __log(console.warn, obj);
  __log(console.warn, args);
};

function __log(callback, obj) {
  if (!callback) {
    console.error('Cannot log without a callback.');
    console.trace();
    return;
  }

  if (Array.isArray(obj)) {
    __loop(obj, callback);
  } else {
    if (obj) callback(obj);
  }
}

function __loop(obj, callback) {
  obj.forEach(str => callback(str));
}
