/*
 * @copyright Microsoft Corporation. All rights reserved.
 */
true && A(); // A()
A() && true; // A()
false && A(); // false
A() && false; // false

true || A(); // true
A() || true; // true
false || A(); // A()
A() || false; // A()
