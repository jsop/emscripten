/*

  Abstract C API for accessing the host javascript environment.

  This file defines a C-level API for introspecting and interacting with
  the host javascript environment.  JS objects are represented to C code
  as opaque integer handled, which can be passed to functions that implement
  the primitive js operations.

  Integer zero is never a valid handle, and is used to indicate various
  error conditions.  If a call into this API returns zero, the caller should
  check for an exception by calling emjs_get_error() and, after handling it,
  call emjs_set_error() to clear it.

*/

#include <stdlib.h>

#ifndef EMJS_H
#define EMJS_H

typedef int emjs_value;

#define EMJS_ERROR 0
#define EMJS_OK 1

typedef enum {
  EMJS_TYPE_ERROR = 0,
  EMJS_TYPE_UNDEFINED = 1,
  EMJS_TYPE_BOOLEAN = 2,
  EMJS_TYPE_NUMBER = 3,
  EMJS_TYPE_STRING = 4,
  EMJS_TYPE_OBJECT = 5,
  EMJS_TYPE_FUNCTION = 6
} emjs_type;

// Static handle values for singleton primitives.
#define EMJS_UNDEFINED ((emjs_value) 1)
#define EMJS_NULL ((emjs_value) 2)
#define EMJS_FALSE ((emjs_value) 3)
#define EMJS_TRUE ((emjs_value) 4)


// Release handle to a js value.
void emjs_free(emjs_value);

// Duplicate handle to a js value.
emjs_value emjs_dup(emjs_value);

// Load/store/delete a js value by name in global scope.
// Dotted names are accepted, so you can do e.g. "window.foo".
emjs_value emjs_get(char* dotted_name);
emjs_value emjs_set(char* dotted_name, emjs_value);
emjs_value emjs_delete(char* dotted_name);

// Load/store/delete/call a js value as a property on an object.
// The generic case accepts any js value for the property, and
// there are special-case helpers for string and integer properties.
emjs_value emjs_prop_get(emjs_value obj, emjs_value prop);
emjs_value emjs_prop_set(emjs_value obj, emjs_value prop, emjs_value value);
emjs_value emjs_prop_delete(emjs_value obj, emjs_value prop);
emjs_value emjs_prop_apply(emjs_value obj, emjs_value prop, emjs_value args);

emjs_value emjs_prop_get_int(emjs_value obj, int idx);
emjs_value emjs_prop_set_int(emjs_value obj, int idx, emjs_value value);
emjs_value emjs_prop_delete_int(emjs_value obj, int idx);
emjs_value emjs_prop_apply_int(emjs_value obj, int idx, emjs_value args);

emjs_value emjs_prop_get_str(emjs_value obj, char* name);
emjs_value emjs_prop_set_str(emjs_value obj, char* name, emjs_value value);
emjs_value emjs_prop_delete_str(emjs_value obj, char* name);
emjs_value emjs_prop_apply_str(emjs_value obj, char* name, emjs_value args);

// Create primitive js values of various types.
emjs_value emjs_make_str(const char*);
emjs_value emjs_make_strn(const char*, size_t);
emjs_value emjs_make_int32(int);
emjs_value emjs_make_double(double);
emjs_value emjs_make_bool(int);
emjs_value emjs_make_undefined(void);
emjs_value emjs_make_null(void);
emjs_value emjs_make_object(void);
emjs_value emjs_make_array(int size);

// Create a js callback that will execute a C function.
//
// The target function must accept a void* user-data pointer and a single
// emjs_value for the arguments array, and must return an emjs_value result.
// It may throw an error by calling emjs_set_error() and returning zero. 
// The argument and result handles will be freed after the callback completes;
// you can use emjs_dup if you want to maintain them.
emjs_value emjs_make_callback(emjs_value(*fun)(void*,emjs_value), void*);

// Deal with exceptions using an errno-like approach.
// If there was an exception then emjs_get_error() will return a handle
// to it; if there was no exception then it will return EMJS_UNDEFINED.
emjs_value emjs_get_error(void);
void emjs_set_error(emjs_value err);
void emjs_clear_error(void);

