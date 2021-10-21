import { __values } from "tslib";
var OrmUtils = /** @class */ (function () {
    function OrmUtils() {
    }
    // -------------------------------------------------------------------------
    // Public methods
    // -------------------------------------------------------------------------
    /**
     * Chunks array into pieces.
     */
    OrmUtils.chunk = function (array, size) {
        return Array.from(Array(Math.ceil(array.length / size)), function (_, i) {
            return array.slice(i * size, i * size + size);
        });
    };
    OrmUtils.splitClassesAndStrings = function (clsesAndStrings) {
        return [
            (clsesAndStrings).filter(function (cls) { return typeof cls !== "string"; }),
            (clsesAndStrings).filter(function (str) { return typeof str === "string"; }),
        ];
    };
    OrmUtils.groupBy = function (array, propertyCallback) {
        return array.reduce(function (groupedArray, value) {
            var key = propertyCallback(value);
            var grouped = groupedArray.find(function (i) { return i.id === key; });
            if (!grouped) {
                grouped = { id: key, items: [] };
                groupedArray.push(grouped);
            }
            grouped.items.push(value);
            return groupedArray;
        }, []);
    };
    OrmUtils.uniq = function (array, criteriaOrProperty) {
        return array.reduce(function (uniqueArray, item) {
            var found = false;
            if (criteriaOrProperty instanceof Function) {
                var itemValue_1 = criteriaOrProperty(item);
                found = !!uniqueArray.find(function (uniqueItem) { return criteriaOrProperty(uniqueItem) === itemValue_1; });
            }
            else if (typeof criteriaOrProperty === "string") {
                found = !!uniqueArray.find(function (uniqueItem) { return uniqueItem[criteriaOrProperty] === item[criteriaOrProperty]; });
            }
            else {
                found = uniqueArray.indexOf(item) !== -1;
            }
            if (!found)
                uniqueArray.push(item);
            return uniqueArray;
        }, []);
    };
    // Checks if it's an object made by Object.create(null), {} or new Object()
    OrmUtils.isPlainObject = function (item) {
        if (item === null || item === undefined) {
            return false;
        }
        return !item.constructor || item.constructor === Object;
    };
    OrmUtils.mergeArrayKey = function (target, key, value, memo) {
        // Have we seen this before?  Prevent infinite recursion.
        if (memo.has(value)) {
            target[key] = memo.get(value);
            return;
        }
        if (value instanceof Promise) {
            // Skip promises entirely.
            // This is a hold-over from the old code & is because we don't want to pull in
            // the lazy fields.  Ideally we'd remove these promises via another function first
            // but for now we have to do it here.
            return;
        }
        if (!this.isPlainObject(value) && !Array.isArray(value)) {
            target[key] = value;
            return;
        }
        if (!target[key]) {
            target[key] = Array.isArray(value) ? [] : {};
        }
        memo.set(value, target[key]);
        this.merge(target[key], value, memo);
        memo.delete(value);
    };
    OrmUtils.mergeObjectKey = function (target, key, value, memo) {
        var _a, _b, _c;
        // Have we seen this before?  Prevent infinite recursion.
        if (memo.has(value)) {
            Object.assign(target, (_a = {}, _a[key] = memo.get(value), _a));
            return;
        }
        if (value instanceof Promise) {
            // Skip promises entirely.
            // This is a hold-over from the old code & is because we don't want to pull in
            // the lazy fields.  Ideally we'd remove these promises via another function first
            // but for now we have to do it here.
            return;
        }
        if (!this.isPlainObject(value) && !Array.isArray(value)) {
            Object.assign(target, (_b = {}, _b[key] = value, _b));
            return;
        }
        if (!target[key]) {
            Object.assign(target, (_c = {}, _c[key] = Array.isArray(value) ? [] : {}, _c));
        }
        memo.set(value, target[key]);
        this.merge(target[key], value, memo);
        memo.delete(value);
    };
    OrmUtils.merge = function (target, source, memo) {
        var e_1, _a;
        if (memo === void 0) { memo = new Map(); }
        if (this.isPlainObject(target) && this.isPlainObject(source)) {
            try {
                for (var _b = __values(Object.keys(source)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var key = _c.value;
                    this.mergeObjectKey(target, key, source[key], memo);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        if (Array.isArray(target) && Array.isArray(source)) {
            for (var key = 0; key < source.length; key++) {
                this.mergeArrayKey(target, key, source[key], memo);
            }
        }
    };
    /**
     * Deep Object.assign.
     */
    OrmUtils.mergeDeep = function (target) {
        var e_2, _a;
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        if (!sources.length) {
            return target;
        }
        try {
            for (var sources_1 = __values(sources), sources_1_1 = sources_1.next(); !sources_1_1.done; sources_1_1 = sources_1.next()) {
                var source = sources_1_1.value;
                OrmUtils.merge(target, source);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (sources_1_1 && !sources_1_1.done && (_a = sources_1.return)) _a.call(sources_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return target;
    };
    /**
     * Deep compare objects.
     *
     * @see http://stackoverflow.com/a/1144249
     */
    OrmUtils.deepCompare = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var i, l, leftChain, rightChain;
        if (arguments.length < 1) {
            return true; // Die silently? Don't know how to handle such case, please help...
            // throw "Need two or more arguments to compare";
        }
        for (i = 1, l = arguments.length; i < l; i++) {
            leftChain = []; // Todo: this can be cached
            rightChain = [];
            if (!this.compare2Objects(leftChain, rightChain, arguments[0], arguments[i])) {
                return false;
            }
        }
        return true;
    };
    /**
     * Check if two entity-id-maps are the same
     */
    OrmUtils.compareIds = function (firstId, secondId) {
        if (firstId === undefined || firstId === null || secondId === undefined || secondId === null)
            return false;
        // Optimized version for the common case
        if (((typeof firstId.id === "string" && typeof secondId.id === "string") ||
            (typeof firstId.id === "number" && typeof secondId.id === "number")) &&
            Object.keys(firstId).length === 1 &&
            Object.keys(secondId).length === 1) {
            return firstId.id === secondId.id;
        }
        return OrmUtils.deepCompare(firstId, secondId);
    };
    /**
     * Transforms given value into boolean value.
     */
    OrmUtils.toBoolean = function (value) {
        if (typeof value === "boolean")
            return value;
        if (typeof value === "string")
            return value === "true" || value === "1";
        if (typeof value === "number")
            return value > 0;
        return false;
    };
    /**
     * Composes an object from the given array of keys and values.
     */
    OrmUtils.zipObject = function (keys, values) {
        return keys.reduce(function (object, column, index) {
            object[column] = values[index];
            return object;
        }, {});
    };
    /**
     * Compares two arrays.
     */
    OrmUtils.isArraysEqual = function (arr1, arr2) {
        if (arr1.length !== arr2.length)
            return false;
        return arr1.every(function (element) {
            return arr2.indexOf(element) !== -1;
        });
    };
    // -------------------------------------------------------------------------
    // Private methods
    // -------------------------------------------------------------------------
    OrmUtils.compare2Objects = function (leftChain, rightChain, x, y) {
        var p;
        // remember that NaN === NaN returns false
        // and isNaN(undefined) returns true
        if (Number.isNaN(x) && Number.isNaN(y))
            return true;
        // Compare primitives and functions.
        // Check if both arguments link to the same object.
        // Especially useful on the step where we compare prototypes
        if (x === y)
            return true;
        // Unequal, but either is null or undefined (use case: jsonb comparasion)
        // PR #3776, todo: add tests
        if (x === null || y === null || x === undefined || y === undefined)
            return false;
        // Fix the buffer compare bug.
        // See: https://github.com/typeorm/typeorm/issues/3654
        if ((typeof x.equals === "function" || x.equals instanceof Function) && x.equals(y))
            return true;
        // Works in case when functions are created in constructor.
        // Comparing dates is a common scenario. Another built-ins?
        // We can even handle functions passed across iframes
        if ((typeof x === "function" && typeof y === "function") ||
            (x instanceof Date && y instanceof Date) ||
            (x instanceof RegExp && y instanceof RegExp) ||
            (x instanceof String && y instanceof String) ||
            (x instanceof Number && y instanceof Number))
            return x.toString() === y.toString();
        // At last checking prototypes as good as we can
        if (!(x instanceof Object && y instanceof Object))
            return false;
        if (x.isPrototypeOf(y) || y.isPrototypeOf(x))
            return false;
        if (x.constructor !== y.constructor)
            return false;
        if (x.prototype !== y.prototype)
            return false;
        // Check for infinitive linking loops
        if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1)
            return false;
        // Quick checking of one object being a subset of another.
        // todo: cache the structure of arguments[0] for performance
        for (p in y) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                return false;
            }
        }
        for (p in x) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                return false;
            }
            switch (typeof (x[p])) {
                case "object":
                case "function":
                    leftChain.push(x);
                    rightChain.push(y);
                    if (!this.compare2Objects(leftChain, rightChain, x[p], y[p])) {
                        return false;
                    }
                    leftChain.pop();
                    rightChain.pop();
                    break;
                default:
                    if (x[p] !== y[p]) {
                        return false;
                    }
                    break;
            }
        }
        return true;
    };
    return OrmUtils;
}());
export { OrmUtils };

//# sourceMappingURL=OrmUtils.js.map
