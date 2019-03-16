"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyOptionsDefaults = exports.pluginPrint = exports.prefixLines = exports.validateOptions = exports.isEnum = exports.REPORTING_SEVERITY = exports.NOOP = void 0;

const NOOP = _ => {};
/** option value => webpack collection name */


exports.NOOP = NOOP;
const REPORTING_SEVERITY = {
  warning: 'warnings',
  error: 'errors'
};
exports.REPORTING_SEVERITY = REPORTING_SEVERITY;

const isEnum = items => object => items.includes(object);

exports.isEnum = isEnum;

const validateOptions = options => {
  const reportingSeverityTypeName = Object.keys(REPORTING_SEVERITY).map(item => `'${item}'`).join(' | ');
  validateOption(options, 'reportingSeverity', isEnum(Object.keys(REPORTING_SEVERITY)), reportingSeverityTypeName);
  validateOption(options, 'flowPath', isString, 'string');
  validateOption(options, 'flowArgs', isArrayOfStrings, 'Array<string>');
  validateOption(options, 'callback', isFunction, '({successful: boolean, stdout: string, stderr: string}) => void');
};

exports.validateOptions = validateOptions;

const validateOption = (options, optionName, validationFunction, typeName) => {
  const value = options[optionName];

  if (!validationFunction(value)) {
    throw new FlowWebpackPluginError(`Option '${optionName}' is not of required type '${typeName}'. Actual value is '${value}'`);
  }
};

const getLocalFlowPath = () => {
  try {
    return require.main.require('flow-bin');
  } catch (e) {
    try {
      return require('flow-bin');
    } catch (e) {
      const error = new FlowWebpackPluginError("`flow` can't be found. Please either install it (`npm install --save-dev flow-bin`) or set `flowPath` option.");
      error.cause = e;
      throw error;
    }
  }
};

const isFunction = object => typeof object === 'function';

const isString = object => typeof object === 'string' || object instanceof String;

const prefixLines = (prefix, lines) => lines.split(/\r?\n/).map(line => prefix + ': ' + line).join(EOL) + EOL;

exports.prefixLines = prefixLines;

const pluginPrint = (...messages) => {
  console.log(PLUGIN_PREFIX, ...messages);
};

exports.pluginPrint = pluginPrint;

const isArrayOfStrings = object => Array.isArray(object) && object.every(item => isString(item));

const getDefaultFlowArgs = () => process.stdout.isTTY ? ['--color=always'] : [];

const applyOptionsDefaults = optionalOptions => {
  const defaultOptions = {
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

class FlowWebpackPluginError extends Error {}