// Evaluate literal js code in global scope.
emjs_value emjs_eval(const char*);

// Call js value as a function, via fn.apply(ctx, args).
// XXX TODO: varargs support for developer convenience?
// XXX TODO: how to set 'this' context nicely?
emjs_value emjs_apply(emjs_value fn, emjs_value ctx, emjs_value args);

// Call js value as a constructor.
// XXX TODO: varargs support for developer convenience?
emjs_value emjs_new(emjs_value fn, emjs_value args);

// Introspect the type of a js value.
emjs_type emjs_typeof(emjs_value);

// Iterate the properties of a js value.
//
// These functions execute a callback with each property of the given
// object.  The callback should return zero to continue the loop and
// non-zero to break.  The handle to the property value will be freed
// at the end of the callback; use `emjs_dup` to persist it.
//  
// XXX TODO: It would be nice to use generators to do a pull-based approach
// here, with an API closer to C++-style iterators...
emjs_value emjs_iter_all(emjs_value obj, int (*fun)(void*,emjs_value), void*);
emjs_value emjs_iter_own(emjs_value obj, int (*fun)(void*,emjs_value), void*);

// Various operators.

int emjs_check(emjs_value value);

int emjs_op_eq(emjs_value lhs, emjs_value rhs);
int emjs_op_neq(emjs_value lhs, emjs_value rhs);
int emjs_op_equiv(emjs_value lhs, emjs_value rhs);
int emjs_op_nequiv(emjs_value lhs, emjs_value rhs);
int emjs_op_gt(emjs_value lhs, emjs_value rhs);
int emjs_op_lt(emjs_value lhs, emjs_value rhs);
int emjs_op_gteq(emjs_value lhs, emjs_value rhs);
int emjs_op_lteq(emjs_value lhs, emjs_value rhs);

emjs_value emjs_op_add(emjs_value lhs, emjs_value rhs);
emjs_value emjs_op_sub(emjs_value lhs, emjs_value rhs);
emjs_value emjs_op_mul(emjs_value lhs, emjs_value rhs);
emjs_value emjs_op_div(emjs_value lhs, emjs_value rhs);
emjs_value emjs_op_mod(emjs_value lhs, emjs_value rhs);
emjs_value emjs_op_uplus(emjs_value value);
emjs_value emjs_op_uminus(emjs_value value);

emjs_value emjs_op_bw_and(emjs_value lhs, emjs_value rhs);
emjs_value emjs_op_bw_or(emjs_value lhs, emjs_value rhs);
emjs_value emjs_op_bw_xor(emjs_value lhs, emjs_value rhs);
emjs_value emjs_op_bw_lshift(emjs_value lhs, emjs_value rhs);
emjs_value emjs_op_bw_rshift(emjs_value lhs, emjs_value rhs);
emjs_value emjs_op_bw_urshift(emjs_value lhs, emjs_value rhs);
emjs_value emjs_op_bw_neg(emjs_value value);

// Note: these can throw if you give bad types, e.g. "12 in 1".
// They will return zero in this case, which can only be distinguished
// from a result of 'false' by checking emjs_get_error() == EMJS_UNDEFINED;
int emjs_op_in(emjs_value lhs, emjs_value rhs);
int emjs_op_instanceof(emjs_value lhs, emjs_value rhs);

int emjs_length(emjs_value);

// Access primitive values from a js value.
int emjs_to_int32(emjs_value);
unsigned int emjs_to_uint32(emjs_value);
double emjs_to_double(emjs_value);
int emjs_to_str(emjs_value, char* buffer);
int emjs_to_strn(emjs_value, char* buffer, int maxlen);

// XXX TODO: macros for calling func, converting result, freeing handle?
// #define EMJS_AS_VOID(expr)
// #define EMJS_AS_INT32(expr)
// #define EMJS_AS_UINT32(expr)
// #define EMJS_AS_DOUBLE(expr)

#endif
