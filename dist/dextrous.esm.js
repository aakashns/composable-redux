import { bindActionCreators, combineReducers, compose } from 'redux';

var ACTION_PREFIX = "@@dextrous/";

/** Prefix an action type to avoid collisions */
var actionType = function actionType(str) {
  return ACTION_PREFIX + str;
};

/** Action Types */
var SET = actionType("SET");
var RESET = actionType("RESET");

/**
 * Create a reducer that allows two actions:
 * 1. Changing the state to new value using 'SET'
 * 2. Setting the value back to the initialState using 'RESET'
 */
var makeReducer = function makeReducer(initialState) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var _ref = arguments[1];
    var type = _ref.type,
        payload = _ref.payload;

    switch (type) {
      case SET:
        return payload;
      case RESET:
        return initialState;
      default:
        return state;
    }
  };
};

/** Action Creators */
var setValue = function setValue(value) {
  return { type: SET, payload: value };
};
var resetValue = function resetValue() {
  return { type: RESET };
};

/** Key for storing the name of a reducer */
var NAME_KEY = "__NAME__";

/** Key for storing the whitelisted action types in a named reducer */
var WHITELIST_KEY = "__WHITELIST__";

/** Get the name of a named reducer */
var getReducerName = function getReducerName(reducer) {
  return reducer[NAME_KEY];
};

/** Directly set the name of reducer (not to be used directly) */
var setReducerName = function setReducerName(reducer, name) {
  return reducer[NAME_KEY] = name;
};

/** Get the whitelisted actions for a named reducer */
var getWhitelist = function getWhitelist(reducer) {
  return reducer[WHITELIST_KEY] || [];
};

/** Set the whitelisted actions for a named reducer */
var setWhitelist = function setWhitelist(reducer, whitelist) {
  return reducer[WHITELIST_KEY] = whitelist;
};

/**
 * Wrap a reducer to respond only to actions carrying the given name
 * @param reducer The reducer function to be wrapped
 * @param name Name to be given to the wrapped reducer
 * @param whitelist Action types to be handled even without a name
 */
var nameReducer = function nameReducer(reducer, name) {
  var whitelist = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  var namedReducer = function namedReducer(state, action) {
    if (state !== undefined && getReducerName(namedReducer) !== action.name && getWhitelist(namedReducer).indexOf(action.type) === -1) {
      return state;
    }
    return reducer(state, action);
  };
  setReducerName(namedReducer, name);
  setWhitelist(namedReducer, whitelist);
  return namedReducer;
};

/**
 * Given an dictionary of reducers, returns a new dictionary of reducers
 * named using the corresponding keys, by applying `nameReducer`.
 */
var nameReducers = function nameReducers(obj) {
  return Object.keys(obj).reduce(function (result, key) {
    result[key] = nameReducer(obj[key], key);
    return result;
  }, {});
};

/**
 * Name a dictionary of reducers using the keys, and create a single
 * reducer using combineReducers.
 */
var nameAndCombineReducers = compose(combineReducers, nameReducers);

/**
 * Given a reducer and an array of names, returns a dictionary of
 * named reducers wrapping the given reducer and carrying the
 * corresponding names.
 */
var makeNamedReducers = function makeNamedReducers(reducer, names) {
  return names.reduce(function (result, key) {
    result[key] = nameReducer(reducer, key);
    return result;
  }, {});
};

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/** 
 * Attach a name to an action, to target a named reducer 
 */
var nameAction = function nameAction(action, name) {
  return _extends({}, action, { name: name });
};
/**
 * Wrap an action creator to attach a name to the resulting action.
 */
var nameActionCreator = function nameActionCreator(actionCreator, name) {
  return function () {
    return nameAction(actionCreator.apply(undefined, arguments), name);
  };
};

/**
 * Given a dictionary of action creators and a name, create a new 
 * dictionary of action creators that product named actions.
 */
var nameActionCreators = function nameActionCreators(obj, name) {
  return Object.keys(obj).reduce(function (result, key) {
    result[key] = nameActionCreator(obj[key], name);
    return result;
  }, {});
};

/**
 * Drop-in replacement for `bindActionCreators` to add the given name
 * to the resulting actions. 
 */
var nameAndBindActionCreators = function nameAndBindActionCreators(actionCreators, name, dispatch) {
  return bindActionCreators(nameActionCreators(actionCreators, name), dispatch);
};

var _extends$1 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/** Action Types */
var EDIT = actionType("EDIT");
var REMOVE = actionType("REMOVE");

/**
 * Create a reducer that allows setting and removing entries
 * in an object, apart from setting/resetting the entire state.
 */
