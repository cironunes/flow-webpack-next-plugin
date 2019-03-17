"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyOptionsDefaults = exports.pluginPrint = exports.prefixLines = exports.validateOptions = exports.isEnum = exports.REPORTING_SEVERITY = exports.NOOP = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var NOOP = function NOOP(_) {};
/** option value => webpack collection name */


exports.NOOP = NOOP;
var REPORTING_SEVERITY = {
  warning: 'warnings',
  error: 'errors'
};
exports.REPORTING_SEVERITY = REPORTING_SEVERITY;

var isEnum = function isEnum(items) {
  return function (object) {
    return items.includes(object);
  };
};

exports.isEnum = isEnum;

var validateOptions = function validateOptions(options) {
  var reportingSeverityTypeName = Object.keys(REPORTING_SEVERITY).map(function (item) {
    return "'".concat(item, "'");
  }).join(' | ');
  validateOption(options, 'reportingSeverity', isEnum(Object.keys(REPORTING_SEVERITY)), reportingSeverityTypeName);
  validateOption(options, 'flowPath', isString, 'string');
  validateOption(options, 'flowArgs', isArrayOfStrings, 'Array<string>');
  validateOption(options, 'callback', isFunction, '({successful: boolean, stdout: string, stderr: string}) => void');
};

exports.validateOptions = validateOptions;

var validateOption = function validateOption(options, optionName, validationFunction, typeName) {
  var value = options[optionName];

  if (!validationFunction(value)) {
    throw new FlowWebpackPluginError("Option '".concat(optionName, "' is not of required type '").concat(typeName, "'. Actual value is '").concat(value, "'"));
  }
};

var getLocalFlowPath = function getLocalFlowPath() {
  try {
    return require.main.require('flow-bin');
  } catch (e) {
    try {
      return require('flow-bin');
    } catch (e) {
      var error = new FlowWebpackPluginError("`flow` can't be found. Please either install it (`npm install --save-dev flow-bin`) or set `flowPath` option.");
      error.cause = e;
      throw error;
    }
  }
};

var isFunction = function isFunction(object) {
  return typeof object === 'function';
};

var isString = function isString(object) {
  return typeof object === 'string' || object instanceof String;
};

var prefixLines = function prefixLines(prefix, lines) {
  return lines.split(/\r?\n/).map(function (line) {
    return prefix + ': ' + line;
  }).join(EOL) + EOL;
};

exports.prefixLines = prefixLines;

var pluginPrint = function pluginPrint() {
  var _console;

  for (var _len = arguments.length, messages = new Array(_len), _key = 0; _key < _len; _key++) {
    messages[_key] = arguments[_key];
  }

  (_console = console).log.apply(_console, [PLUGIN_PREFIX].concat(messages));
};

exports.pluginPrint = pluginPrint;

var isArrayOfStrings = function isArrayOfStrings(object) {
  return Array.isArray(object) && object.every(function (item) {
    return isString(item);
  });
};

var getDefaultFlowArgs = function getDefaultFlowArgs() {
  return process.stdout.isTTY ? ['--color=always'] : [];
};

var applyOptionsDefaults = function applyOptionsDefaults(optionalOptions) {
  var defaultOptions = {
    failOnError: false,
    failOnErrorWatch: false,
    reportingSeverity: 'error',
    printFlowOutput: true,
    flowPath: getLocalFlowPath(),
    flowArgs: getDefaultFlowArgs(),
    verbose: false,
    callback: NOOP
  };
  return Object.assign({}, defaultOptions, optionalOptions);
};

exports.applyOptionsDefaults = applyOptionsDefaults;

var FlowWebpackPluginError =
/*#__PURE__*/
function (_Error) {
  _inherits(FlowWebpackPluginError, _Error);

  function FlowWebpackPluginError() {
    _classCallCheck(this, FlowWebpackPluginError);

    return _possibleConstructorReturn(this, _getPrototypeOf(FlowWebpackPluginError).apply(this, arguments));
  }

  return FlowWebpackPluginError;
}(_wrapNativeSuper(Error));