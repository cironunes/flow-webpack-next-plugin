// @flow

export type Options = {
  failOnError: boolean;
  failOnErrorWatch: boolean;
  reportingSeverity: ReportingSeverity;
  printFlowOutput: boolean;
  flowPath: string;
  flowArgs: Array<string>;
  verbose: boolean;
  callback: CallbackType;
}

export type OptionalOptions = $Shape<Options>;

export const NOOP = _ => {};

/** option value => webpack collection name */
export const REPORTING_SEVERITY = {
  warning: 'warnings',
  error: 'errors'
};

export const isEnum = (items: string[]) => object =>
  (items: string[]).includes(object);

export const validateOptions = (options: Options) => {
  const reportingSeverityTypeName = Object.keys(REPORTING_SEVERITY)
    .map(item => `'${item}'`)
    .join(' | ');
  validateOption(
    options,
    'reportingSeverity',
    isEnum(Object.keys(REPORTING_SEVERITY)),
    reportingSeverityTypeName
  );
  validateOption(options, 'flowPath', isString, 'string');
  validateOption(options, 'flowArgs', isArrayOfStrings, 'Array<string>');
  validateOption(
    options,
    'callback',
    isFunction,
    '({successful: boolean, stdout: string, stderr: string}) => void'
  );
};

const validateOption = (
  options: Options,
  optionName: string,
  validationFunction: mixed => boolean,
  typeName: string
) => {
  const value = (options: any)[optionName];
  if (!validationFunction(value)) {
    throw new FlowWebpackPluginError(
      `Option '${optionName}' is not of required type '${typeName}'. Actual value is '${value}'`
    );
  }
};

const getLocalFlowPath = (): string => {
  try {
    return require.main.require('flow-bin');
  } catch (e) {
    try {
      return require('flow-bin');
    } catch (e) {
      const error: Error & { cause: mixed } = (new FlowWebpackPluginError(
        "`flow` can't be found. Please either install it (`npm install --save-dev flow-bin`) or set `flowPath` option."
      ): any);
      error.cause = e;
      throw error;
    }
  }
};

const isFunction = (object: mixed) => typeof object === 'function';

const isString = (object: mixed): boolean =>
  typeof object === 'string' || object instanceof String;

export const prefixLines = (prefix: string, lines: string): string =>
  lines
    .split(/\r?\n/)
    .map(line => prefix + ': ' + line)
    .join(EOL) + EOL;

export const pluginPrint = (...messages: Array<mixed>) => {
  console.log(PLUGIN_PREFIX, ...messages);
}

const isArrayOfStrings = (object: mixed) => Array.isArray(object) && object.every(item => isString(item));

const getDefaultFlowArgs = (): string[] => process.stdout.isTTY ? ['--color=always'] : [];

export const applyOptionsDefaults = (optionalOptions: OptionalOptions): Options => {
  const defaultOptions: Options = {
    failOnError: false,
    failOnErrorWatch: false,
    reportingSeverity: 'error',
    printFlowOutput: true,
    flowPath: getLocalFlowPath(),
    flowArgs: getDefaultFlowArgs(),
    verbose: false,
    callback: NOOP
  };
  return (Object.assign({}, defaultOptions, optionalOptions): any);
}

class FlowWebpackPluginError extends Error {}
