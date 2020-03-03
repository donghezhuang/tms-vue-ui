"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Node = exports.components = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var option = {
  native: true
};
/**
 * 支持的组件类型
 */

var components = {
  title: {
    tag: 'h1',
    option: option
  },
  description: {
    tag: 'p',
    option: option
  },
  error: {
    tag: 'div',
    option: option
  },
  form: {
    tag: 'form',
    option: option
  },
  label: {
    tag: 'label',
    option: option
  },
  input: {
    tag: 'input',
    option: option
  },
  textarea: {
    tag: 'textarea',
    option: option
  },
  radio: {
    tag: 'input',
    option: option
  },
  radiogroup: {
    tag: 'div',
    option: option
  },
  select: {
    tag: 'select',
    option: option
  },
  option: {
    tag: 'option',
    option: option
  },
  checkbox: {
    tag: 'input',
    option: option
  },
  checkboxgroup: {
    tag: 'div',
    option: option
  },
  file: {
    tag: 'input',
    option: option
  },
  button: {
    tag: 'button',
    option: _objectSpread({}, option, {
      type: 'submit',
      label: 'Submit'
    })
  },
  jsondoc: {
    tag: 'tms-json-doc',
    option: option
  }
};
/**
 * 表单中的节点
 */

exports.components = components;

var Node =
/*#__PURE__*/
function () {
  function Node(vm, createElement, rawArgs) {
    (0, _classCallCheck2.default)(this, Node);
    this.vm = vm;
    this.createElement = createElement;
    this.rawArgs = rawArgs;
  }
  /**
   * 指定的组件选项
   *
   * @param {Object} extendingOptions 节点上要添加的属性
   * @param {Object} field 表单控件
   * @param {Object} item 表单控件的子控件
   */


  (0, _createClass2.default)(Node, [{
    key: "attrOrProps",
    value: function attrOrProps() {
      var extendingOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var field = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var item = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var rawOption = this.rawArgs.option;
      var attrName = rawOption.native ? 'attrs' : 'props';
      var options;

      if (typeof rawOption === 'function') {
        options = rawOption({
          vm: this.vm,
          field: field,
          item: item
        });
      } else {
        options = _objectSpread({}, rawOption, {
          native: undefined
        });
      }

      return (0, _defineProperty2.default)({}, attrName, _objectSpread({}, extendingOptions, {}, options));
    }
  }, {
    key: "createElem",
    value: function createElem() {
      var children = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var createElement = this.createElement;
      var attrOrProps = this.attrOrProps();
      var element = createElement(this.rawArgs.tag, attrOrProps, children);
      return element;
    }
  }]);
  return Node;
}();

exports.Node = Node;