
var LibraryEMJS = {

  $EMJS__deps: [],

  $EMJS: {

    ERROR: 0,
    OK: 1,

    TYPE_UNDEFINED: 1,
    TYPE_BOOLEAN: 2,
    TYPE_NUMBER: 3,
    TYPE_STRING: 4,
    TYPE_OBJECT: 5,
    TYPE_FUNCTION: 6,

    UNDEFINED: 1,
    NULL: 2,
    FALSE: 3,
    TRUE: 4,

    refs: [undefined, undefined, null, false, true],
    free_refs: [],
    MAX_STATIC_REF: 4,

    last_error: undefined,

  },

  emjs_mkref__deps: ['$EMJS'],
  emjs_mkref: function(value) {
    if (value === undefined) {
      return 1;
    }
    if (value === null) {
      return 2;
    }
    if (value === false) {
      return 3;
    }
    if (value === true) {
      return 4;
    }
    var ref;
    if (EMJS.free_refs.length) {
      ref = EMJS.free_refs.pop();
    } else {
      ref = EMJS.refs.length;
    }
    EMJS.refs[ref] = value;
    return ref;
  },

  emjs_deref__deps: ['$EMJS'],
  emjs_deref: function(ref) {
    if (ref > EMJS.MAX_STATIC_REF && !EMJS.refs.hasOwnProperty(ref)) {
      throw new Error("invalid emjs ref: " + ref);
    }
    return EMJS.refs[ref];
  },

  emjs_free__deps: ['$EMJS'],
  emjs_free: function(ref) {
    if (ref > EMJS.MAX_STATIC_REF && !EMJS.refs.hasOwnProperty(ref)) {
      throw new Error("invalid emjs ref: " + ref);
    }
    if (ref > EMJS.MAX_STATIC_REF) {
      delete EMJS.refs[ref];
      EMJS.free_refs.push(ref);
    }
  },

  emjs_dup__deps: ['$EMJS', 'emjs_mkref', 'emjs_deref'],
  emjs_dup: function(ref) {
    if (ref > EMJS.MAX_STATIC_REF && !EMJS.refs.hasOwnProperty(ref)) {
      throw new Error("invalid emjs ref: " + ref);
    }
    if (ref <= EMJS.MAX_STATIC_REF) {
      return ref;
    }
    // XXX TODO: check if it's a valid handle
    return _emjs_mkref(_emjs_deref(ref));
  },

  emjs_get__deps: ['emjs_mkref'],
  emjs_get: function(nameptr) {
    try {
      var name = Pointer_stringify(nameptr);
      // XXX TODO: don't use eval for this
      var value = eval(name);
      return _emjs_mkref(value);
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_set__deps: ['emjs_mkref', 'emjs_deref'],
  emjs_set: function(nameptr, ref) {
    try {
      var name = Pointer_stringify(nameptr);
      var obj = _emjs_deref(ref);
      // XXX TODO: don't use eval for this
      // XXX TODO: this will not work for anything but literals...
      value = eval(name + " = " + obj);
      return EMJS.OK;
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_delete__deps: ['emjs_mkref'],
  emjs_delete: function(nameptr) {
    try {
      var name = Pointer_stringify(nameptr);
      eval("delete " + name);
      return EMJS.OK;
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_prop_get__deps: ['emjs_mkref', 'emjs_deref'],
  emjs_prop_get: function(objref, propref) {
    try {
      var obj = _emjs_deref(objref);
      var prop = _emjs_deref(propref);
      var res = obj[prop];
      return _emjs_mkref(res);
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_prop_set__deps: ['emjs_deref'],
  emjs_prop_set: function(objref, propref, valref) {
    try {
      var obj = _emjs_deref(objref);
      var prop = _emjs_deref(propref);
      var val = _emjs_deref(valref);
      obj[prop] = val;
      return EMJS.OK;
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_prop_delete__deps: ['emjs_deref'],
  emjs_prop_delete: function(objref, propref) {
    try {
      var obj = _emjs_deref(objref);
      var prop = _emjs_deref(propref);
      delete obj[prop];
      return EMJS.OK;
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_prop_get_int__deps: ['emjs_mkref', 'emjs_deref'],
  emjs_prop_get_int: function(objref, idx) {
    try {
      var obj = _emjs_deref(objref);
      var res = obj[idx];
      return _emjs_mkref(res);
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_prop_set_int__deps: ['emjs_deref'],
  emjs_prop_set_int: function(objref, idx, valref) {
    try {
      var obj = _emjs_deref(objref);
      var val = _emjs_deref(valref);
      obj[idx] = val;
      return EMJS.OK;
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_prop_delete_int__deps: ['emjs_deref'],
  emjs_prop_delete_int: function(objref, idx) {
    try {
      var obj = _emjs_deref(objref);
      delete obj[idx];
      return EMJS.OK;
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_prop_get_str__deps: ['emjs_mkref', 'emjs_deref'],
  emjs_prop_get_str: function(objref, nameptr) {
    try {
      var obj = _emjs_deref(objref);
      var name = Pointer_stringify(nameptr);
      var res = obj[name];
      return _emjs_mkref(res);
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_prop_set_str__deps: ['emjs_deref'],
  emjs_prop_set_str: function(objref, nameptr, valref) {
    try {
      var obj = _emjs_deref(objref);
      var name = Pointer_stringify(nameptr);
      var val = _emjs_deref(valref);
      obj[name] = val;
      return EMJS.OK;
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_prop_delete_str__deps: ['emjs_deref'],
  emjs_prop_delete_str: function(objref, nameptr) {
    try {
      var obj = _emjs_deref(objref);
      var name = Pointer_stringify(nameptr);
      delete obj[name];
      return EMJS.OK;
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_make_str__deps: ['emjs_mkref'],
  emjs_make_str: function(data) {
    try {
      var value = Pointer_stringify(data);
      return _emjs_mkref(value);
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_make_strn__deps: ['emjs_mkref'],
  emjs_make_strn: function(data, length) {
    try {
      var value = Pointer_stringify(data, length);
      return _emjs_mkref(value);
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_make_int32__deps: ['emjs_mkref'],
  emjs_make_int32: function(value) {
    return _emjs_mkref(value|0);
  },

  emjs_make_double__deps: ['emjs_mkref'],
  emjs_make_double: function(value) {
    return _emjs_mkref(+value);
  },

  emjs_make_bool__deps: ['emjs_mkref'],
  emjs_make_bool: function(value) {
    return _emjs_mkref(!!value);
  },

  emjs_make_undefined__deps: ['emjs_mkref'],
  emjs_make_undefined: function() {
    return _emjs_mkref(void 0);
  },

  emjs_make_null__deps: ['emjs_mkref'],
  emjs_make_null: function() {
    return _emjs_mkref(null);
  },

  emjs_make_object__deps: ['emjs_mkref'],
  emjs_make_object: function() {
    return _emjs_mkref({});
  },

  emjs_make_array__deps: ['emjs_mkref'],
  emjs_make_array: function(size) {
    try {
      return _emjs_mkref(new Array(size));
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_make_callback__deps: ['emjs_mkref', 'emjs_deref', 'emjs_free'],
  emjs_make_callback: function(fnptr, dataptr) {
    return _emjs_mkref(function() {
      // XXX TODO: should probably copy the arguments...
      var argref = _emjs_mkref(arguments);
      var resref = Runtime.dynCall("iii", fnptr, [dataptr, argref]);
      if (!resref) {
        throw EMJS.last_error;
      }
      var res = _emjs_deref(resref);
      _emjs_free(argref);
      _emjs_free(resref);
      return res
    });
  },

  emjs_get_error__deps: ['emjs_mkref'],
  emjs_get_error: function() {
    return _emjs_mkref(EMJS.last_error);
  },

  emjs_set_error__deps: ['emjs_deref'],
  emjs_set_error: function(errref) {
    if (!errref) {
      EMJS.last_error = undefined;
    } else {
      EMJS.last_error = _emjs_deref(errref);
    }
  },

  emjs_clear_error__deps: ['emjs_set_error'],
  emjs_clear_error: function() {
    return _emjs_set_error(EMJS.UNDEFINED)
  },

  emjs_eval__deps: ['emjs_mkref'],
  emjs_eval: function(expr_ptr) {
    try {
      var expr = Pointer_stringify(expr_ptr);
      var value = eval(name);
      return _emjs_mkref(value);
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_apply__deps: ['emjs_deref'],
  emjs_apply: function(fnref, ctxref, argsref) {
    try {
      var fn = _emjs_deref(fnref);
      var ctx = _emjs_deref(ctxref);
      var args = _emjs_deref(argsref);
      var res = fn.apply(ctx, args);
      return _emjs_mkref(res);
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_new__deps: ['emjs_deref'],
  emjs_new: function(fnref, argsref) {
    try {
      var fn = _emjs_deref(fnref);
      var args = _emjs_deref(argsref);
      // Ugh.  How to spread args array into new call?
      // Can we simulate `new` by hand using lower-level object API?
      // The below is just *awful*...
      var argsrc = ""
      for (var i=0; i<args.length; i++) {
        argsrc += "a" + i + ","
      }
      argsrc += "unused"
      var newsrc = "(function(" + argsrc + ") {";
      newsrc += "return new this(" + argsrc + "); })";
      newfun = eval(newsrc);
      var res = newfun.apply(fn, args);
      return _emjs_mkref(res);
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_typeof__deps: ['$EMJS', 'emjs_deref'],
  emjs_typeof: function(ref) {
    try {
      var obj = _emjs_deref(ref);
      var typstr = typeof obj;
      switch (typstr) {
        case "undefined":
          return EMJS.TYPE_UNDEFINED;
        case "boolean":
          return EMJS.TYPE_BOOLEAN;
        case "number":
          return EMJS.TYPE_NUMBER;
        case "string":
          return EMJS.TYPE_STRING;
        case "object":
          return EMJS.TYPE_OBJECT;
        case "function":
          return EMJS.TYPE_FUNCTION;
        default:
          throw new Error("unknown typeof string: " + typstr); 
      }
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_iter_all__deps: ['emjs_mkref', 'emjs_deref', 'emjs_free'],
  emjs_iter_all: function(objref, fnptr, dataptr) {
    try {
      var obj = _emjs_deref(objref);
      for (var k in obj) {
        var kref = _emjs_mkref(k);
        var doBreak = Runtime.dynCall("iii", fnptr, [dataptr, kref]);
        _emjs_free(kref);
        if (doBreak) { break; }
      }
      return EMJS.OK
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_iter_own__deps: ['emjs_mkref', 'emjs_deref', 'emjs_free'],
  emjs_iter_own: function(objref, fnptr, dataptr) {
    try {
      var obj = _emjs_deref(objref);
      for (var k in obj) {
        if (!obj.hasOwnProperty(k)) { continue; }
        var kref = _emjs_mkref(k);
        var doBreak = Runtime.dynCall("iii", fnptr, [dataptr, kref]);
        _emjs_free(kref);
        if (doBreak) { break; }
      }
      return EMJS.OK
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_check__deps: ['emjs_deref'],
  emjs_check: function(ref) {
    var obj = _emjs_deref(ref);
    return (!!obj)|0;
  },

  emjs_op_eq__deps: ['emjs_deref'],
  emjs_op_eq: function(lhsref, rhsref) {
    var lhs = _emjs_deref(lhsref);
    var rhs = _emjs_deref(rhsref);
    return (!!(lhs == rhs))|0;
  },

  emjs_op_neq__deps: ['emjs_deref'],
  emjs_op_neq: function(lhsref, rhsref) {
    var lhs = _emjs_deref(lhsref);
    var rhs = _emjs_deref(rhsref);
    return (!!(lhs != rhs))|0;
  },

  emjs_op_equiv__deps: ['emjs_deref'],
  emjs_op_equiv: function(lhsref, rhsref) {
    var lhs = _emjs_deref(lhsref);
    var rhs = _emjs_deref(rhsref);
    return (!!(lhs === rhs))|0;
  },

  emjs_op_nequiv__deps: ['emjs_deref'],
  emjs_op_nequiv: function(lhsref, rhsref) {
    var lhs = _emjs_deref(lhsref);
    var rhs = _emjs_deref(rhsref);
    return (!!(lhs !== rhs))|0;
  },

  emjs_op_gt__deps: ['emjs_deref'],
  emjs_op_gt: function(lhsref, rhsref) {
    var lhs = _emjs_deref(lhsref);
    var rhs = _emjs_deref(rhsref);
    return (!!(lhs > rhs))|0;
  },

  emjs_op_lt__deps: ['emjs_deref'],
  emjs_op_lt: function(lhsref, rhsref) {
    var lhs = _emjs_deref(lhsref);
    var rhs = _emjs_deref(rhsref);
    return (!!(lhs < rhs))|0;
  },

  emjs_op_gteq__deps: ['emjs_deref'],
  emjs_op_gteq: function(lhsref, rhsref) {
    var lhs = _emjs_deref(lhsref);
    var rhs = _emjs_deref(rhsref);
    return (!!(lhs >= rhs))|0;
  },

  emjs_op_lteq__deps: ['emjs_deref'],
  emjs_op_lteq: function(lhsref, rhsref) {
    var lhs = _emjs_deref(lhsref);
    var rhs = _emjs_deref(rhsref);
    return (!!(lhs <= rhs))|0;
  },

  emjs_op_add__deps: ['emjs_deref', 'emjs_mkref'],
  emjs_op_add: function(lhsref, rhsref) {
    var lhs = _emjs_deref(lhsref);
    var rhs = _emjs_deref(rhsref);
    var res = lhs + rhs;
    return _emjs_mkref(res);
  },

  emjs_op_sub__deps: ['emjs_deref', 'emjs_mkref'],
  emjs_op_sub: function(lhsref, rhsref) {
    var lhs = _emjs_deref(lhsref);
    var rhs = _emjs_deref(rhsref);
    var res = lhs - rhs;
    return _emjs_mkref(res);
  },

  emjs_op_mul__deps: ['emjs_deref', 'emjs_mkref'],
  emjs_op_mul: function(lhsref, rhsref) {
    var lhs = _emjs_deref(lhsref);
    var rhs = _emjs_deref(rhsref);
    var res = lhs * rhs;
    return _emjs_mkref(res);
  },

  emjs_op_div__deps: ['emjs_deref', 'emjs_mkref'],
  emjs_op_div: function(lhsref, rhsref) {
    var lhs = _emjs_deref(lhsref);
    var rhs = _emjs_deref(rhsref);
    var res = lhs / rhs;
    return _emjs_mkref(res);
  },

  emjs_op_mod__deps: ['emjs_deref', 'emjs_mkref'],
  emjs_op_mod: function(lhsref, rhsref) {
    var lhs = _emjs_deref(lhsref);
    var rhs = _emjs_deref(rhsref);
    var res = lhs % rhs;
    return _emjs_mkref(res);
  },

  emjs_op_uplus__deps: ['emjs_deref', 'emjs_mkref'],
  emjs_op_uplus: function(ref) {
    var obj = _emjs_deref(ref);
    var res = +obj;
    return _emjs_mkref(res);
  },

  emjs_op_uminus__deps: ['emjs_deref', 'emjs_mkref'],
  emjs_op_uminus: function(ref) {
    var obj = _emjs_deref(ref);
    var res = -obj;
    return _emjs_mkref(res);
  },

  emjs_op_bw_and__deps: ['emjs_deref', 'emjs_mkref'],
  emjs_op_bw_and: function(lhs, rhs) {
    var lhs = _emjs_deref(lhsref);
    var rhs = _emjs_deref(rhsref);
    var res = lhs & rhs;
    return _emjs_mkref(res);
  },

  emjs_op_bw_or__deps: ['emjs_deref', 'emjs_mkref'],
  emjs_op_bw_or: function(lhs, rhs) {
    var lhs = _emjs_deref(lhsref);
    var rhs = _emjs_deref(rhsref);
    var res = lhs | rhs;
    return _emjs_mkref(res);
  },

  emjs_op_bw_xor__deps: ['emjs_deref', 'emjs_mkref'],
  emjs_op_bw_xor: function(lhs, rhs) {
    var lhs = _emjs_deref(lhsref);
    var rhs = _emjs_deref(rhsref);
    var res = lhs ^ rhs;
    return _emjs_mkref(res);
  },

  emjs_op_bw_lshift__deps: ['emjs_deref', 'emjs_mkref'],
  emjs_op_bw_lshift: function(lhs, rhs) {
    var lhs = _emjs_deref(lhsref);
    var rhs = _emjs_deref(rhsref);
    var res = lhs << rhs;
    return _emjs_mkref(res);
  },

  emjs_op_bw_rshift__deps: ['emjs_deref', 'emjs_mkref'],
  emjs_op_bw_rshift: function(lhs, rhs) {
    var lhs = _emjs_deref(lhsref);
    var rhs = _emjs_deref(rhsref);
    var res = lhs >> rhs;
    return _emjs_mkref(res);
  },

  emjs_op_bw_urshift__deps: ['emjs_deref', 'emjs_mkref'],
  emjs_op_bw_urshift: function(lhs, rhs) {
    var lhs = _emjs_deref(lhsref);
    var rhs = _emjs_deref(rhsref);
    var res = lhs >>> rhs;
    return _emjs_mkref(res);
  },

  emjs_op_bw_neg__deps: ['emjs_deref', 'emjs_mkref'],
  emjs_op_bw_neg: function(ref) {
    var obj = _emjs_deref(ref);
    var res = ~obj;
    return _emjs_mkref(res);
  },

  emjs_op_in__deps: ['emjs_deref', 'emjs_mkref'],
  emjs_op_in: function(lhs, rhs) {
    try {
      var lhs = _emjs_deref(lhsref);
      var rhs = _emjs_deref(rhsref);
      var res = lhs in rhs;
      return _emjs_mkref(res);
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_op_instanceof__deps: ['emjs_deref', 'emjs_mkref'],
  emjs_op_instanceof: function(lhs, rhs) {
    try {
      var lhs = _emjs_deref(lhsref);
      var rhs = _emjs_deref(rhsref);
      var res = lhs instanceof rhs;
      return _emjs_mkref(res);
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_length__deps: ['emjs_deref'],
  emjs_length: function(ref) {
    try {
      var obj = _emjs_deref(ref);
      return obj.length|0;
    } catch (err) { EMJS.last_error = err; return EMJS.ERROR; }
  },

  emjs_to_int32__deps: ['emjs_deref'],
  emjs_to_int32: function(ref) {
    var obj = _emjs_deref(ref);
    return obj|0;
  },

  emjs_to_uint32__deps: ['emjs_deref'],
  emjs_to_uint32: function(ref) {
    var obj = _emjs_deref(ref);
    return obj >>> 0;
  },

  emjs_to_double__deps: ['emjs_deref'],
  emjs_to_double: function(ref) {
    var obj = _emjs_deref(ref);
    return +obj;
  },

  emjs_to_str__deps: ['emjs_deref'],
  emjs_to_str: function(ref, bufptr) {
    var string = "" + _emjs_deref(ref);
    // note: this adds a trailing null to the string.
    var array = intArrayFromString(string, false);
    var i = 0;
    while (i < array.length) {
      var chr = array[i];
      {{{ makeSetValue('bufptr', 'i', 'chr', 'i8') }}};
      i = i + 1;
    }
    return i;
  },

  emjs_to_strn__deps: ['emjs_deref'],
  emjs_to_strn: function(ref, bufptr, maxlen) {
    var string = "" + _emjs_deref(ref);
    // note: no trailing null added to the string.
    var array = intArrayFromString(string, true);
    var i = 0;
    while (i < array.length && i < maxlen) {
      var chr = array[i];
      {{{ makeSetValue('bufptr', 'i', 'chr', 'i8') }}};
      i = i + 1;
    }
    return i;
  }

};

mergeInto(LibraryManager.library, LibraryEMJS);

