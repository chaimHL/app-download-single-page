
var pattern = {
  email: /^\S+?@\S+?\.\S+?$/,
  url: new RegExp("^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$", 'i')
};

const FORMAT_MAPPING = {
  "int": 'number',
  "bool": 'boolean',
  "double": 'number',
  "long": 'number'
}

function formatMessage(args, resources) {
  var defaultMessage = ['label']
  defaultMessage.forEach((item) => {
    if (args[item] === undefined) {
      args[item] = ''
    }
  })

  let str = resources
  for (let key in args) {
    let reg = new RegExp('{' + key + '}')
    str = str.replace(reg, args[key])
  }
  return str
}

function isEmptyValue(value, type) {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === 'string' && !value) {
    return true;
  }

  if (Array.isArray(value) && !value.length) {
    return true;
  }

  if (type === 'object' && !Object.keys(value).length) {
    return true;
  }

  return false;
}

const types = {
  integer(value) {
    return types.number(value) && parseInt(value, 10) === value;
  },
  string(value) {
    return typeof value === 'string';
  },
  number(value) {
    if (isNaN(value)) {
      return false;
    }
    return typeof value === 'number';
  },
  "boolean": function (value) {
    return typeof value === 'boolean';
  },
  "float": function (value) {
    return types.number(value) && !types.integer(value);
  },
  array(value) {
    return Array.isArray(value);
  },
  object(value) {
    return typeof value === 'object' && !types.array(value);
  },
  date(value) {
    var v
    if (value instanceof Date) {
      v = value;
    } else {
      v = new Date(value);
    }
    return typeof v.getTime === 'function' && typeof v.getMonth === 'function' && typeof v.getYear === 'function' && !isNaN(v.getTime());
  },
  timestamp(value) {
    if (!this.integer(value) || Math.abs(value).toString().length > 16) {
      return false
    }

    return this.date(value);
  },
  email(value) {
    return typeof value === 'string' && !!value.match(pattern.email) && value.length < 255;
  },
  url(value) {
    return typeof value === 'string' && !!value.match(pattern.url);
  },
  pattern(reg, value) {
    try {
      return new RegExp(reg).test(value);
    } catch (e) {
      return false;
    }
  },
  method(value) {
    return typeof value === 'function';
  }
}

class RuleValidator {

  constructor(message) {
    this._message = message
  }

  async validateRule(key, value, data, allData) {
    var result = null

    let rules = key.rules

    let hasRequired = rules.findIndex((item) => {
      return item.required
    })
    if (hasRequired < 0) {
      if (value === null || value === undefined) {
        return result
      }
      if (typeof value === 'string' && !value.length) {
        return result
      }
    }

    var message = this._message

    if (rules === undefined) {
      return message['default']
    }

    for (var i = 0; i < rules.length; i++) {
      let rule = rules[i]
      let vt = this._getValidateType(rule)

      if (key.label !== undefined) {
        Object.assign(rule, {
          label: key.label
        })
      }

      if (RuleValidatorHelper[vt]) {
        result = RuleValidatorHelper[vt](rule, value, message)
        if (result != null) {
          break
        }
      }

      if (rule.validateFunction) {
        result = await this.validateFunction(rule, value, data, allData, vt)
        if (result !== null) {
          break
        }
      }
    }

    return result
  }

  async validateFunction(rule, value, data, allData, vt) {
    let result = null
    try {
      let callbackMessage = null
      const res = await rule.validateFunction(rule, value, allData || data, (message) => {
        callbackMessage = message
      })
      if (callbackMessage || (typeof res === 'string' && res) || res === false) {
        result = this._getMessage(rule, callbackMessage || res, vt)
      }
    } catch (e) {
      result = this._getMessage(rule, e.message, vt)
    }
    return result
  }

  _getMessage(rule, message, vt) {
    return formatMessage(rule, message || rule.errorMessage || this._message[vt] || message['default'])
  }

  _getValidateType(rule) {
    // TODO
    var result = ''
    if (rule.required) {
      result = 'required'
    } else if (rule.format) {
      result = 'format'
    } else if (rule.range) {
      result = 'range'
    } else if (rule.maximum || rule.minimum) {
      result = 'rangeNumber'
    } else if (rule.maxLength || rule.minLength) {
      result = 'rangeLength'
    } else if (rule.pattern) {
      result = 'pattern'
    }
    return result
  }
}