var makeObjectReducer = function makeObjectReducer() {
  var initialValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var defaultReducer = makeReducer(initialValue);
  return function (state, action) {
    switch (action.type) {
      case EDIT:
        return _extends$1({}, state, action.payload);
      case REMOVE:
        {
          var newState = _extends$1({}, state);
          action.payload.forEach(function (key) {
            return delete newState[key];
          });
          return newState;
        }
      default:
        return defaultReducer(state, action);
    }
  };
};

/** 
 * Reducer obtained using `makeObjectReducer` using the empty
 * object `{}` as the initial state.
 */
var objectReducer = makeObjectReducer();

/** Action Creators */
var editObject = function editObject(edits) {
  return { type: EDIT, payload: edits };
};
var removeKeys = function removeKeys(keys) {
  return { type: REMOVE, payload: keys };
};
var removeKey = function removeKey(key) {
  return removeKeys([key]);
};

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/** Action Types */
var ADD = actionType("ADD");

/**
 * Create a reducer that allows adding (and soon removing)
 * items from a list, apart from setting/resetting the entire state.
 */
var makeListReducer = function makeListReducer() {
  var initialState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var defaultReducer = makeReducer(initialState);
  return function (state, action) {
    switch (action.type) {
      case ADD:
        return [].concat(_toConsumableArray(state), _toConsumableArray(action.payload));
      case REMOVE:
        return state.filter(function (item) {
          return action.payload.indexOf(item) === -1;
        });
      default:
        return defaultReducer(state, action);
    }
  };
};

/** 
 * Reducer obtained using `makeObjectReducer` using the empty
 * object `{}` as the initial state.
 */
var listReducer = makeListReducer();

/** Action Creators */
var addItems = function addItems(items) {
  return { type: ADD, payload: items };
};
var addItem = function addItem(item) {
  return addItems([item]);
};
var removeItems = removeKeys;
var removeItem = removeKey;

var _extends$2 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var INIT = actionType("INIT");
var defaultKeyExtractor = function defaultKeyExtractor(action) {
  return action.key;
};

var makeMultiReducer = function makeMultiReducer(reducer) {
  var keyExtractor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultKeyExtractor;

  var multiReducer = function multiReducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    var key = keyExtractor(action);
    if (!key) return state;
    return _extends$2({}, state, _defineProperty({}, key, reducer(state[key], action)));
  };
  return multiReducer;
};

var makeMultiGetter = function makeMultiGetter(reducer) {
  return function (state, name) {
    return state[name] || reducer(undefined, { type: INIT });
  };
};

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/** Name a [reducer, { actionCreators }] pair */
var nameReducerAndCreators = function nameReducerAndCreators(_ref, name) {
  var _ref2 = _slicedToArray(_ref, 2),
      reducer = _ref2[0],
      actionCreators = _ref2[1];

  return [nameReducer(reducer, name), nameActionCreators(actionCreators, name)];
};

var narc = nameReducerAndCreators;

/** Create a named [reducer, { actionCreators }] pair for a normal reducer */
var makeNamedReducer = function makeNamedReducer(name, initialState) {
  return narc([makeReducer(initialState), { setValue: setValue, resetValue: resetValue }], name);
};

/** Create a named [reducer, { actionCreators }] pair for an object reducer */
var makeNamedObjectReducer = function makeNamedObjectReducer(name, initialState) {
  return narc([makeObjectReducer(initialState), { setValue: setValue, resetValue: resetValue, editObject: editObject, removeKey: removeKey, removeKeys: removeKeys }], name);
};

/** Create a named [reducer, { actionCreators }] pair for list reducer */
var makeNamedListReducer = function makeNamedListReducer(name, initialState) {
  return narc([makeListReducer(initialState), { setValue: setValue, resetValue: resetValue, addItem: addItem, addItems: addItems, removeItem: removeItem, removeItems: removeItems }], name);
};

/** Creates a named [multiReducer, { actions }] pair with an extra REMOVE action */
var makeNamedMultiReducer = function makeNamedMultiReducer(_ref3, name, keyExtractor) {
  var _ref4 = _slicedToArray(_ref3, 2),
      reducer = _ref4[0],
      actionCreators = _ref4[1];

  var multiReducer = makeMultiReducer(reducer, keyExtractor);
  var enhancedReducer = function enhancedReducer(state, action) {
    switch (action.type) {
      case REMOVE:
        return objectReducer(state, action);
      default:
        return multiReducer(state, action);
    }
  };
  return narc([enhancedReducer, actionCreators], name);
};

export { makeMultiReducer, makeMultiGetter, makeReducer, setValue, resetValue, nameReducer, nameAction, nameActionCreator, nameActionCreators, makeNamedReducers, nameReducers, nameAndCombineReducers, nameAndBindActionCreators, makeObjectReducer, editObject, removeKeys, objectReducer, makeListReducer, listReducer, addItem, addItems, removeItem, removeItems, nameReducerAndCreators, makeNamedReducer, makeNamedObjectReducer, makeNamedListReducer, makeNamedMultiReducer };