const RuleValidatorHelper = {
  required(rule, value, message) {
    if (rule.required && isEmptyValue(value, rule.format || typeof value)) {
      return formatMessage(rule, rule.errorMessage || message.required);
    }

    return null
  },

  range(rule, value, message) {
    const { range, errorMessage } = rule;

    let list = new Array(range.length);
    for (let i = 0; i < range.length; i++) {
      const item = range[i];
      if (types.object(item) && item.value !== undefined) {
        list[i] = item.value;
      } else {
        list[i] = item;
      }
    }

    let result = false
    if (Array.isArray(value)) {
      result = (new Set(value.concat(list)).size === list.length);
    } else {
      if (list.indexOf(value) > -1) {
        result = true;
      }
    }

    if (!result) {
      return formatMessage(rule, errorMessage || message['enum']);
    }

    return null
  },

  rangeNumber(rule, value, message) {
    if (!types.number(value)) {
      return formatMessage(rule, rule.errorMessage || message.pattern.mismatch);
    }

    let { minimum, maximum, exclusiveMinimum, exclusiveMaximum } = rule;
    let min = exclusiveMinimum ? value <= minimum : value < minimum;
    let max = exclusiveMaximum ? value >= maximum : value > maximum;

    if (minimum !== undefined && min) {
      return formatMessage(rule, rule.errorMessage || message['number'].min)
    } else if (maximum !== undefined && max) {
      return formatMessage(rule, rule.errorMessage || message['number'].max)
    } else if (minimum !== undefined && maximum !== undefined && (min || max)) {
      return formatMessage(rule, rule.errorMessage || message['number'].range)
    }

    return null
  },

  rangeLength(rule, value, message) {
    if (!types.string(value) && !types.array(value)) {
      return formatMessage(rule, rule.errorMessage || message.pattern.mismatch);
    }

    let min = rule.minLength;
    let max = rule.maxLength;
    let val = value.length;

    if (min !== undefined && val < min) {
      return formatMessage(rule, rule.errorMessage || message['length'].min)
    } else if (max !== undefined && val > max) {
      return formatMessage(rule, rule.errorMessage || message['length'].max)
    } else if (min !== undefined && max !== undefined && (val < min || val > max)) {
      return formatMessage(rule, rule.errorMessage || message['length'].range)
    }

    return null
  },

  pattern(rule, value, message) {
    if (!types['pattern'](rule.pattern, value)) {
      return formatMessage(rule, rule.errorMessage || message.pattern.mismatch);
    }

    return null
  },

  format(rule, value, message) {
    var customTypes = Object.keys(types);
    var format = FORMAT_MAPPING[rule.format] ? FORMAT_MAPPING[rule.format] : rule.format;

    if (customTypes.indexOf(format) > -1) {
      if (!types[format](value)) {
        return formatMessage(rule, rule.errorMessage || message.types[format]);
      }
    }

    return null
  }
}

class SchemaValidator extends RuleValidator {

  constructor(schema, options) {
    super(SchemaValidator.message);

    this._schema = schema
    this._options = options || null
  }

  updateSchema(schema) {
    this._schema = schema
  }

  async validate(data, allData) {
    let result = this._checkFieldInSchema(data)
    if (!result) {
      result = await this.invokeValidate(data, false, allData)
    }
    return result.length ? result[0] : null
  }

  async validateAll(data, allData) {
    let result = this._checkFieldInSchema(data)
    if (!result) {
      result = await this.invokeValidate(data, true, allData)
    }
    return result
  }

  async validateUpdate(data, allData) {
    let result = this._checkFieldInSchema(data)
    if (!result) {
      result = await this.invokeValidateUpdate(data, false, allData)
    }
    return result.length ? result[0] : null
  }

  async invokeValidate(data, all, allData) {
    let result = []
    let schema = this._schema
    for (let key in schema) {
      let value = schema[key]
      let errorMessage = await this.validateRule(value, data[key], data, allData)
      if (errorMessage != null) {
        result.push({
          key,
          errorMessage
        })
      }
      if (!all) break
    }
    return result
  }

  async invokeValidateUpdate(data, all, allData) {
    let result = []
    for (let key in data) {
      let errorMessage = await this.validateRule(this._schema[key], data[key], data, allData)
      if (errorMessage != null) {
        result.push({
          key,
          errorMessage
        })
      }
      if (!all) break
    }
    return result
  }

  _checkFieldInSchema(data) {
    var keys = Object.keys(data)
    var keys2 = Object.keys(this._schema)
    if (new Set(keys.concat(keys2)).size === keys2.length) {
      return ''
    }
    return [{
      key: 'invalid',
      errorMessage: SchemaValidator.message['defaultInvalid']
    }]
  }
}

function Message() {
  return {
    default: '????????????',
    defaultInvalid: '??????????????????',
    required: '{label}??????',
    'enum': '{label}????????????',
    whitespace: '{label}????????????',
    date: {
      format: '{label}??????{value}????????????',
      parse: '{label}??????????????????,{value}??????',
      invalid: '{label}??????{value}??????'
    },
    types: {
      string: '{label}????????????',
      array: '{label}????????????',
      object: '{label}????????????',
      number: '{label}????????????',
      date: '{label}????????????',
      boolean: '{label}????????????',
      integer: '{label}????????????',
      float: '{label}????????????',
      regexp: '{label}??????',
      email: '{label}????????????',
      url: '{label}????????????'
    },
    length: {
      min: '??????{label}????????????{minLength}',
      max: '??????{label}????????????{maxLength}',
      range: '{label}????????????{minLength}???{maxLength}??????'
    },
    number: {
      min: '{label}????????????{minimum}',
      max: '{label}????????????{maximum}',
      range: '{label}????????????{minimum}and{maximum}??????'
    },
    pattern: {
      mismatch: '{label}???????????????'
    }
  };
}


SchemaValidator.message = new Message();

export default SchemaValidator
