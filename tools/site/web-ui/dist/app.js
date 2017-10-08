(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

class Container {
    constructor(registry, resolver = null) {
        this._registry = registry;
        this._resolver = resolver;
        this._lookups = {};
        this._factoryDefinitionLookups = {};
    }
    factoryFor(specifier) {
        let factoryDefinition = this._factoryDefinitionLookups[specifier];
        if (!factoryDefinition) {
            if (this._resolver) {
                factoryDefinition = this._resolver.retrieve(specifier);
            }
            if (!factoryDefinition) {
                factoryDefinition = this._registry.registration(specifier);
            }
            if (factoryDefinition) {
                this._factoryDefinitionLookups[specifier] = factoryDefinition;
            }
        }
        if (!factoryDefinition) {
            return;
        }
        return this.buildFactory(specifier, factoryDefinition);
    }
    lookup(specifier) {
        let singleton = this._registry.registeredOption(specifier, 'singleton') !== false;
        if (singleton && this._lookups[specifier]) {
            return this._lookups[specifier];
        }
        let factory = this.factoryFor(specifier);
        if (!factory) {
            return;
        }
        if (this._registry.registeredOption(specifier, 'instantiate') === false) {
            return factory.class;
        }
        let object = factory.create();
        if (singleton && object) {
            this._lookups[specifier] = object;
        }
        return object;
    }
    defaultInjections(specifier) {
        return {};
    }
    buildInjections(specifier) {
        let hash = this.defaultInjections(specifier);
        let injections = this._registry.registeredInjections(specifier);
        let injection;
        for (let i = 0; i < injections.length; i++) {
            injection = injections[i];
            hash[injection.property] = this.lookup(injection.source);
        }
        return hash;
    }
    buildFactory(specifier, factoryDefinition) {
        let injections = this.buildInjections(specifier);
        return {
            class: factoryDefinition,
            create(options) {
                let mergedOptions = Object.assign({}, injections, options);
                return factoryDefinition.create(mergedOptions);
            }
        };
    }
}

class Registry {
    constructor(options) {
        this._registrations = {};
        this._registeredOptions = {};
        this._registeredInjections = {};
        if (options && options.fallback) {
            this._fallback = options.fallback;
        }
    }
    register(specifier, factoryDefinition, options) {
        this._registrations[specifier] = factoryDefinition;
        if (options) {
            this._registeredOptions[specifier] = options;
        }
    }
    registration(specifier) {
        let registration = this._registrations[specifier];
        if (registration === undefined && this._fallback) {
            registration = this._fallback.registration(specifier);
        }
        return registration;
    }
    unregister(specifier) {
        delete this._registrations[specifier];
        delete this._registeredOptions[specifier];
        delete this._registeredInjections[specifier];
    }
    registerOption(specifier, option, value) {
        let options = this._registeredOptions[specifier];
        if (!options) {
            options = {};
            this._registeredOptions[specifier] = options;
        }
        options[option] = value;
    }
    registeredOption(specifier, option) {
        let result;
        let options = this.registeredOptions(specifier);
        if (options) {
            result = options[option];
        }
        if (result === undefined && this._fallback !== undefined) {
            result = this._fallback.registeredOption(specifier, option);
        }
        return result;
    }
    registeredOptions(specifier) {
        let options = this._registeredOptions[specifier];
        if (options === undefined) {
            var _specifier$split = specifier.split(':');

            let type = _specifier$split[0];

            options = this._registeredOptions[type];
        }
        return options;
    }
    unregisterOption(specifier, option) {
        let options = this._registeredOptions[specifier];
        if (options) {
            delete options[option];
        }
    }
    registerInjection(specifier, property, source) {
        let injections = this._registeredInjections[specifier];
        if (injections === undefined) {
            this._registeredInjections[specifier] = injections = [];
        }
        injections.push({
            property,
            source
        });
    }
    registeredInjections(specifier) {
        var _specifier$split2 = specifier.split(':');

        let type = _specifier$split2[0];

        let injections = this._fallback ? this._fallback.registeredInjections(specifier) : [];
        Array.prototype.push.apply(injections, this._registeredInjections[type]);
        Array.prototype.push.apply(injections, this._registeredInjections[specifier]);
        return injections;
    }
}

// TODO - use symbol
const OWNER = '__owner__';
function getOwner(object) {
    return object[OWNER];
}
function setOwner(object, owner) {
    object[OWNER] = owner;
}

// There is a small whitelist of namespaced attributes specially
// enumerated in
// https://www.w3.org/TR/html/syntax.html#attributes-0
//
// > When a foreign element has one of the namespaced attributes given by
// > the local name and namespace of the first and second cells of a row
// > from the following table, it must be written using the name given by
// > the third cell from the same row.
//
// In all other cases, colons are interpreted as a regular character
// with no special meaning:
//
// > No other namespaced attribute can be expressed in the HTML syntax.

function unwrap(val) {
    if (val === null || val === undefined) throw new Error(`Expected value to be present`);
    return val;
}
function expect(val, message) {
    if (val === null || val === undefined) throw new Error(message);
    return val;
}
function unreachable() {
    return new Error('unreachable');
}
function typePos(lastOperand) {
    return lastOperand - 4;
}

// import Logger from './logger';
// let alreadyWarned = false;
function debugAssert(test, msg) {
    // if (!alreadyWarned) {
    //   alreadyWarned = true;
    //   Logger.warn("Don't leave debug assertions on in public builds");
    // }
    if (!test) {
        throw new Error(msg || "assertion failure");
    }
}

var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Trace"] = 0] = "Trace";
    LogLevel[LogLevel["Debug"] = 1] = "Debug";
    LogLevel[LogLevel["Warn"] = 2] = "Warn";
    LogLevel[LogLevel["Error"] = 3] = "Error";
})(LogLevel || (LogLevel = {}));
class NullConsole {
    log(_message) {}
    warn(_message) {}
    error(_message) {}
    trace() {}
}
let ALWAYS;
class Logger {
    constructor({ console, level }) {
        this.f = ALWAYS;
        this.force = ALWAYS;
        this.console = console;
        this.level = level;
    }
    skipped(level) {
        return level < this.level;
    }
    trace(message, { stackTrace = false } = {}) {
        if (this.skipped(LogLevel.Trace)) return;
        this.console.log(message);
        if (stackTrace) this.console.trace();
    }
    debug(message, { stackTrace = false } = {}) {
        if (this.skipped(LogLevel.Debug)) return;
        this.console.log(message);
        if (stackTrace) this.console.trace();
    }
    warn(message, { stackTrace = false } = {}) {
        if (this.skipped(LogLevel.Warn)) return;
        this.console.warn(message);
        if (stackTrace) this.console.trace();
    }
    error(message) {
        if (this.skipped(LogLevel.Error)) return;
        this.console.error(message);
    }
}
let _console = typeof console === 'undefined' ? new NullConsole() : console;
ALWAYS = new Logger({ console: _console, level: LogLevel.Trace });
const LOG_LEVEL = LogLevel.Debug;
new Logger({ console: _console, level: LOG_LEVEL });

const objKeys = Object.keys;

function assign(obj) {
    for (let i = 1; i < arguments.length; i++) {
        let assignment = arguments[i];
        if (assignment === null || typeof assignment !== 'object') continue;
        let keys = objKeys(assignment);
        for (let j = 0; j < keys.length; j++) {
            let key = keys[j];
            obj[key] = assignment[key];
        }
    }
    return obj;
}
function fillNulls(count) {
    let arr = new Array(count);
    for (let i = 0; i < count; i++) {
        arr[i] = null;
    }
    return arr;
}

let GUID = 0;
function initializeGuid(object) {
    return object._guid = ++GUID;
}
function ensureGuid(object) {
    return object._guid || initializeGuid(object);
}

let proto = Object.create(null, {
    // without this, we will always still end up with (new
    // EmptyObject()).constructor === Object
    constructor: {
        value: undefined,
        enumerable: false,
        writable: true
    }
});
function EmptyObject() {}
EmptyObject.prototype = proto;
function dict() {
    // let d = Object.create(null);
    // d.x = 1;
    // delete d.x;
    // return d;
    return new EmptyObject();
}
class DictSet {
    constructor() {
        this.dict = dict();
    }
    add(obj) {
        if (typeof obj === 'string') this.dict[obj] = obj;else this.dict[ensureGuid(obj)] = obj;
        return this;
    }
    delete(obj) {
        if (typeof obj === 'string') delete this.dict[obj];else if (obj._guid) delete this.dict[obj._guid];
    }
    forEach(callback) {
        let dict = this.dict;

        let dictKeys = Object.keys(dict);
        for (let i = 0; dictKeys.length; i++) {
            callback(dict[dictKeys[i]]);
        }
    }
    toArray() {
        return Object.keys(this.dict);
    }
}
class Stack {
    constructor() {
        this.stack = [];
        this.current = null;
    }
    toArray() {
        return this.stack;
    }
    push(item) {
        this.current = item;
        this.stack.push(item);
    }
    pop() {
        let item = this.stack.pop();
        let len = this.stack.length;
        this.current = len === 0 ? null : this.stack[len - 1];
        return item === undefined ? null : item;
    }
    isEmpty() {
        return this.stack.length === 0;
    }
}

class ListNode {
    constructor(value) {
        this.next = null;
        this.prev = null;
        this.value = value;
    }
}
class LinkedList {
    constructor() {
        this.clear();
    }
    static fromSlice(slice) {
        let list = new LinkedList();
        slice.forEachNode(n => list.append(n.clone()));
        return list;
    }
    head() {
        return this._head;
    }
    tail() {
        return this._tail;
    }
    clear() {
        this._head = this._tail = null;
    }
    isEmpty() {
        return this._head === null;
    }
    toArray() {
        let out = [];
        this.forEachNode(n => out.push(n));
        return out;
    }
    splice(start, end, reference) {
        let before;
        if (reference === null) {
            before = this._tail;
            this._tail = end;
        } else {
            before = reference.prev;
            end.next = reference;
            reference.prev = end;
        }
        if (before) {
            before.next = start;
            start.prev = before;
        }
    }
    nextNode(node) {
        return node.next;
    }
    prevNode(node) {
        return node.prev;
    }
    forEachNode(callback) {
        let node = this._head;
        while (node !== null) {
            callback(node);
            node = node.next;
        }
    }
    contains(needle) {
        let node = this._head;
        while (node !== null) {
            if (node === needle) return true;
            node = node.next;
        }
        return false;
    }
    insertBefore(node, reference = null) {
        if (reference === null) return this.append(node);
        if (reference.prev) reference.prev.next = node;else this._head = node;
        node.prev = reference.prev;
        node.next = reference;
        reference.prev = node;
        return node;
    }
    append(node) {
        let tail = this._tail;
        if (tail) {
            tail.next = node;
            node.prev = tail;
            node.next = null;
        } else {
            this._head = node;
        }
        return this._tail = node;
    }
    pop() {
        if (this._tail) return this.remove(this._tail);
        return null;
    }
    prepend(node) {
        if (this._head) return this.insertBefore(node, this._head);
        return this._head = this._tail = node;
    }
    remove(node) {
        if (node.prev) node.prev.next = node.next;else this._head = node.next;
        if (node.next) node.next.prev = node.prev;else this._tail = node.prev;
        return node;
    }
}
class ListSlice {
    constructor(head, tail) {
        this._head = head;
        this._tail = tail;
    }
    static toList(slice) {
        let list = new LinkedList();
        slice.forEachNode(n => list.append(n.clone()));
        return list;
    }
    forEachNode(callback) {
        let node = this._head;
        while (node !== null) {
            callback(node);
            node = this.nextNode(node);
        }
    }
    contains(needle) {
        let node = this._head;
        while (node !== null) {
            if (node === needle) return true;
            node = node.next;
        }
        return false;
    }
    head() {
        return this._head;
    }
    tail() {
        return this._tail;
    }
    toArray() {
        let out = [];
        this.forEachNode(n => out.push(n));
        return out;
    }
    nextNode(node) {
        if (node === this._tail) return null;
        return node.next;
    }
    prevNode(node) {
        if (node === this._head) return null;
        return node.prev;
    }
    isEmpty() {
        return false;
    }
}
const EMPTY_SLICE = new ListSlice(null, null);

const HAS_NATIVE_WEAKMAP = function () {
    // detect if `WeakMap` is even present
    let hasWeakMap = typeof WeakMap === 'function';
    if (!hasWeakMap) {
        return false;
    }
    let instance = new WeakMap();
    // use `Object`'s `.toString` directly to prevent us from detecting
    // polyfills as native weakmaps
    return Object.prototype.toString.call(instance) === '[object WeakMap]';
}();

const HAS_TYPED_ARRAYS = typeof Uint32Array !== 'undefined';
let A;
if (HAS_TYPED_ARRAYS) {
    A = Uint32Array;
} else {
    A = Array;
}
const EMPTY_ARRAY = HAS_NATIVE_WEAKMAP ? Object.freeze([]) : [];

/**
 * Registers
 *
 * For the most part, these follows MIPS naming conventions, however the
 * register numbers are different.
 */
var Register;
(function (Register) {
    // $0 or $pc (program counter): pointer into `program` for the next insturction; -1 means exit
    Register[Register["pc"] = 0] = "pc";
    // $1 or $ra (return address): pointer into `program` for the return
    Register[Register["ra"] = 1] = "ra";
    // $2 or $fp (frame pointer): pointer into the `evalStack` for the base of the stack
    Register[Register["fp"] = 2] = "fp";
    // $3 or $sp (stack pointer): pointer into the `evalStack` for the top of the stack
    Register[Register["sp"] = 3] = "sp";
    // $4-$5 or $s0-$s1 (saved): callee saved general-purpose registers
    Register[Register["s0"] = 4] = "s0";
    Register[Register["s1"] = 5] = "s1";
    // $6-$7 or $t0-$t1 (temporaries): caller saved general-purpose registers
    Register[Register["t0"] = 6] = "t0";
    Register[Register["t1"] = 7] = "t1";
})(Register || (Register = {}));

class AppendOpcodes {
    constructor() {
        this.evaluateOpcode = fillNulls(72 /* Size */).slice();
    }
    add(name, evaluate) {
        this.evaluateOpcode[name] = evaluate;
    }
    evaluate(vm, opcode, type) {
        let func = this.evaluateOpcode[type];
        func(vm, opcode);
        
    }
}
const APPEND_OPCODES = new AppendOpcodes();
class AbstractOpcode {
    constructor() {
        initializeGuid(this);
    }
    toJSON() {
        return { guid: this._guid, type: this.type };
    }
}
class UpdatingOpcode extends AbstractOpcode {
    constructor() {
        super(...arguments);
        this.next = null;
        this.prev = null;
    }
}

const CONSTANT = 0;
const INITIAL = 1;
const VOLATILE = NaN;
class RevisionTag {
    validate(snapshot) {
        return this.value() === snapshot;
    }
}
RevisionTag.id = 0;
const VALUE = [];
const VALIDATE = [];
class TagWrapper {
    constructor(type, inner) {
        this.type = type;
        this.inner = inner;
    }
    value() {
        let func = VALUE[this.type];
        return func(this.inner);
    }
    validate(snapshot) {
        let func = VALIDATE[this.type];
        return func(this.inner, snapshot);
    }
}
function register(Type) {
    let type = VALUE.length;
    VALUE.push(tag => tag.value());
    VALIDATE.push((tag, snapshot) => tag.validate(snapshot));
    Type.id = type;
}
///
// CONSTANT: 0
VALUE.push(() => CONSTANT);
VALIDATE.push((_tag, snapshot) => snapshot === CONSTANT);
const CONSTANT_TAG = new TagWrapper(0, null);
// VOLATILE: 1
VALUE.push(() => VOLATILE);
VALIDATE.push((_tag, snapshot) => snapshot === VOLATILE);
const VOLATILE_TAG = new TagWrapper(1, null);
// CURRENT: 2
VALUE.push(() => $REVISION);
VALIDATE.push((_tag, snapshot) => snapshot === $REVISION);
const CURRENT_TAG = new TagWrapper(2, null);


function isConst({ tag }) {
    return tag === CONSTANT_TAG;
}
function isConstTag(tag) {
    return tag === CONSTANT_TAG;
}
///
let $REVISION = INITIAL;
class DirtyableTag extends RevisionTag {
    static create(revision = $REVISION) {
        return new TagWrapper(this.id, new DirtyableTag(revision));
    }
    constructor(revision = $REVISION) {
        super();
        this.revision = revision;
    }
    value() {
        return this.revision;
    }
    dirty() {
        this.revision = ++$REVISION;
    }
}
register(DirtyableTag);
function combineTagged(tagged) {
    let optimized = [];
    for (let i = 0, l = tagged.length; i < l; i++) {
        let tag = tagged[i].tag;
        if (tag === VOLATILE_TAG) return VOLATILE_TAG;
        if (tag === CONSTANT_TAG) continue;
        optimized.push(tag);
    }
    return _combine(optimized);
}
function combineSlice(slice) {
    let optimized = [];
    let node = slice.head();
    while (node !== null) {
        let tag = node.tag;
        if (tag === VOLATILE_TAG) return VOLATILE_TAG;
        if (tag !== CONSTANT_TAG) optimized.push(tag);
        node = slice.nextNode(node);
    }
    return _combine(optimized);
}
function combine(tags) {
    let optimized = [];
    for (let i = 0, l = tags.length; i < l; i++) {
        let tag = tags[i];
        if (tag === VOLATILE_TAG) return VOLATILE_TAG;
        if (tag === CONSTANT_TAG) continue;
        optimized.push(tag);
    }
    return _combine(optimized);
}
function _combine(tags) {
    switch (tags.length) {
        case 0:
            return CONSTANT_TAG;
        case 1:
            return tags[0];
        case 2:
            return TagsPair.create(tags[0], tags[1]);
        default:
            return TagsCombinator.create(tags);
    }
    
}
class CachedTag extends RevisionTag {
    constructor() {
        super(...arguments);
        this.lastChecked = null;
        this.lastValue = null;
    }
    value() {
        let lastChecked = this.lastChecked,
            lastValue = this.lastValue;

        if (lastChecked !== $REVISION) {
            this.lastChecked = $REVISION;
            this.lastValue = lastValue = this.compute();
        }
        return this.lastValue;
    }
    invalidate() {
        this.lastChecked = null;
    }
}
class TagsPair extends CachedTag {
    static create(first, second) {
        return new TagWrapper(this.id, new TagsPair(first, second));
    }
    constructor(first, second) {
        super();
        this.first = first;
        this.second = second;
    }
    compute() {
        return Math.max(this.first.value(), this.second.value());
    }
}
register(TagsPair);
class TagsCombinator extends CachedTag {
    static create(tags) {
        return new TagWrapper(this.id, new TagsCombinator(tags));
    }
    constructor(tags) {
        super();
        this.tags = tags;
    }
    compute() {
        let tags = this.tags;

        let max = -1;
        for (let i = 0; i < tags.length; i++) {
            let value = tags[i].value();
            max = Math.max(value, max);
        }
        return max;
    }
}
register(TagsCombinator);
class UpdatableTag extends CachedTag {
    static create(tag) {
        return new TagWrapper(this.id, new UpdatableTag(tag));
    }
    constructor(tag) {
        super();
        this.tag = tag;
        this.lastUpdated = INITIAL;
    }
    compute() {
        return Math.max(this.lastUpdated, this.tag.value());
    }
    update(tag) {
        if (tag !== this.tag) {
            this.tag = tag;
            this.lastUpdated = $REVISION;
            this.invalidate();
        }
    }
}
register(UpdatableTag);
class CachedReference {
    constructor() {
        this.lastRevision = null;
        this.lastValue = null;
    }
    value() {
        let tag = this.tag,
            lastRevision = this.lastRevision,
            lastValue = this.lastValue;

        if (!lastRevision || !tag.validate(lastRevision)) {
            lastValue = this.lastValue = this.compute();
            this.lastRevision = tag.value();
        }
        return lastValue;
    }
    invalidate() {
        this.lastRevision = null;
    }
}
class MapperReference extends CachedReference {
    constructor(reference, mapper) {
        super();
        this.tag = reference.tag;
        this.reference = reference;
        this.mapper = mapper;
    }
    compute() {
        let reference = this.reference,
            mapper = this.mapper;

        return mapper(reference.value());
    }
}
function map(reference, mapper) {
    return new MapperReference(reference, mapper);
}
//////////
class ReferenceCache {
    constructor(reference) {
        this.lastValue = null;
        this.lastRevision = null;
        this.initialized = false;
        this.tag = reference.tag;
        this.reference = reference;
    }
    peek() {
        if (!this.initialized) {
            return this.initialize();
        }
        return this.lastValue;
    }
    revalidate() {
        if (!this.initialized) {
            return this.initialize();
        }
        let reference = this.reference,
            lastRevision = this.lastRevision;

        let tag = reference.tag;
        if (tag.validate(lastRevision)) return NOT_MODIFIED;
        this.lastRevision = tag.value();
        let lastValue = this.lastValue;

        let value = reference.value();
        if (value === lastValue) return NOT_MODIFIED;
        this.lastValue = value;
        return value;
    }
    initialize() {
        let reference = this.reference;

        let value = this.lastValue = reference.value();
        this.lastRevision = reference.tag.value();
        this.initialized = true;
        return value;
    }
}
const NOT_MODIFIED = "adb3b78e-3d22-4e4b-877a-6317c2c5c145";
function isModified(value) {
    return value !== NOT_MODIFIED;
}

class ConstReference {
    constructor(inner) {
        this.inner = inner;
        this.tag = CONSTANT_TAG;
    }
    value() {
        return this.inner;
    }
}

class ListItem extends ListNode {
    constructor(iterable, result) {
        super(iterable.valueReferenceFor(result));
        this.retained = false;
        this.seen = false;
        this.key = result.key;
        this.iterable = iterable;
        this.memo = iterable.memoReferenceFor(result);
    }
    update(item) {
        this.retained = true;
        this.iterable.updateValueReference(this.value, item);
        this.iterable.updateMemoReference(this.memo, item);
    }
    shouldRemove() {
        return !this.retained;
    }
    reset() {
        this.retained = false;
        this.seen = false;
    }
}
class IterationArtifacts {
    constructor(iterable) {
        this.map = dict();
        this.list = new LinkedList();
        this.tag = iterable.tag;
        this.iterable = iterable;
    }
    isEmpty() {
        let iterator = this.iterator = this.iterable.iterate();
        return iterator.isEmpty();
    }
    iterate() {
        let iterator = this.iterator || this.iterable.iterate();
        this.iterator = null;
        return iterator;
    }
    has(key) {
        return !!this.map[key];
    }
    get(key) {
        return this.map[key];
    }
    wasSeen(key) {
        let node = this.map[key];
        return node && node.seen;
    }
    append(item) {
        let map = this.map,
            list = this.list,
            iterable = this.iterable;

        let node = map[item.key] = new ListItem(iterable, item);
        list.append(node);
        return node;
    }
    insertBefore(item, reference) {
        let map = this.map,
            list = this.list,
            iterable = this.iterable;

        let node = map[item.key] = new ListItem(iterable, item);
        node.retained = true;
        list.insertBefore(node, reference);
        return node;
    }
    move(item, reference) {
        let list = this.list;

        item.retained = true;
        list.remove(item);
        list.insertBefore(item, reference);
    }
    remove(item) {
        let list = this.list;

        list.remove(item);
        delete this.map[item.key];
    }
    nextNode(item) {
        return this.list.nextNode(item);
    }
    head() {
        return this.list.head();
    }
}
class ReferenceIterator {
    // if anyone needs to construct this object with something other than
    // an iterable, let @wycats know.
    constructor(iterable) {
        this.iterator = null;
        let artifacts = new IterationArtifacts(iterable);
        this.artifacts = artifacts;
    }
    next() {
        let artifacts = this.artifacts;

        let iterator = this.iterator = this.iterator || artifacts.iterate();
        let item = iterator.next();
        if (!item) return null;
        return artifacts.append(item);
    }
}
var Phase;
(function (Phase) {
    Phase[Phase["Append"] = 0] = "Append";
    Phase[Phase["Prune"] = 1] = "Prune";
    Phase[Phase["Done"] = 2] = "Done";
})(Phase || (Phase = {}));
class IteratorSynchronizer {
    constructor({ target, artifacts }) {
        this.target = target;
        this.artifacts = artifacts;
        this.iterator = artifacts.iterate();
        this.current = artifacts.head();
    }
    sync() {
        let phase = Phase.Append;
        while (true) {
            switch (phase) {
                case Phase.Append:
                    phase = this.nextAppend();
                    break;
                case Phase.Prune:
                    phase = this.nextPrune();
                    break;
                case Phase.Done:
                    this.nextDone();
                    return;
            }
        }
    }
    advanceToKey(key) {
        let current = this.current,
            artifacts = this.artifacts;

        let seek = current;
        while (seek && seek.key !== key) {
            seek.seen = true;
            seek = artifacts.nextNode(seek);
        }
        this.current = seek && artifacts.nextNode(seek);
    }
    nextAppend() {
        let iterator = this.iterator,
            current = this.current,
            artifacts = this.artifacts;

        let item = iterator.next();
        if (item === null) {
            return this.startPrune();
        }
        let key = item.key;

        if (current && current.key === key) {
            this.nextRetain(item);
        } else if (artifacts.has(key)) {
            this.nextMove(item);
        } else {
            this.nextInsert(item);
        }
        return Phase.Append;
    }
    nextRetain(item) {
        let artifacts = this.artifacts,
            current = this.current;

        current = expect(current, 'BUG: current is empty');
        current.update(item);
        this.current = artifacts.nextNode(current);
        this.target.retain(item.key, current.value, current.memo);
    }
    nextMove(item) {
        let current = this.current,
            artifacts = this.artifacts,
            target = this.target;
        let key = item.key;

        let found = artifacts.get(item.key);
        found.update(item);
        if (artifacts.wasSeen(item.key)) {
            artifacts.move(found, current);
            target.move(found.key, found.value, found.memo, current ? current.key : null);
        } else {
            this.advanceToKey(key);
        }
    }
    nextInsert(item) {
        let artifacts = this.artifacts,
            target = this.target,
            current = this.current;

        let node = artifacts.insertBefore(item, current);
        target.insert(node.key, node.value, node.memo, current ? current.key : null);
    }
    startPrune() {
        this.current = this.artifacts.head();
        return Phase.Prune;
    }
    nextPrune() {
        let artifacts = this.artifacts,
            target = this.target,
            current = this.current;

        if (current === null) {
            return Phase.Done;
        }
        let node = current;
        this.current = artifacts.nextNode(node);
        if (node.shouldRemove()) {
            artifacts.remove(node);
            target.delete(node.key);
        } else {
            node.reset();
        }
        return Phase.Prune;
    }
    nextDone() {
        this.target.done();
    }
}

class PrimitiveReference extends ConstReference {
    constructor(value) {
        super(value);
    }
    static create(value) {
        if (value === undefined) {
            return UNDEFINED_REFERENCE;
        } else if (value === null) {
            return NULL_REFERENCE;
        } else if (value === true) {
            return TRUE_REFERENCE;
        } else if (value === false) {
            return FALSE_REFERENCE;
        } else if (typeof value === 'number') {
            return new ValueReference(value);
        } else {
            return new StringReference(value);
        }
    }
    get(_key) {
        return UNDEFINED_REFERENCE;
    }
}
class StringReference extends PrimitiveReference {
    constructor() {
        super(...arguments);
        this.lengthReference = null;
    }
    get(key) {
        if (key === 'length') {
            let lengthReference = this.lengthReference;

            if (lengthReference === null) {
                lengthReference = this.lengthReference = new ValueReference(this.inner.length);
            }
            return lengthReference;
        } else {
            return super.get(key);
        }
    }
}
class ValueReference extends PrimitiveReference {
    constructor(value) {
        super(value);
    }
}
const UNDEFINED_REFERENCE = new ValueReference(undefined);
const NULL_REFERENCE = new ValueReference(null);
const TRUE_REFERENCE = new ValueReference(true);
const FALSE_REFERENCE = new ValueReference(false);
class ConditionalReference {
    constructor(inner) {
        this.inner = inner;
        this.tag = inner.tag;
    }
    value() {
        return this.toBool(this.inner.value());
    }
    toBool(value) {
        return !!value;
    }
}

class ConcatReference extends CachedReference {
    constructor(parts) {
        super();
        this.parts = parts;
        this.tag = combineTagged(parts);
    }
    compute() {
        let parts = new Array();
        for (let i = 0; i < this.parts.length; i++) {
            let value = this.parts[i].value();
            if (value !== null && value !== undefined) {
                parts[i] = castToString(value);
            }
        }
        if (parts.length > 0) {
            return parts.join('');
        }
        return null;
    }
}
function castToString(value) {
    if (typeof value.toString !== 'function') {
        return '';
    }
    return String(value);
}

APPEND_OPCODES.add(1 /* Helper */, (vm, { op1: _helper }) => {
    let stack = vm.stack;
    let helper = vm.constants.getFunction(_helper);
    let args = stack.pop();
    let value = helper(vm, args);
    args.clear();
    vm.stack.push(value);
});
APPEND_OPCODES.add(2 /* Function */, (vm, { op1: _function }) => {
    let func = vm.constants.getFunction(_function);
    vm.stack.push(func(vm));
});
APPEND_OPCODES.add(5 /* GetVariable */, (vm, { op1: symbol }) => {
    let expr = vm.referenceForSymbol(symbol);
    vm.stack.push(expr);
});
APPEND_OPCODES.add(4 /* SetVariable */, (vm, { op1: symbol }) => {
    let expr = vm.stack.pop();
    vm.scope().bindSymbol(symbol, expr);
});
APPEND_OPCODES.add(70 /* ResolveMaybeLocal */, (vm, { op1: _name }) => {
    let name = vm.constants.getString(_name);
    let locals = vm.scope().getPartialMap();
    let ref = locals[name];
    if (ref === undefined) {
        ref = vm.getSelf().get(name);
    }
    vm.stack.push(ref);
});
APPEND_OPCODES.add(19 /* RootScope */, (vm, { op1: symbols, op2: bindCallerScope }) => {
    vm.pushRootScope(symbols, !!bindCallerScope);
});
APPEND_OPCODES.add(6 /* GetProperty */, (vm, { op1: _key }) => {
    let key = vm.constants.getString(_key);
    let expr = vm.stack.pop();
    vm.stack.push(expr.get(key));
});
APPEND_OPCODES.add(7 /* PushBlock */, (vm, { op1: _block }) => {
    let block = _block ? vm.constants.getBlock(_block) : null;
    vm.stack.push(block);
});
APPEND_OPCODES.add(8 /* GetBlock */, (vm, { op1: _block }) => {
    vm.stack.push(vm.scope().getBlock(_block));
});
APPEND_OPCODES.add(9 /* HasBlock */, (vm, { op1: _block }) => {
    let hasBlock = !!vm.scope().getBlock(_block);
    vm.stack.push(hasBlock ? TRUE_REFERENCE : FALSE_REFERENCE);
});
APPEND_OPCODES.add(10 /* HasBlockParams */, (vm, { op1: _block }) => {
    let block = vm.scope().getBlock(_block);
    let hasBlockParams = block && block.symbolTable.parameters.length;
    vm.stack.push(hasBlockParams ? TRUE_REFERENCE : FALSE_REFERENCE);
});
APPEND_OPCODES.add(11 /* Concat */, (vm, { op1: count }) => {
    let out = [];
    for (let i = count; i > 0; i--) {
        out.push(vm.stack.pop());
    }
    vm.stack.push(new ConcatReference(out.reverse()));
});

function normalizeStringValue(value) {
    if (isEmpty(value)) {
        return '';
    }
    return String(value);
}
function normalizeTrustedValue(value) {
    if (isEmpty(value)) {
        return '';
    }
    if (isString(value)) {
        return value;
    }
    if (isSafeString(value)) {
        return value.toHTML();
    }
    if (isNode(value)) {
        return value;
    }
    return String(value);
}
function isEmpty(value) {
    return value === null || value === undefined || typeof value.toString !== 'function';
}
function isSafeString(value) {
    return typeof value === 'object' && value !== null && typeof value.toHTML === 'function';
}
function isNode(value) {
    return typeof value === 'object' && value !== null && typeof value.nodeType === 'number';
}
function isFragment(value) {
    return isNode(value) && value.nodeType === 11;
}
function isString(value) {
    return typeof value === 'string';
}

APPEND_OPCODES.add(20 /* ChildScope */, vm => vm.pushChildScope());
APPEND_OPCODES.add(21 /* PopScope */, vm => vm.popScope());
APPEND_OPCODES.add(39 /* PushDynamicScope */, vm => vm.pushDynamicScope());
APPEND_OPCODES.add(40 /* PopDynamicScope */, vm => vm.popDynamicScope());
APPEND_OPCODES.add(12 /* Immediate */, (vm, { op1: number }) => {
    vm.stack.push(number);
});
APPEND_OPCODES.add(13 /* Constant */, (vm, { op1: other }) => {
    vm.stack.push(vm.constants.getOther(other));
});
APPEND_OPCODES.add(14 /* PrimitiveReference */, (vm, { op1: primitive }) => {
    let stack = vm.stack;
    let flag = (primitive & 3 << 30) >>> 30;
    let value = primitive & ~(3 << 30);
    switch (flag) {
        case 0:
            stack.push(PrimitiveReference.create(value));
            break;
        case 1:
            stack.push(PrimitiveReference.create(vm.constants.getString(value)));
            break;
        case 2:
            switch (value) {
                case 0:
                    stack.push(FALSE_REFERENCE);
                    break;
                case 1:
                    stack.push(TRUE_REFERENCE);
                    break;
                case 2:
                    stack.push(NULL_REFERENCE);
                    break;
                case 3:
                    stack.push(UNDEFINED_REFERENCE);
                    break;
            }
            break;
    }
});
APPEND_OPCODES.add(15 /* Dup */, (vm, { op1: register, op2: offset }) => {
    let position = vm.fetchValue(register) - offset;
    vm.stack.dup(position);
});
APPEND_OPCODES.add(16 /* Pop */, (vm, { op1: count }) => vm.stack.pop(count));
APPEND_OPCODES.add(17 /* Load */, (vm, { op1: register }) => vm.load(register));
APPEND_OPCODES.add(18 /* Fetch */, (vm, { op1: register }) => vm.fetch(register));
APPEND_OPCODES.add(38 /* BindDynamicScope */, (vm, { op1: _names }) => {
    let names = vm.constants.getArray(_names);
    vm.bindDynamicScope(names);
});
APPEND_OPCODES.add(47 /* PushFrame */, vm => vm.pushFrame());
APPEND_OPCODES.add(48 /* PopFrame */, vm => vm.popFrame());
APPEND_OPCODES.add(49 /* Enter */, (vm, { op1: args }) => vm.enter(args));
APPEND_OPCODES.add(50 /* Exit */, vm => vm.exit());
APPEND_OPCODES.add(41 /* CompileDynamicBlock */, vm => {
    let stack = vm.stack;
    let block = stack.pop();
    stack.push(block ? block.compileDynamic(vm.env) : null);
});
APPEND_OPCODES.add(42 /* InvokeStatic */, (vm, { op1: _block }) => {
    let block = vm.constants.getBlock(_block);
    let compiled = block.compileStatic(vm.env);
    vm.call(compiled.handle);
});
APPEND_OPCODES.add(43 /* InvokeDynamic */, (vm, { op1: _invoker }) => {
    let invoker = vm.constants.getOther(_invoker);
    let block = vm.stack.pop();
    invoker.invoke(vm, block);
});
APPEND_OPCODES.add(44 /* Jump */, (vm, { op1: target }) => vm.goto(target));
APPEND_OPCODES.add(45 /* JumpIf */, (vm, { op1: target }) => {
    let reference = vm.stack.pop();
    if (isConst(reference)) {
        if (reference.value()) {
            vm.goto(target);
        }
    } else {
        let cache = new ReferenceCache(reference);
        if (cache.peek()) {
            vm.goto(target);
        }
        vm.updateWith(new Assert(cache));
    }
});
APPEND_OPCODES.add(46 /* JumpUnless */, (vm, { op1: target }) => {
    let reference = vm.stack.pop();
    if (isConst(reference)) {
        if (!reference.value()) {
            vm.goto(target);
        }
    } else {
        let cache = new ReferenceCache(reference);
        if (!cache.peek()) {
            vm.goto(target);
        }
        vm.updateWith(new Assert(cache));
    }
});
APPEND_OPCODES.add(22 /* Return */, vm => vm.return());
APPEND_OPCODES.add(23 /* ReturnTo */, (vm, { op1: relative }) => {
    vm.returnTo(relative);
});
const ConstTest = function ConstTest(ref, _env) {
    return new ConstReference(!!ref.value());
};
const SimpleTest = function SimpleTest(ref, _env) {
    return ref;
};
const EnvironmentTest = function EnvironmentTest(ref, env) {
    return env.toConditionalReference(ref);
};
APPEND_OPCODES.add(51 /* Test */, (vm, { op1: _func }) => {
    let stack = vm.stack;
    let operand = stack.pop();
    let func = vm.constants.getFunction(_func);
    stack.push(func(operand, vm.env));
});
class Assert extends UpdatingOpcode {
    constructor(cache) {
        super();
        this.type = 'assert';
        this.tag = cache.tag;
        this.cache = cache;
    }
    evaluate(vm) {
        let cache = this.cache;

        if (isModified(cache.revalidate())) {
            vm.throw();
        }
    }
    toJSON() {
        let type = this.type,
            _guid = this._guid,
            cache = this.cache;

        let expected;
        try {
            expected = JSON.stringify(cache.peek());
        } catch (e) {
            expected = String(cache.peek());
        }
        return {
            args: [],
            details: { expected },
            guid: _guid,
            type
        };
    }
}
class JumpIfNotModifiedOpcode extends UpdatingOpcode {
    constructor(tag, target) {
        super();
        this.target = target;
        this.type = 'jump-if-not-modified';
        this.tag = tag;
        this.lastRevision = tag.value();
    }
    evaluate(vm) {
        let tag = this.tag,
            target = this.target,
            lastRevision = this.lastRevision;

        if (!vm.alwaysRevalidate && tag.validate(lastRevision)) {
            vm.goto(target);
        }
    }
    didModify() {
        this.lastRevision = this.tag.value();
    }
    toJSON() {
        return {
            args: [JSON.stringify(this.target.inspect())],
            guid: this._guid,
            type: this.type
        };
    }
}
class DidModifyOpcode extends UpdatingOpcode {
    constructor(target) {
        super();
        this.target = target;
        this.type = 'did-modify';
        this.tag = CONSTANT_TAG;
    }
    evaluate() {
        this.target.didModify();
    }
}
class LabelOpcode {
    constructor(label) {
        this.tag = CONSTANT_TAG;
        this.type = 'label';
        this.label = null;
        this.prev = null;
        this.next = null;
        initializeGuid(this);
        this.label = label;
    }
    evaluate() {}
    inspect() {
        return `${this.label} [${this._guid}]`;
    }
    toJSON() {
        return {
            args: [JSON.stringify(this.inspect())],
            guid: this._guid,
            type: this.type
        };
    }
}

APPEND_OPCODES.add(24 /* Text */, (vm, { op1: text }) => {
    vm.elements().appendText(vm.constants.getString(text));
});
APPEND_OPCODES.add(25 /* Comment */, (vm, { op1: text }) => {
    vm.elements().appendComment(vm.constants.getString(text));
});
APPEND_OPCODES.add(27 /* OpenElement */, (vm, { op1: tag }) => {
    vm.elements().openElement(vm.constants.getString(tag));
});
APPEND_OPCODES.add(28 /* OpenElementWithOperations */, (vm, { op1: tag }) => {
    let tagName = vm.constants.getString(tag);
    vm.elements().openElement(tagName);
});
APPEND_OPCODES.add(29 /* OpenDynamicElement */, vm => {
    let tagName = vm.stack.pop().value();
    vm.elements().openElement(tagName);
});
APPEND_OPCODES.add(36 /* PushRemoteElement */, vm => {
    let elementRef = vm.stack.pop();
    let nextSiblingRef = vm.stack.pop();
    let element;
    let nextSibling;
    if (isConst(elementRef)) {
        element = elementRef.value();
    } else {
        let cache = new ReferenceCache(elementRef);
        element = cache.peek();
        vm.updateWith(new Assert(cache));
    }
    if (isConst(nextSiblingRef)) {
        nextSibling = nextSiblingRef.value();
    } else {
        let cache = new ReferenceCache(nextSiblingRef);
        nextSibling = cache.peek();
        vm.updateWith(new Assert(cache));
    }
    vm.elements().pushRemoteElement(element, nextSibling);
});
APPEND_OPCODES.add(37 /* PopRemoteElement */, vm => vm.elements().popRemoteElement());
APPEND_OPCODES.add(33 /* FlushElement */, vm => {
    let operations = vm.fetchValue(Register.t0);
    if (operations) {
        operations.flush(vm);
        vm.loadValue(Register.t0, null);
    }
    vm.elements().flushElement();
});
APPEND_OPCODES.add(34 /* CloseElement */, vm => vm.elements().closeElement());
APPEND_OPCODES.add(35 /* Modifier */, (vm, { op1: _manager }) => {
    let manager = vm.constants.getOther(_manager);
    let stack = vm.stack;
    let args = stack.pop();

    var _vm$elements = vm.elements();

    let element = _vm$elements.constructing,
        updateOperations = _vm$elements.updateOperations;

    let dynamicScope = vm.dynamicScope();
    let modifier = manager.create(element, args, dynamicScope, updateOperations);
    args.clear();
    vm.env.scheduleInstallModifier(modifier, manager);
    let destructor = manager.getDestructor(modifier);
    if (destructor) {
        vm.newDestroyable(destructor);
    }
    let tag = manager.getTag(modifier);
    if (!isConstTag(tag)) {
        vm.updateWith(new UpdateModifierOpcode(tag, manager, modifier));
    }
});
class UpdateModifierOpcode extends UpdatingOpcode {
    constructor(tag, manager, modifier) {
        super();
        this.tag = tag;
        this.manager = manager;
        this.modifier = modifier;
        this.type = 'update-modifier';
        this.lastUpdated = tag.value();
    }
    evaluate(vm) {
        let manager = this.manager,
            modifier = this.modifier,
            tag = this.tag,
            lastUpdated = this.lastUpdated;

        if (!tag.validate(lastUpdated)) {
            vm.env.scheduleUpdateModifier(modifier, manager);
            this.lastUpdated = tag.value();
        }
    }
    toJSON() {
        return {
            guid: this._guid,
            type: this.type
        };
    }
}
// APPEND_OPCODES.add(Op.ComponentAttr, )
APPEND_OPCODES.add(30 /* StaticAttr */, (vm, { op1: _name, op2: _value, op3: _namespace }) => {
    let name = vm.constants.getString(_name);
    let value = vm.constants.getString(_value);
    let namespace = _namespace ? vm.constants.getString(_namespace) : null;
    vm.elements().setStaticAttribute(name, value, namespace);
});
APPEND_OPCODES.add(31 /* DynamicAttr */, (vm, { op1: _name, op2: trusting, op3: _namespace }) => {
    let name = vm.constants.getString(_name);
    let reference = vm.stack.pop();
    let value = reference.value();
    let namespace = _namespace ? vm.constants.getString(_namespace) : null;
    let attribute = vm.elements().setDynamicAttribute(name, value, !!trusting, namespace);
    if (!isConst(reference)) {
        vm.updateWith(new UpdateDynamicAttributeOpcode(reference, attribute));
    }
});
class UpdateDynamicAttributeOpcode extends UpdatingOpcode {
    constructor(reference, attribute) {
        super();
        this.reference = reference;
        this.attribute = attribute;
        this.type = 'patch-element';
        this.tag = reference.tag;
    }
    evaluate(vm) {
        let attribute = this.attribute,
            reference = this.reference;

        attribute.update(reference.value(), vm.env);
    }
}

class Arguments {
    constructor() {
        this.stack = null;
        this.positional = new PositionalArguments();
        this.named = new NamedArguments();
    }
    empty() {
        this.setup(null, true);
        return this;
    }
    setup(stack, synthetic) {
        this.stack = stack;
        let names = stack.fromTop(0);
        let namedCount = names.length;
        let positionalCount = stack.fromTop(namedCount + 1);
        let start = positionalCount + namedCount + 2;
        let positional = this.positional;
        positional.setup(stack, start, positionalCount);
        let named = this.named;
        named.setup(stack, namedCount, names, synthetic);
    }
    get tag() {
        return combineTagged([this.positional, this.named]);
    }
    get length() {
        return this.positional.length + this.named.length;
    }
    at(pos) {
        return this.positional.at(pos);
    }
    get(name) {
        return this.named.get(name);
    }
    capture() {
        return {
            tag: this.tag,
            length: this.length,
            positional: this.positional.capture(),
            named: this.named.capture()
        };
    }
    clear() {
        let stack = this.stack,
            length = this.length;

        stack.pop(length + 2);
    }
}
class PositionalArguments {
    constructor() {
        this.length = 0;
        this.stack = null;
        this.start = 0;
        this._tag = null;
        this._references = null;
    }
    setup(stack, start, length) {
        this.stack = stack;
        this.start = start;
        this.length = length;
        this._tag = null;
        this._references = null;
    }
    get tag() {
        let tag = this._tag;
        if (!tag) {
            tag = this._tag = combineTagged(this.references);
        }
        return tag;
    }
    at(position) {
        let start = this.start,
            length = this.length;

        if (position < 0 || position >= length) {
            return UNDEFINED_REFERENCE;
        }
        // stack: pos1, pos2, pos3, named1, named2
        // start: 4 (top - 4)
        //
        // at(0) === pos1 === top - start
        // at(1) === pos2 === top - (start - 1)
        // at(2) === pos3 === top - (start - 2)
        let fromTop = start - position - 1;
        return this.stack.fromTop(fromTop);
    }
    capture() {
        return new CapturedPositionalArguments(this.tag, this.references);
    }
    get references() {
        let references = this._references;
        if (!references) {
            let length = this.length;

            references = this._references = new Array(length);
            for (let i = 0; i < length; i++) {
                references[i] = this.at(i);
            }
        }
        return references;
    }
}
class CapturedPositionalArguments {
    constructor(tag, references, length = references.length) {
        this.tag = tag;
        this.references = references;
        this.length = length;
    }
    at(position) {
        return this.references[position];
    }
    value() {
        return this.references.map(this.valueOf);
    }
    get(name) {
        let references = this.references,
            length = this.length;

        if (name === 'length') {
            return PrimitiveReference.create(length);
        } else {
            let idx = parseInt(name, 10);
            if (idx < 0 || idx >= length) {
                return UNDEFINED_REFERENCE;
            } else {
                return references[idx];
            }
        }
    }
    valueOf(reference) {
        return reference.value();
    }
}
class NamedArguments {
    constructor() {
        this.length = 0;
        this._tag = null;
        this._references = null;
        this._names = null;
        this._realNames = EMPTY_ARRAY;
    }
    setup(stack, length, names, synthetic) {
        this.stack = stack;
        this.length = length;
        this._tag = null;
        this._references = null;
        if (synthetic) {
            this._names = names;
            this._realNames = EMPTY_ARRAY;
        } else {
            this._names = null;
            this._realNames = names;
        }
    }
    get tag() {
        return combineTagged(this.references);
    }
    get names() {
        let names = this._names;
        if (!names) {
            names = this._names = this._realNames.map(this.sliceName);
        }
        return names;
    }
    has(name) {
        return this.names.indexOf(name) !== -1;
    }
    get(name) {
        let names = this.names,
            length = this.length;

        let idx = names.indexOf(name);
        if (idx === -1) {
            return UNDEFINED_REFERENCE;
        }
        // stack: pos1, pos2, pos3, named1, named2
        // start: 4 (top - 4)
        // namedDict: { named1: 1, named2: 0 };
        //
        // get('named1') === named1 === top - (start - 1)
        // get('named2') === named2 === top - start
        let fromTop = length - idx;
        return this.stack.fromTop(fromTop);
    }
    capture() {
        return new CapturedNamedArguments(this.tag, this.names, this.references);
    }
    get references() {
        let references = this._references;
        if (!references) {
            let names = this.names,
                length = this.length;

            references = this._references = [];
            for (let i = 0; i < length; i++) {
                references[i] = this.get(names[i]);
            }
        }
        return references;
    }
    sliceName(name) {
        return name.slice(1);
    }
}
class CapturedNamedArguments {
    constructor(tag, names, references) {
        this.tag = tag;
        this.names = names;
        this.references = references;
        this.length = names.length;
        this._map = null;
    }
    get map() {
        let map$$1 = this._map;
        if (!map$$1) {
            let names = this.names,
                references = this.references;

            map$$1 = this._map = dict();
            for (let i = 0; i < names.length; i++) {
                let name = names[i];
                map$$1[name] = references[i];
            }
        }
        return map$$1;
    }
    has(name) {
        return this.names.indexOf(name) !== -1;
    }
    get(name) {
        let names = this.names,
            references = this.references;

        let idx = names.indexOf(name);
        if (idx === -1) {
            return UNDEFINED_REFERENCE;
        } else {
            return references[idx];
        }
    }
    value() {
        let names = this.names,
            references = this.references;

        let out = dict();
        for (let i = 0; i < names.length; i++) {
            let name = names[i];
            out[name] = references[i].value();
        }
        return out;
    }
}
var ARGS = new Arguments();

APPEND_OPCODES.add(56 /* PushComponentManager */, (vm, { op1: _definition }) => {
    let definition = vm.constants.getOther(_definition);
    let stack = vm.stack;
    stack.push({ definition, manager: definition.manager, component: null });
});
APPEND_OPCODES.add(57 /* PushDynamicComponentManager */, vm => {
    let stack = vm.stack;
    let reference = stack.pop();
    let cache = isConst(reference) ? undefined : new ReferenceCache(reference);
    let definition = cache ? cache.peek() : reference.value();
    stack.push({ definition, manager: definition.manager, component: null });
    if (cache) {
        vm.updateWith(new Assert(cache));
    }
});
APPEND_OPCODES.add(58 /* PushArgs */, (vm, { op1: synthetic }) => {
    let stack = vm.stack;
    ARGS.setup(stack, !!synthetic);
    stack.push(ARGS);
});
APPEND_OPCODES.add(59 /* PrepareArgs */, (vm, { op1: _state }) => {
    let stack = vm.stack;

    var _vm$fetchValue = vm.fetchValue(_state);

    let definition = _vm$fetchValue.definition,
        manager = _vm$fetchValue.manager;

    let args = stack.pop();
    let preparedArgs = manager.prepareArgs(definition, args);
    if (preparedArgs) {
        args.clear();
        let positional = preparedArgs.positional,
            named = preparedArgs.named;

        let positionalCount = positional.length;
        for (let i = 0; i < positionalCount; i++) {
            stack.push(positional[i]);
        }
        stack.push(positionalCount);
        let names = Object.keys(named);
        let namedCount = names.length;
        let atNames = [];
        for (let i = 0; i < namedCount; i++) {
            let value = named[names[i]];
            let atName = `@${names[i]}`;
            stack.push(value);
            atNames.push(atName);
        }
        stack.push(atNames);
        args.setup(stack, false);
    }
    stack.push(args);
});
APPEND_OPCODES.add(60 /* CreateComponent */, (vm, { op1: flags, op2: _state }) => {
    var _vm$fetchValue2;

    let definition;
    let manager;
    let args = vm.stack.pop();
    let dynamicScope = vm.dynamicScope();
    let state = (_vm$fetchValue2 = vm.fetchValue(_state), definition = _vm$fetchValue2.definition, manager = _vm$fetchValue2.manager, _vm$fetchValue2);
    let hasDefaultBlock = flags & 1;
    let component = manager.create(vm.env, definition, args, dynamicScope, vm.getSelf(), !!hasDefaultBlock);
    state.component = component;
    let tag = manager.getTag(component);
    if (!isConstTag(tag)) {
        vm.updateWith(new UpdateComponentOpcode(tag, definition.name, component, manager, dynamicScope));
    }
});
APPEND_OPCODES.add(61 /* RegisterComponentDestructor */, (vm, { op1: _state }) => {
    var _vm$fetchValue3 = vm.fetchValue(_state);

    let manager = _vm$fetchValue3.manager,
        component = _vm$fetchValue3.component;

    let destructor = manager.getDestructor(component);
    if (destructor) vm.newDestroyable(destructor);
});
APPEND_OPCODES.add(65 /* BeginComponentTransaction */, vm => {
    vm.beginCacheGroup();
    vm.elements().pushSimpleBlock();
});
APPEND_OPCODES.add(62 /* PutComponentOperations */, vm => {
    vm.loadValue(Register.t0, new ComponentElementOperations());
});
APPEND_OPCODES.add(32 /* ComponentAttr */, (vm, { op1: _name, op2: trusting, op3: _namespace }) => {
    let name = vm.constants.getString(_name);
    let reference = vm.stack.pop();
    let namespace = _namespace ? vm.constants.getString(_namespace) : null;
    vm.fetchValue(Register.t0).setAttribute(name, reference, !!trusting, namespace);
});
class ComponentElementOperations {
    constructor() {
        this.attributes = dict();
        this.classes = [];
    }
    setAttribute(name, value, trusting, namespace) {
        let deferred = { value, namespace, trusting };
        if (name === 'class') {
            this.classes.push(value);
        }
        this.attributes[name] = deferred;
    }
    flush(vm) {
        for (let name in this.attributes) {
            let attr = this.attributes[name];
            let reference = attr.value,
                namespace = attr.namespace,
                trusting = attr.trusting;

            if (name === 'class') {
                reference = new ClassListReference(this.classes);
            }
            let attribute = vm.elements().setDynamicAttribute(name, reference.value(), trusting, namespace);
            if (!isConst(reference)) {
                vm.updateWith(new UpdateDynamicAttributeOpcode(reference, attribute));
            }
        }
    }
}
class ClassListReference {
    constructor(list) {
        this.list = list;
        this.tag = combineTagged(list);
        this.list = list;
    }
    value() {
        let ret = [];
        let list = this.list;

        for (let i = 0; i < list.length; i++) {
            let value = normalizeStringValue(list[i].value());
            if (value) ret.push(value);
        }
        return ret.length === 0 ? null : ret.join(' ');
    }
}
APPEND_OPCODES.add(67 /* DidCreateElement */, (vm, { op1: _state }) => {
    var _vm$fetchValue4 = vm.fetchValue(_state);

    let manager = _vm$fetchValue4.manager,
        component = _vm$fetchValue4.component;

    let operations = vm.fetchValue(Register.t0);
    let action = 'DidCreateElementOpcode#evaluate';
    manager.didCreateElement(component, vm.elements().expectConstructing(action), operations);
});
APPEND_OPCODES.add(63 /* GetComponentSelf */, (vm, { op1: _state }) => {
    let state = vm.fetchValue(_state);
    vm.stack.push(state.manager.getSelf(state.component));
});
APPEND_OPCODES.add(64 /* GetComponentLayout */, (vm, { op1: _state }) => {
    var _vm$fetchValue5 = vm.fetchValue(_state);

    let manager = _vm$fetchValue5.manager,
        definition = _vm$fetchValue5.definition,
        component = _vm$fetchValue5.component;

    vm.stack.push(manager.layoutFor(definition, component, vm.env));
});
APPEND_OPCODES.add(68 /* DidRenderLayout */, (vm, { op1: _state }) => {
    var _vm$fetchValue6 = vm.fetchValue(_state);

    let manager = _vm$fetchValue6.manager,
        component = _vm$fetchValue6.component;

    let bounds = vm.elements().popBlock();
    manager.didRenderLayout(component, bounds);
    vm.env.didCreate(component, manager);
    vm.updateWith(new DidUpdateLayoutOpcode(manager, component, bounds));
});
APPEND_OPCODES.add(66 /* CommitComponentTransaction */, vm => vm.commitCacheGroup());
class UpdateComponentOpcode extends UpdatingOpcode {
    constructor(tag, name, component, manager, dynamicScope) {
        super();
        this.tag = tag;
        this.name = name;
        this.component = component;
        this.manager = manager;
        this.dynamicScope = dynamicScope;
        this.type = 'update-component';
    }
    evaluate(_vm) {
        let component = this.component,
            manager = this.manager,
            dynamicScope = this.dynamicScope;

        manager.update(component, dynamicScope);
    }
    toJSON() {
        return {
            args: [JSON.stringify(this.name)],
            guid: this._guid,
            type: this.type
        };
    }
}
class DidUpdateLayoutOpcode extends UpdatingOpcode {
    constructor(manager, component, bounds) {
        super();
        this.manager = manager;
        this.component = component;
        this.bounds = bounds;
        this.type = 'did-update-layout';
        this.tag = CONSTANT_TAG;
    }
    evaluate(vm) {
        let manager = this.manager,
            component = this.component,
            bounds = this.bounds;

        manager.didUpdateLayout(component, bounds);
        vm.env.didUpdate(component, manager);
    }
}

const COMPONENT_DEFINITION_BRAND = 'COMPONENT DEFINITION [id=e59c754e-61eb-4392-8c4a-2c0ac72bfcd4]';
function isComponentDefinition(obj) {
    return typeof obj === 'object' && obj !== null && obj[COMPONENT_DEFINITION_BRAND];
}
class ComponentDefinition {
    constructor(name, manager, ComponentClass) {
        this[COMPONENT_DEFINITION_BRAND] = true;
        this.name = name;
        this.manager = manager;
        this.ComponentClass = ComponentClass;
    }
}

class IsComponentDefinitionReference extends ConditionalReference {
    static create(inner) {
        return new IsComponentDefinitionReference(inner);
    }
    toBool(value) {
        return isComponentDefinition(value);
    }
}
APPEND_OPCODES.add(26 /* DynamicContent */, (vm, { op1: isTrusting }) => {
    let reference = vm.stack.pop();
    let value = reference.value();
    let content;
    if (isTrusting) {
        content = vm.elements().appendTrustingDynamicContent(value);
    } else {
        content = vm.elements().appendCautiousDynamicContent(value);
    }
    if (!isConst(reference)) {
        vm.updateWith(new UpdateDynamicContentOpcode(reference, content));
    }
});
class UpdateDynamicContentOpcode extends UpdatingOpcode {
    constructor(reference, content) {
        super();
        this.reference = reference;
        this.content = content;
        this.tag = reference.tag;
    }
    evaluate(vm) {
        let content = this.content,
            reference = this.reference;

        content.update(vm.env, reference.value());
    }
}

/* tslint:disable */
function debugCallback(context, get) {
    console.info('Use `context`, and `get(<path>)` to debug this template.');
    // for example...
    context === get('this');
    debugger;
}
/* tslint:enable */
let callback = debugCallback;
// For testing purposes


class ScopeInspector {
    constructor(scope, symbols, evalInfo) {
        this.scope = scope;
        this.locals = dict();
        for (let i = 0; i < evalInfo.length; i++) {
            let slot = evalInfo[i];
            let name = symbols[slot - 1];
            let ref = scope.getSymbol(slot);
            this.locals[name] = ref;
        }
    }
    get(path) {
        let scope = this.scope,
            locals = this.locals;

        let parts = path.split('.');

        var _path$split = path.split('.');

        let head = _path$split[0],
            tail = _path$split.slice(1);

        let evalScope = scope.getEvalScope();
        let ref;
        if (head === 'this') {
            ref = scope.getSelf();
        } else if (locals[head]) {
            ref = locals[head];
        } else if (head.indexOf('@') === 0 && evalScope[head]) {
            ref = evalScope[head];
        } else {
            ref = this.scope.getSelf();
            tail = parts;
        }
        return tail.reduce((r, part) => r.get(part), ref);
    }
}
APPEND_OPCODES.add(71 /* Debugger */, (vm, { op1: _symbols, op2: _evalInfo }) => {
    let symbols = vm.constants.getOther(_symbols);
    let evalInfo = vm.constants.getArray(_evalInfo);
    let inspector = new ScopeInspector(vm.scope(), symbols, evalInfo);
    callback(vm.getSelf().value(), path => inspector.get(path).value());
});

APPEND_OPCODES.add(69 /* GetPartialTemplate */, vm => {
    let stack = vm.stack;
    let definition = stack.pop();
    stack.push(definition.value().template.asPartial());
});

class IterablePresenceReference {
    constructor(artifacts) {
        this.tag = artifacts.tag;
        this.artifacts = artifacts;
    }
    value() {
        return !this.artifacts.isEmpty();
    }
}
APPEND_OPCODES.add(54 /* PutIterator */, vm => {
    let stack = vm.stack;
    let listRef = stack.pop();
    let key = stack.pop();
    let iterable = vm.env.iterableFor(listRef, key.value());
    let iterator = new ReferenceIterator(iterable);
    stack.push(iterator);
    stack.push(new IterablePresenceReference(iterator.artifacts));
});
APPEND_OPCODES.add(52 /* EnterList */, (vm, { op1: relativeStart }) => {
    vm.enterList(relativeStart);
});
APPEND_OPCODES.add(53 /* ExitList */, vm => vm.exitList());
APPEND_OPCODES.add(55 /* Iterate */, (vm, { op1: breaks }) => {
    let stack = vm.stack;
    let item = stack.peek().next();
    if (item) {
        let tryOpcode = vm.iterate(item.memo, item.value);
        vm.enterItem(item.key, tryOpcode);
    } else {
        vm.goto(breaks);
    }
});

class Cursor {
    constructor(element, nextSibling) {
        this.element = element;
        this.nextSibling = nextSibling;
    }
}
function currentNode(cursor) {
    let element = cursor.element,
        nextSibling = cursor.nextSibling;

    if (nextSibling === null) {
        return element.lastChild;
    } else {
        return nextSibling.previousSibling;
    }
}

class ConcreteBounds {
    constructor(parentNode, first, last) {
        this.parentNode = parentNode;
        this.first = first;
        this.last = last;
    }
    parentElement() {
        return this.parentNode;
    }
    firstNode() {
        return this.first;
    }
    lastNode() {
        return this.last;
    }
}
class SingleNodeBounds {
    constructor(parentNode, node) {
        this.parentNode = parentNode;
        this.node = node;
    }
    parentElement() {
        return this.parentNode;
    }
    firstNode() {
        return this.node;
    }
    lastNode() {
        return this.node;
    }
}
function bounds(parent, first, last) {
    return new ConcreteBounds(parent, first, last);
}
function single(parent, node) {
    return new SingleNodeBounds(parent, node);
}
function move(bounds, reference) {
    let parent = bounds.parentElement();
    let first = bounds.firstNode();
    let last = bounds.lastNode();
    let node = first;
    while (node) {
        let next = node.nextSibling;
        parent.insertBefore(node, reference);
        if (node === last) return next;
        node = next;
    }
    return null;
}
function clear(bounds) {
    let parent = bounds.parentElement();
    let first = bounds.firstNode();
    let last = bounds.lastNode();
    let node = first;
    while (node) {
        let next = node.nextSibling;
        parent.removeChild(node);
        if (node === last) return next;
        node = next;
    }
    return null;
}

class DynamicContentBase {
    constructor(trusting) {
        this.trusting = trusting;
    }
    retry(env, value) {
        let bounds$$1 = this.bounds;

        let parentElement = bounds$$1.parentElement();
        let nextSibling = clear(bounds$$1);
        let stack = NewElementBuilder.forInitialRender(env, parentElement, nextSibling);
        if (this.trusting) {
            return stack.__appendTrustingDynamicContent(value);
        } else {
            return stack.__appendCautiousDynamicContent(value);
        }
    }
}
class DynamicContentWrapper {
    constructor(inner) {
        this.inner = inner;
        this.bounds = inner.bounds;
    }
    parentElement() {
        return this.bounds.parentElement();
    }
    firstNode() {
        return this.bounds.firstNode();
    }
    lastNode() {
        return this.bounds.lastNode();
    }
    update(env, value) {
        let inner = this.inner = this.inner.update(env, value);
        this.bounds = inner.bounds;
        return this;
    }
}

class DynamicTextContent extends DynamicContentBase {
    constructor(bounds, lastValue, trusted) {
        super(trusted);
        this.bounds = bounds;
        this.lastValue = lastValue;
    }
    update(env, value) {
        let lastValue = this.lastValue;

        if (value === lastValue) return this;
        if (isNode(value) || isSafeString(value)) return this.retry(env, value);
        let normalized;
        if (isEmpty(value)) {
            normalized = '';
        } else if (isString(value)) {
            normalized = value;
        } else {
            normalized = String(value);
        }
        if (normalized !== lastValue) {
            let textNode = this.bounds.firstNode();
            textNode.nodeValue = this.lastValue = normalized;
        }
        return this;
    }
}

class DynamicNodeContent extends DynamicContentBase {
    constructor(bounds, lastValue, trusting) {
        super(trusting);
        this.bounds = bounds;
        this.lastValue = lastValue;
    }
    update(env, value) {
        let lastValue = this.lastValue;

        if (value === lastValue) return this;
        return this.retry(env, value);
    }
}

class DynamicHTMLContent extends DynamicContentBase {
    constructor(bounds, lastValue, trusted) {
        super(trusted);
        this.bounds = bounds;
        this.lastValue = lastValue;
    }
    update(env, value) {
        let lastValue = this.lastValue;

        if (value === lastValue) return this;
        if (isSafeString(value) && value.toHTML() === lastValue.toHTML()) {
            this.lastValue = value;
            return this;
        }
        return this.retry(env, value);
    }
}
class DynamicTrustedHTMLContent extends DynamicContentBase {
    constructor(bounds, lastValue, trusted) {
        super(trusted);
        this.bounds = bounds;
        this.lastValue = lastValue;
    }
    update(env, value) {
        let lastValue = this.lastValue;

        if (value === lastValue) return this;
        let newValue = normalizeTrustedValue(value);
        if (newValue === lastValue) return this;
        return this.retry(env, value);
    }
}

class First {
    constructor(node) {
        this.node = node;
    }
    firstNode() {
        return this.node;
    }
}
class Last {
    constructor(node) {
        this.node = node;
    }
    lastNode() {
        return this.node;
    }
}

class NewElementBuilder {
    constructor(env, parentNode, nextSibling) {
        this.constructing = null;
        this.operations = null;
        this.cursorStack = new Stack();
        this.blockStack = new Stack();
        this.cursorStack.push(new Cursor(parentNode, nextSibling));
        this.env = env;
        this.dom = env.getAppendOperations();
        this.updateOperations = env.getDOM();
    }
    static forInitialRender(env, parentNode, nextSibling) {
        let builder = new this(env, parentNode, nextSibling);
        builder.pushSimpleBlock();
        return builder;
    }
    static resume(env, tracker, nextSibling) {
        let parentNode = tracker.parentElement();
        let stack = new this(env, parentNode, nextSibling);
        stack.pushSimpleBlock();
        stack.pushBlockTracker(tracker);
        return stack;
    }
    get element() {
        return this.cursorStack.current.element;
    }
    get nextSibling() {
        return this.cursorStack.current.nextSibling;
    }
    expectConstructing(method) {
        return expect(this.constructing, `${method} should only be called while constructing an element`);
    }
    expectOperations(method) {
        return expect(this.operations, `${method} should only be called while constructing an element`);
    }
    block() {
        return expect(this.blockStack.current, "Expected a current block tracker");
    }
    popElement() {
        this.cursorStack.pop();
        expect(this.cursorStack.current, "can't pop past the last element");
    }
    pushSimpleBlock() {
        return this.pushBlockTracker(new SimpleBlockTracker(this.element));
    }
    pushUpdatableBlock() {
        return this.pushBlockTracker(new UpdatableBlockTracker(this.element));
    }
    pushBlockList(list) {
        return this.pushBlockTracker(new BlockListTracker(this.element, list));
    }
    pushBlockTracker(tracker, isRemote = false) {
        let current = this.blockStack.current;
        if (current !== null) {
            current.newDestroyable(tracker);
            if (!isRemote) {
                current.didAppendBounds(tracker);
            }
        }
        this.__openBlock();
        this.blockStack.push(tracker);
        return tracker;
    }
    popBlock() {
        this.block().finalize(this);
        this.__closeBlock();
        return expect(this.blockStack.pop(), "Expected popBlock to return a block");
    }
    __openBlock() {}
    __closeBlock() {}
    openElement(tag) {
        let element = this.__openElement(tag);
        this.constructing = element;
        return element;
    }
    __openElement(tag) {
        return this.dom.createElement(tag, this.element);
    }
    flushElement() {
        let parent = this.element;
        let element = expect(this.constructing, `flushElement should only be called when constructing an element`);
        this.__flushElement(parent, element);
        this.constructing = null;
        this.operations = null;
        this.pushElement(element, null);
        this.didOpenElement(element);
    }
    __flushElement(parent, constructing) {
        this.dom.insertBefore(parent, constructing, this.nextSibling);
    }
    closeElement() {
        this.willCloseElement();
        this.popElement();
    }
    pushRemoteElement(element, nextSibling = null) {
        this.pushElement(element, nextSibling);
        let tracker = new RemoteBlockTracker(element);
        this.pushBlockTracker(tracker, true);
    }
    popRemoteElement() {
        this.popBlock();
        this.popElement();
    }
    pushElement(element, nextSibling) {
        this.cursorStack.push(new Cursor(element, nextSibling));
    }
    didAddDestroyable(d) {
        this.block().newDestroyable(d);
    }
    didAppendBounds(bounds$$1) {
        this.block().didAppendBounds(bounds$$1);
        return bounds$$1;
    }
    didAppendNode(node) {
        this.block().didAppendNode(node);
        return node;
    }
    didOpenElement(element) {
        this.block().openElement(element);
        return element;
    }
    willCloseElement() {
        this.block().closeElement();
    }
    appendText(string) {
        return this.didAppendNode(this.__appendText(string));
    }
    __appendText(text) {
        let dom = this.dom,
            element = this.element,
            nextSibling = this.nextSibling;

        let node = dom.createTextNode(text);
        dom.insertBefore(element, node, nextSibling);
        return node;
    }
    appendNode(node) {
        return this.didAppendNode(this.__appendNode(node));
    }
    __appendNode(node) {
        this.dom.insertBefore(this.element, node, this.nextSibling);
        return node;
    }
    appendFragment(fragment) {
        return this.didAppendBounds(this.__appendFragment(fragment));
    }
    __appendFragment(fragment) {
        let first = fragment.firstChild;
        if (first) {
            let ret = bounds(this.element, first, fragment.lastChild);
            this.dom.insertBefore(this.element, fragment, this.nextSibling);
            return ret;
        } else {
            return single(this.element, this.__appendComment(''));
        }
    }
    appendHTML(html) {
        return this.didAppendBounds(this.__appendHTML(html));
    }
    __appendHTML(html) {
        return this.dom.insertHTMLBefore(this.element, this.nextSibling, html);
    }
    appendTrustingDynamicContent(value) {
        let wrapper = new DynamicContentWrapper(this.__appendTrustingDynamicContent(value));
        this.didAppendBounds(wrapper);
        return wrapper;
    }
    __appendTrustingDynamicContent(value) {
        if (isFragment(value)) {
            let bounds$$1 = this.__appendFragment(value);
            return new DynamicNodeContent(bounds$$1, value, true);
        } else if (isNode(value)) {
            let node = this.__appendNode(value);
            return new DynamicNodeContent(single(this.element, node), node, true);
        } else {
            let normalized;
            if (isEmpty(value)) {
                normalized = '';
            } else if (isSafeString(value)) {
                normalized = value.toHTML();
            } else if (isString(value)) {
                normalized = value;
            } else {
                normalized = String(value);
            }
            let bounds$$1 = this.__appendHTML(normalized);
            return new DynamicTrustedHTMLContent(bounds$$1, normalized, true);
        }
    }
    appendCautiousDynamicContent(value) {
        let wrapper = new DynamicContentWrapper(this.__appendCautiousDynamicContent(value));
        this.didAppendBounds(wrapper.bounds);
        return wrapper;
    }
    __appendCautiousDynamicContent(value) {
        if (isFragment(value)) {
            let bounds$$1 = this.__appendFragment(value);
            return new DynamicNodeContent(bounds$$1, value, false);
        } else if (isNode(value)) {
            let node = this.__appendNode(value);
            return new DynamicNodeContent(single(this.element, node), node, false);
        } else if (isSafeString(value)) {
            let normalized = value.toHTML();
            let bounds$$1 = this.__appendHTML(normalized);
            // let bounds = this.dom.insertHTMLBefore(this.element, this.nextSibling, normalized);
            return new DynamicHTMLContent(bounds$$1, value, false);
        } else {
            let normalized;
            if (isEmpty(value)) {
                normalized = '';
            } else if (isString(value)) {
                normalized = value;
            } else {
                normalized = String(value);
            }
            let textNode = this.__appendText(normalized);
            let bounds$$1 = single(this.element, textNode);
            return new DynamicTextContent(bounds$$1, normalized, false);
        }
    }
    appendComment(string) {
        return this.didAppendNode(this.__appendComment(string));
    }
    __appendComment(string) {
        let dom = this.dom,
            element = this.element,
            nextSibling = this.nextSibling;

        let node = dom.createComment(string);
        dom.insertBefore(element, node, nextSibling);
        return node;
    }
    __setAttribute(name, value, namespace) {
        this.dom.setAttribute(this.constructing, name, value, namespace);
    }
    __setProperty(name, value) {
        this.constructing[name] = value;
    }
    setStaticAttribute(name, value, namespace) {
        this.__setAttribute(name, value, namespace);
    }
    setDynamicAttribute(name, value, trusting, namespace) {
        let element = this.constructing;
        let DynamicAttribute = this.env.attributeFor(element, name, trusting, namespace);
        let attribute = new DynamicAttribute({ element, name, namespace: namespace || null });
        attribute.set(this, value, this.env);
        return attribute;
    }
}
class SimpleBlockTracker {
    constructor(parent) {
        this.parent = parent;
        this.first = null;
        this.last = null;
        this.destroyables = null;
        this.nesting = 0;
    }
    destroy() {
        let destroyables = this.destroyables;

        if (destroyables && destroyables.length) {
            for (let i = 0; i < destroyables.length; i++) {
                destroyables[i].destroy();
            }
        }
    }
    parentElement() {
        return this.parent;
    }
    firstNode() {
        return this.first && this.first.firstNode();
    }
    lastNode() {
        return this.last && this.last.lastNode();
    }
    openElement(element) {
        this.didAppendNode(element);
        this.nesting++;
    }
    closeElement() {
        this.nesting--;
    }
    didAppendNode(node) {
        if (this.nesting !== 0) return;
        if (!this.first) {
            this.first = new First(node);
        }
        this.last = new Last(node);
    }
    didAppendBounds(bounds$$1) {
        if (this.nesting !== 0) return;
        if (!this.first) {
            this.first = bounds$$1;
        }
        this.last = bounds$$1;
    }
    newDestroyable(d) {
        this.destroyables = this.destroyables || [];
        this.destroyables.push(d);
    }
    finalize(stack) {
        if (!this.first) {
            stack.appendComment('');
        }
    }
}
class RemoteBlockTracker extends SimpleBlockTracker {
    destroy() {
        super.destroy();
        clear(this);
    }
}
class UpdatableBlockTracker extends SimpleBlockTracker {
    reset(env) {
        let destroyables = this.destroyables;

        if (destroyables && destroyables.length) {
            for (let i = 0; i < destroyables.length; i++) {
                env.didDestroy(destroyables[i]);
            }
        }
        let nextSibling = clear(this);
        this.first = null;
        this.last = null;
        this.destroyables = null;
        this.nesting = 0;
        return nextSibling;
    }
}
class BlockListTracker {
    constructor(parent, boundList) {
        this.parent = parent;
        this.boundList = boundList;
        this.parent = parent;
        this.boundList = boundList;
    }
    destroy() {
        this.boundList.forEachNode(node => node.destroy());
    }
    parentElement() {
        return this.parent;
    }
    firstNode() {
        let head = this.boundList.head();
        return head && head.firstNode();
    }
    lastNode() {
        let tail = this.boundList.tail();
        return tail && tail.lastNode();
    }
    openElement(_element) {
        debugAssert(false, 'Cannot openElement directly inside a block list');
    }
    closeElement() {
        debugAssert(false, 'Cannot closeElement directly inside a block list');
    }
    didAppendNode(_node) {
        debugAssert(false, 'Cannot create a new node directly inside a block list');
    }
    didAppendBounds(_bounds) {}
    newDestroyable(_d) {}
    finalize(_stack) {}
}

class RehydrateBuilder extends NewElementBuilder {
    constructor(env, parentNode, nextSibling) {
        super(env, parentNode, nextSibling);
        // The last node that matched
        this.lastMatchedNode = null;
        this.unmatchedAttributes = null;
        this.blockDepth = 0;
        if (nextSibling) throw new Error("Rehydration with nextSibling not supported");
        this._candidate = parentNode.firstChild;
    }
    get candidate() {
        let candidate = this._candidate;
        if (!candidate) return null;
        if (isComment(candidate) && getCloseBoundsDepth(candidate) === this.blockDepth) {
            return null;
        } else {
            return candidate;
        }
    }
    clearMismatch(candidate) {
        if (isComment(candidate)) {
            let depth = getOpenBoundsDepth(candidate);
            if (depth !== null) {
                this.clearBlock(depth);
                return;
            }
        }
        let current = candidate;
        let until = this.nextSibling;
        while (current && current !== until) {
            current = remove(current);
        }
        this._candidate = null;
    }
    clearBlock(depth) {
        let current = this._candidate;
        while (current && !(isComment(current) && getCloseBoundsDepth(current) === depth)) {
            current = remove(current);
        }
        debugAssert(current && isComment(current) && getCloseBoundsDepth(current) === depth, 'An opening block should be paired with a closing block comment');
        this._candidate = remove(current);
    }
    __openBlock() {
        let candidate = this.candidate;

        if (candidate) {
            if (isComment(candidate)) {
                let depth = getOpenBoundsDepth(candidate);
                if (depth !== null) this.blockDepth = depth;
                this._candidate = remove(candidate);
                return;
            } else {
                this.clearMismatch(candidate);
            }
        }
    }
    __closeBlock() {
        let candidate = this._candidate;

        if (candidate) {
            if (isComment(candidate)) {
                let depth = getCloseBoundsDepth(candidate);
                if (depth !== null) this.blockDepth = depth - 1;
                this._candidate = remove(candidate);
                return;
            } else {
                this.clearMismatch(candidate);
            }
        }
    }
    __appendNode(node) {
        let candidate = this.candidate;
        // This code path is only used when inserting precisely one node. It needs more
        // comparison logic, but we can probably lean on the cases where this code path
        // is actually used.

        if (candidate) {
            return candidate;
        } else {
            return super.__appendNode(node);
        }
    }
    __appendHTML(html) {
        let candidateBounds = this.markerBounds();
        if (candidateBounds) {
            let first = candidateBounds.firstNode();
            let last = candidateBounds.lastNode();
            let newBounds = bounds(this.element, first.nextSibling, last.previousSibling);
            remove(first);
            remove(last);
            return newBounds;
        } else {
            return super.__appendHTML(html);
        }
    }
    markerBounds() {
        let _candidate = this._candidate;

        if (_candidate && isMarker(_candidate)) {
            let first = _candidate;
            let last = expect(first.nextSibling, `BUG: serialization markers must be paired`);
            while (last && !isMarker(last)) {
                last = expect(last.nextSibling, `BUG: serialization markers must be paired`);
            }
            return bounds(this.element, first, last);
        } else {
            return null;
        }
    }
    __appendText(string) {
        let candidate = this.candidate;

        if (candidate) {
            if (isEmpty$1(candidate)) {
                let next = this._candidate = remove(candidate);
                let text = this.dom.createTextNode(string);
                this.dom.insertBefore(this.element, text, next);
                return text;
            }
            if (isTextNode(candidate)) {
                candidate.nodeValue = string;
                this.lastMatchedNode = candidate;
                this._candidate = candidate.nextSibling;
                return candidate;
            } else if (candidate && (isSeparator(candidate) || isEmpty$1(candidate))) {
                this._candidate = candidate.nextSibling;
                remove(candidate);
                return this.__appendText(string);
            } else {
                this.clearMismatch(candidate);
                return super.__appendText(string);
            }
        } else {
            return super.__appendText(string);
        }
    }
    __appendComment(string) {
        let _candidate = this._candidate;

        if (_candidate && isComment(_candidate)) {
            _candidate.nodeValue = string;
            this.lastMatchedNode = _candidate;
            this._candidate = _candidate.nextSibling;
            return _candidate;
        } else if (_candidate) {
            this.clearMismatch(_candidate);
        }
        return super.__appendComment(string);
    }
    __openElement(tag, _operations) {
        let _candidate = this._candidate;

        if (_candidate && isElement(_candidate) && _candidate.tagName === tag.toUpperCase()) {
            this.unmatchedAttributes = [].slice.call(_candidate.attributes);
            this._candidate = _candidate.firstChild;
            return _candidate;
        } else if (_candidate) {
            this.clearMismatch(_candidate);
        }
        return super.__openElement(tag);
    }
    __setAttribute(name, value, namespace) {
        let unmatched = this.unmatchedAttributes;
        if (unmatched) {
            let attr = findByName(unmatched, name);
            if (attr) {
                attr.value = value;
                unmatched.splice(unmatched.indexOf(attr), 1);
                return;
            }
        }
        return super.__setAttribute(name, value, namespace);
    }
    __setProperty(name, value) {
        let unmatched = this.unmatchedAttributes;
        if (unmatched) {
            let attr = findByName(unmatched, name);
            if (attr) {
                attr.value = value;
                unmatched.splice(unmatched.indexOf(attr), 1);
                return;
            }
        }
        return super.__setProperty(name, value);
    }
    __flushElement(parent, constructing) {
        let unmatched = this.unmatchedAttributes;

        if (unmatched) {
            for (let i = 0; i < unmatched.length; i++) {
                this.constructing.removeAttribute(unmatched[i].name);
            }
            this.unmatchedAttributes = null;
        } else {
            super.__flushElement(parent, constructing);
        }
    }
    appendCautiousDynamicContent(value) {
        let content = super.appendCautiousDynamicContent(value);
        content.update(this.env, value);
        return content;
    }
    willCloseElement() {
        let candidate = this.candidate;

        if (candidate) {
            this.clearMismatch(candidate);
        }
        this._candidate = this.element.nextSibling;
        this.lastMatchedNode = this.element;
        super.willCloseElement();
    }
    pushRemoteElement(_element, _nextSibling = null) {
        throw unimplemented();
    }
    popRemoteElement() {
        throw unimplemented();
    }
    didAppendBounds(bounds$$1) {
        super.didAppendBounds(bounds$$1);
        let last = bounds$$1.lastNode();
        this._candidate = last && last.nextSibling;
        return bounds$$1;
    }
    didOpenElement(element) {
        super.didOpenElement(element);
        this._candidate = element.firstChild;
        return element;
    }
}
function isTextNode(node) {
    return node.nodeType === 3;
}
function isComment(node) {
    return node.nodeType === 8;
}
function getOpenBoundsDepth(node) {
    let boundsDepth = node.nodeValue.match(/^%\+bounds:(\d+)%$/);
    if (boundsDepth && boundsDepth[1]) {
        return Number(boundsDepth[1]);
    } else {
        return null;
    }
}
function getCloseBoundsDepth(node) {
    let boundsDepth = node.nodeValue.match(/^%\-bounds:(\d+)%$/);
    if (boundsDepth && boundsDepth[1]) {
        return Number(boundsDepth[1]);
    } else {
        return null;
    }
}
function isElement(node) {
    return node.nodeType === 1;
}
function isMarker(node) {
    return node.nodeType === 8 && node.nodeValue === '%glimmer%';
}
function isSeparator(node) {
    return node.nodeType === 8 && node.nodeValue === '%sep%';
}
function isEmpty$1(node) {
    return node.nodeType === 8 && node.nodeValue === '%empty%';
}
function remove(node) {
    let element = expect(node.parentNode, `cannot remove a detached node`);
    let next = node.nextSibling;
    element.removeChild(node);
    return next;
}
function findByName(array, name) {
    for (let i = 0; i < array.length; i++) {
        let attr = array[i];
        if (attr.name === name) return attr;
    }
    return undefined;
}
function unimplemented() {
    return new Error('Not implemented');
}

class SerializeBuilder extends NewElementBuilder {
    constructor() {
        super(...arguments);
        this.serializeBlockDepth = 0;
    }
    __openBlock() {
        let depth = this.serializeBlockDepth++;
        this.__appendComment(`%+block:${depth}%`);
        super.__openBlock();
    }
    __closeBlock() {
        super.__closeBlock();
        this.__appendComment(`%-block:${--this.serializeBlockDepth}%`);
    }
    __appendHTML(html) {
        let first = this.__appendComment('%glimmer%');
        super.__appendHTML(html);
        let last = this.__appendComment('%glimmer%');
        return bounds(this.element, first, last);
    }
    __appendText(string) {
        let current = currentNode(this);
        if (string === '') {
            return this.__appendComment('%empty%');
        } else if (current && current.nodeType === Node.TEXT_NODE) {
            this.__appendComment('%sep%');
        }
        return super.__appendText(string);
    }
}

var Opcodes;
(function (Opcodes) {
    // Statements
    Opcodes[Opcodes["Text"] = 0] = "Text";
    Opcodes[Opcodes["Append"] = 1] = "Append";
    Opcodes[Opcodes["Comment"] = 2] = "Comment";
    Opcodes[Opcodes["Modifier"] = 3] = "Modifier";
    Opcodes[Opcodes["Block"] = 4] = "Block";
    Opcodes[Opcodes["Component"] = 5] = "Component";
    Opcodes[Opcodes["OpenElement"] = 6] = "OpenElement";
    Opcodes[Opcodes["FlushElement"] = 7] = "FlushElement";
    Opcodes[Opcodes["CloseElement"] = 8] = "CloseElement";
    Opcodes[Opcodes["StaticAttr"] = 9] = "StaticAttr";
    Opcodes[Opcodes["DynamicAttr"] = 10] = "DynamicAttr";
    Opcodes[Opcodes["Yield"] = 11] = "Yield";
    Opcodes[Opcodes["Partial"] = 12] = "Partial";
    Opcodes[Opcodes["DynamicArg"] = 13] = "DynamicArg";
    Opcodes[Opcodes["StaticArg"] = 14] = "StaticArg";
    Opcodes[Opcodes["TrustingAttr"] = 15] = "TrustingAttr";
    Opcodes[Opcodes["Debugger"] = 16] = "Debugger";
    Opcodes[Opcodes["ClientSideStatement"] = 17] = "ClientSideStatement";
    // Expressions
    Opcodes[Opcodes["Unknown"] = 18] = "Unknown";
    Opcodes[Opcodes["Get"] = 19] = "Get";
    Opcodes[Opcodes["MaybeLocal"] = 20] = "MaybeLocal";
    Opcodes[Opcodes["FixThisBeforeWeMerge"] = 21] = "FixThisBeforeWeMerge";
    Opcodes[Opcodes["HasBlock"] = 22] = "HasBlock";
    Opcodes[Opcodes["HasBlockParams"] = 23] = "HasBlockParams";
    Opcodes[Opcodes["Undefined"] = 24] = "Undefined";
    Opcodes[Opcodes["Helper"] = 25] = "Helper";
    Opcodes[Opcodes["Concat"] = 26] = "Concat";
    Opcodes[Opcodes["ClientSideExpression"] = 27] = "ClientSideExpression";
})(Opcodes || (Opcodes = {}));

function is(variant) {
    return function (value) {
        return Array.isArray(value) && value[0] === variant;
    };
}
var Expressions;
(function (Expressions) {
    Expressions.isUnknown = is(Opcodes.Unknown);
    Expressions.isGet = is(Opcodes.Get);
    Expressions.isConcat = is(Opcodes.Concat);
    Expressions.isHelper = is(Opcodes.Helper);
    Expressions.isHasBlock = is(Opcodes.HasBlock);
    Expressions.isHasBlockParams = is(Opcodes.HasBlockParams);
    Expressions.isUndefined = is(Opcodes.Undefined);
    Expressions.isClientSide = is(Opcodes.ClientSideExpression);
    Expressions.isMaybeLocal = is(Opcodes.MaybeLocal);
    function isPrimitiveValue(value) {
        if (value === null) {
            return true;
        }
        return typeof value !== 'object';
    }
    Expressions.isPrimitiveValue = isPrimitiveValue;
})(Expressions || (Expressions = {}));
var Statements;
(function (Statements) {
    Statements.isText = is(Opcodes.Text);
    Statements.isAppend = is(Opcodes.Append);
    Statements.isComment = is(Opcodes.Comment);
    Statements.isModifier = is(Opcodes.Modifier);
    Statements.isBlock = is(Opcodes.Block);
    Statements.isComponent = is(Opcodes.Component);
    Statements.isOpenElement = is(Opcodes.OpenElement);
    Statements.isFlushElement = is(Opcodes.FlushElement);
    Statements.isCloseElement = is(Opcodes.CloseElement);
    Statements.isStaticAttr = is(Opcodes.StaticAttr);
    Statements.isDynamicAttr = is(Opcodes.DynamicAttr);
    Statements.isYield = is(Opcodes.Yield);
    Statements.isPartial = is(Opcodes.Partial);
    Statements.isDynamicArg = is(Opcodes.DynamicArg);
    Statements.isStaticArg = is(Opcodes.StaticArg);
    Statements.isTrustingAttr = is(Opcodes.TrustingAttr);
    Statements.isDebugger = is(Opcodes.Debugger);
    Statements.isClientSide = is(Opcodes.ClientSideStatement);
    function isAttribute(val) {
        return val[0] === Opcodes.StaticAttr || val[0] === Opcodes.DynamicAttr || val[0] === Opcodes.TrustingAttr;
    }
    Statements.isAttribute = isAttribute;
    function isArgument(val) {
        return val[0] === Opcodes.StaticArg || val[0] === Opcodes.DynamicArg;
    }
    Statements.isArgument = isArgument;
    function isParameter(val) {
        return isAttribute(val) || isArgument(val);
    }
    Statements.isParameter = isParameter;
    function getParameterName(s) {
        return s[1];
    }
    Statements.getParameterName = getParameterName;
})(Statements || (Statements = {}));

var Ops$1;
(function (Ops) {
    Ops[Ops["OpenComponentElement"] = 0] = "OpenComponentElement";
    Ops[Ops["DidCreateElement"] = 1] = "DidCreateElement";
    Ops[Ops["SetComponentAttrs"] = 2] = "SetComponentAttrs";
    Ops[Ops["DidRenderLayout"] = 3] = "DidRenderLayout";
    Ops[Ops["FunctionExpression"] = 4] = "FunctionExpression";
    Ops[Ops["Debugger"] = 5] = "Debugger";
})(Ops$1 || (Ops$1 = {}));

class CompiledStaticTemplate {
    constructor(handle) {
        this.handle = handle;
    }
}
class CompiledDynamicTemplate {
    constructor(handle, symbolTable) {
        this.handle = handle;
        this.symbolTable = symbolTable;
    }
}

function compileLayout(compilable, env) {
    let builder = new ComponentLayoutBuilder(env);
    compilable.compile(builder);
    return builder.compile();
}
class ComponentLayoutBuilder {
    constructor(env) {
        this.env = env;
    }
    wrapLayout(layout) {
        this.inner = new WrappedBuilder(this.env, layout);
    }
    fromLayout(componentName, layout) {
        this.inner = new UnwrappedBuilder(this.env, componentName, layout);
    }
    compile() {
        return this.inner.compile();
    }
    get tag() {
        return this.inner.tag;
    }
    get attrs() {
        return this.inner.attrs;
    }
}
class WrappedBuilder {
    constructor(env, layout) {
        this.env = env;
        this.layout = layout;
        this.tag = new ComponentTagBuilder();
        this.attrs = new ComponentAttrsBuilder();
    }
    compile() {
        //========DYNAMIC
        //        PutValue(TagExpr)
        //        Test
        //        JumpUnless(BODY)
        //        OpenDynamicPrimitiveElement
        //        DidCreateElement
        //        ...attr statements...
        //        FlushElement
        // BODY:  Noop
        //        ...body statements...
        //        PutValue(TagExpr)
        //        Test
        //        JumpUnless(END)
        //        CloseElement
        // END:   Noop
        //        DidRenderLayout
        //        Exit
        //
        //========STATIC
        //        OpenPrimitiveElementOpcode
        //        DidCreateElement
        //        ...attr statements...
        //        FlushElement
        //        ...body statements...
        //        CloseElement
        //        DidRenderLayout
        //        Exit
        let env = this.env,
            layout = this.layout;

        let meta = { templateMeta: layout.meta, symbols: layout.symbols, asPartial: false };
        let dynamicTag = this.tag.getDynamic();
        let staticTag = this.tag.getStatic();
        let b = builder(env, meta);
        b.startLabels();
        if (dynamicTag) {
            b.fetch(Register.s1);
            expr(dynamicTag, b);
            b.dup();
            b.load(Register.s1);
            b.test('simple');
            b.jumpUnless('BODY');
            b.fetch(Register.s1);
            b.putComponentOperations();
            b.openDynamicElement();
        } else if (staticTag) {
            b.putComponentOperations();
            b.openElementWithOperations(staticTag);
        }
        if (dynamicTag || staticTag) {
            b.didCreateElement(Register.s0);
            let attrs = this.attrs.buffer;
            b.setComponentAttrs(true);
            for (let i = 0; i < attrs.length; i++) {
                compileStatement(attrs[i], b);
            }
            b.setComponentAttrs(false);
            b.flushElement();
        }
        b.label('BODY');
        b.invokeStatic(layout.asBlock());
        if (dynamicTag) {
            b.fetch(Register.s1);
            b.test('simple');
            b.jumpUnless('END');
            b.closeElement();
        } else if (staticTag) {
            b.closeElement();
        }
        b.label('END');
        b.didRenderLayout(Register.s0);
        if (dynamicTag) {
            b.load(Register.s1);
        }
        b.stopLabels();
        let start = b.start;
        let end = b.finalize();
        return new CompiledDynamicTemplate(start, {
            meta,
            hasEval: layout.hasEval,
            symbols: layout.symbols.concat([ATTRS_BLOCK])
        });
    }
}
class UnwrappedBuilder {
    constructor(env, componentName, layout) {
        this.env = env;
        this.componentName = componentName;
        this.layout = layout;
        this.attrs = new ComponentAttrsBuilder();
    }
    get tag() {
        throw new Error('BUG: Cannot call `tag` on an UnwrappedBuilder');
    }
    compile() {
        let env = this.env,
            layout = this.layout;

        return layout.asLayout(this.componentName, this.attrs.buffer).compileDynamic(env);
    }
}
class ComponentTagBuilder {
    constructor() {
        this.isDynamic = null;
        this.isStatic = null;
        this.staticTagName = null;
        this.dynamicTagName = null;
    }
    getDynamic() {
        if (this.isDynamic) {
            return this.dynamicTagName;
        }
    }
    getStatic() {
        if (this.isStatic) {
            return this.staticTagName;
        }
    }
    static(tagName) {
        this.isStatic = true;
        this.staticTagName = tagName;
    }
    dynamic(tagName) {
        this.isDynamic = true;
        this.dynamicTagName = [Opcodes.ClientSideExpression, Ops$1.FunctionExpression, tagName];
    }
}
class ComponentAttrsBuilder {
    constructor() {
        this.buffer = [];
    }
    static(name, value) {
        this.buffer.push([Opcodes.StaticAttr, name, value, null]);
    }
    dynamic(name, value) {
        this.buffer.push([Opcodes.DynamicAttr, name, [Opcodes.ClientSideExpression, Ops$1.FunctionExpression, value], null]);
    }
}
class ComponentBuilder {
    constructor(builder) {
        this.builder = builder;
        this.env = builder.env;
    }
    static(definition, args) {
        let params = args[0],
            hash = args[1],
            _default = args[2],
            inverse = args[3];
        let builder = this.builder;

        builder.pushComponentManager(definition);
        builder.invokeComponent(null, params, hash, _default, inverse);
    }
    dynamic(definitionArgs, getDefinition, args) {
        let params = args[0],
            hash = args[1],
            block = args[2],
            inverse = args[3];
        let builder = this.builder;

        if (!definitionArgs || definitionArgs.length === 0) {
            throw new Error("Dynamic syntax without an argument");
        }
        let meta = this.builder.meta.templateMeta;
        function helper(vm, a) {
            return getDefinition(vm, a, meta);
        }
        builder.startLabels();
        builder.pushFrame();
        builder.returnTo('END');
        builder.compileArgs(definitionArgs[0], definitionArgs[1], true);
        builder.helper(helper);
        builder.dup();
        builder.test('simple');
        builder.enter(2);
        builder.jumpUnless('ELSE');
        builder.pushDynamicComponentManager();
        builder.invokeComponent(null, params, hash, block, inverse);
        builder.label('ELSE');
        builder.exit();
        builder.return();
        builder.label('END');
        builder.popFrame();
        builder.stopLabels();
    }
}
function builder(env, meta) {
    return new OpcodeBuilder(env, meta);
}

class RawInlineBlock {
    constructor(meta, statements, parameters) {
        this.meta = meta;
        this.statements = statements;
        this.parameters = parameters;
    }
    scan() {
        return new CompilableTemplate(this.statements, { parameters: this.parameters, meta: this.meta });
    }
}

class Labels {
    constructor() {
        this.labels = dict();
        this.targets = [];
    }
    label(name, index) {
        this.labels[name] = index;
    }
    target(at, Target, target) {
        this.targets.push({ at, Target, target });
    }
    patch(program) {
        let targets = this.targets,
            labels = this.labels;

        for (let i = 0; i < targets.length; i++) {
            var _targets$i = targets[i];
            let at = _targets$i.at,
                target = _targets$i.target;

            let goto = labels[target] - at;
            program.heap.setbyaddr(at + 1, goto);
        }
    }
}
class BasicOpcodeBuilder {
    constructor(env, meta, program) {
        this.env = env;
        this.meta = meta;
        this.program = program;
        this.labelsStack = new Stack();
        this.isComponentAttrs = false;
        this.constants = program.constants;
        this.heap = program.heap;
        this.start = this.heap.malloc();
    }
    get pos() {
        return typePos(this.heap.size());
    }
    get nextPos() {
        return this.heap.size();
    }
    upvars(count) {
        return fillNulls(count);
    }
    reserve(name) {
        this.push(name, 0, 0, 0);
    }
    push(name, op1 = 0, op2 = 0, op3 = 0) {
        this.heap.push(name);
        this.heap.push(op1);
        this.heap.push(op2);
        this.heap.push(op3);
    }
    finalize() {
        this.push(22 /* Return */);
        this.heap.finishMalloc(this.start);
        return this.start;
    }
    setComponentAttrs(enabled) {
        this.isComponentAttrs = enabled;
    }
    // args
    pushArgs(synthetic) {
        this.push(58 /* PushArgs */, synthetic === true ? 1 : 0);
    }
    // helpers
    get labels() {
        return expect(this.labelsStack.current, 'bug: not in a label stack');
    }
    startLabels() {
        this.labelsStack.push(new Labels());
    }
    stopLabels() {
        let label = expect(this.labelsStack.pop(), 'unbalanced push and pop labels');
        label.patch(this.program);
    }
    // components
    pushComponentManager(definition) {
        this.push(56 /* PushComponentManager */, this.other(definition));
    }
    pushDynamicComponentManager() {
        this.push(57 /* PushDynamicComponentManager */);
    }
    prepareArgs(state) {
        this.push(59 /* PrepareArgs */, state);
    }
    createComponent(state, hasDefault, hasInverse) {
        let flag = (hasDefault === true ? 1 : 0) | (hasInverse === true ? 1 : 0) << 1;
        this.push(60 /* CreateComponent */, flag, state);
    }
    registerComponentDestructor(state) {
        this.push(61 /* RegisterComponentDestructor */, state);
    }
    beginComponentTransaction() {
        this.push(65 /* BeginComponentTransaction */);
    }
    commitComponentTransaction() {
        this.push(66 /* CommitComponentTransaction */);
    }
    putComponentOperations() {
        this.push(62 /* PutComponentOperations */);
    }
    getComponentSelf(state) {
        this.push(63 /* GetComponentSelf */, state);
    }
    getComponentLayout(state) {
        this.push(64 /* GetComponentLayout */, state);
    }
    didCreateElement(state) {
        this.push(67 /* DidCreateElement */, state);
    }
    didRenderLayout(state) {
        this.push(68 /* DidRenderLayout */, state);
    }
    // partial
    getPartialTemplate() {
        this.push(69 /* GetPartialTemplate */);
    }
    resolveMaybeLocal(name) {
        this.push(70 /* ResolveMaybeLocal */, this.string(name));
    }
    // debugger
    debugger(symbols, evalInfo) {
        this.push(71 /* Debugger */, this.constants.other(symbols), this.constants.array(evalInfo));
    }
    // content
    dynamicContent(isTrusting) {
        this.push(26 /* DynamicContent */, isTrusting ? 1 : 0);
    }
    // dom
    text(text) {
        this.push(24 /* Text */, this.constants.string(text));
    }
    openPrimitiveElement(tag) {
        this.push(27 /* OpenElement */, this.constants.string(tag));
    }
    openElementWithOperations(tag) {
        this.push(28 /* OpenElementWithOperations */, this.constants.string(tag));
    }
    openDynamicElement() {
        this.push(29 /* OpenDynamicElement */);
    }
    flushElement() {
        this.push(33 /* FlushElement */);
    }
    closeElement() {
        this.push(34 /* CloseElement */);
    }
    staticAttr(_name, _namespace, _value) {
        let name = this.constants.string(_name);
        let namespace = _namespace ? this.constants.string(_namespace) : 0;
        if (this.isComponentAttrs) {
            this.primitive(_value);
            this.push(32 /* ComponentAttr */, name, 1, namespace);
        } else {
            let value = this.constants.string(_value);
            this.push(30 /* StaticAttr */, name, value, namespace);
        }
    }
    dynamicAttr(_name, _namespace, trusting) {
        let name = this.constants.string(_name);
        let namespace = _namespace ? this.constants.string(_namespace) : 0;
        if (this.isComponentAttrs) {
            this.push(32 /* ComponentAttr */, name, trusting === true ? 1 : 0, namespace);
        } else {
            this.push(31 /* DynamicAttr */, name, trusting === true ? 1 : 0, namespace);
        }
    }
    comment(_comment) {
        let comment = this.constants.string(_comment);
        this.push(25 /* Comment */, comment);
    }
    modifier(_definition) {
        this.push(35 /* Modifier */, this.other(_definition));
    }
    // lists
    putIterator() {
        this.push(54 /* PutIterator */);
    }
    enterList(start) {
        this.reserve(52 /* EnterList */);
        this.labels.target(this.pos, 52 /* EnterList */, start);
    }
    exitList() {
        this.push(53 /* ExitList */);
    }
    iterate(breaks) {
        this.reserve(55 /* Iterate */);
        this.labels.target(this.pos, 55 /* Iterate */, breaks);
    }
    // expressions
    setVariable(symbol) {
        this.push(4 /* SetVariable */, symbol);
    }
    getVariable(symbol) {
        this.push(5 /* GetVariable */, symbol);
    }
    getProperty(key) {
        this.push(6 /* GetProperty */, this.string(key));
    }
    getBlock(symbol) {
        this.push(8 /* GetBlock */, symbol);
    }
    hasBlock(symbol) {
        this.push(9 /* HasBlock */, symbol);
    }
    hasBlockParams(symbol) {
        this.push(10 /* HasBlockParams */, symbol);
    }
    concat(size) {
        this.push(11 /* Concat */, size);
    }
    function(f) {
        this.push(2 /* Function */, this.func(f));
    }
    load(register) {
        this.push(17 /* Load */, register);
    }
    fetch(register) {
        this.push(18 /* Fetch */, register);
    }
    dup(register = Register.sp, offset = 0) {
        return this.push(15 /* Dup */, register, offset);
    }
    pop(count = 1) {
        return this.push(16 /* Pop */, count);
    }
    // vm
    pushRemoteElement() {
        this.push(36 /* PushRemoteElement */);
    }
    popRemoteElement() {
        this.push(37 /* PopRemoteElement */);
    }
    label(name) {
        this.labels.label(name, this.nextPos);
    }
    pushRootScope(symbols, bindCallerScope) {
        this.push(19 /* RootScope */, symbols, bindCallerScope ? 1 : 0);
    }
    pushChildScope() {
        this.push(20 /* ChildScope */);
    }
    popScope() {
        this.push(21 /* PopScope */);
    }
    returnTo(label) {
        this.reserve(23 /* ReturnTo */);
        this.labels.target(this.pos, 23 /* ReturnTo */, label);
    }
    pushDynamicScope() {
        this.push(39 /* PushDynamicScope */);
    }
    popDynamicScope() {
        this.push(40 /* PopDynamicScope */);
    }
    pushImmediate(value) {
        this.push(13 /* Constant */, this.other(value));
    }
    primitive(_primitive) {
        let flag = 0;
        let primitive;
        switch (typeof _primitive) {
            case 'number':
                primitive = _primitive;
                break;
            case 'string':
                primitive = this.string(_primitive);
                flag = 1;
                break;
            case 'boolean':
                primitive = _primitive | 0;
                flag = 2;
                break;
            case 'object':
                // assume null
                primitive = 2;
                flag = 2;
                break;
            case 'undefined':
                primitive = 3;
                flag = 2;
                break;
            default:
                throw new Error('Invalid primitive passed to pushPrimitive');
        }
        this.push(14 /* PrimitiveReference */, flag << 30 | primitive);
    }
    helper(func) {
        this.push(1 /* Helper */, this.func(func));
    }
    pushBlock(block) {
        this.push(7 /* PushBlock */, this.block(block));
    }
    bindDynamicScope(_names) {
        this.push(38 /* BindDynamicScope */, this.names(_names));
    }
    enter(args) {
        this.push(49 /* Enter */, args);
    }
    exit() {
        this.push(50 /* Exit */);
    }
    return() {
        this.push(22 /* Return */);
    }
    pushFrame() {
        this.push(47 /* PushFrame */);
    }
    popFrame() {
        this.push(48 /* PopFrame */);
    }
    compileDynamicBlock() {
        this.push(41 /* CompileDynamicBlock */);
    }
    invokeDynamic(invoker) {
        this.push(43 /* InvokeDynamic */, this.other(invoker));
    }
    invokeStatic(block, callerCount = 0) {
        let parameters = block.symbolTable.parameters;

        let calleeCount = parameters.length;
        let count = Math.min(callerCount, calleeCount);
        this.pushFrame();
        if (count) {
            this.pushChildScope();
            for (let i = 0; i < count; i++) {
                this.dup(Register.fp, callerCount - i);
                this.setVariable(parameters[i]);
            }
        }
        let _block = this.constants.block(block);
        this.push(42 /* InvokeStatic */, _block);
        if (count) {
            this.popScope();
        }
        this.popFrame();
    }
    test(testFunc) {
        let _func;
        if (testFunc === 'const') {
            _func = ConstTest;
        } else if (testFunc === 'simple') {
            _func = SimpleTest;
        } else if (testFunc === 'environment') {
            _func = EnvironmentTest;
        } else if (typeof testFunc === 'function') {
            _func = testFunc;
        } else {
            throw new Error('unreachable');
        }
        let func = this.constants.function(_func);
        this.push(51 /* Test */, func);
    }
    jump(target) {
        this.reserve(44 /* Jump */);
        this.labels.target(this.pos, 44 /* Jump */, target);
    }
    jumpIf(target) {
        this.reserve(45 /* JumpIf */);
        this.labels.target(this.pos, 45 /* JumpIf */, target);
    }
    jumpUnless(target) {
        this.reserve(46 /* JumpUnless */);
        this.labels.target(this.pos, 46 /* JumpUnless */, target);
    }
    string(_string) {
        return this.constants.string(_string);
    }
    names(_names) {
        let names = [];
        for (let i = 0; i < _names.length; i++) {
            let n = _names[i];
            names[i] = this.constants.string(n);
        }
        return this.constants.array(names);
    }
    symbols(symbols) {
        return this.constants.array(symbols);
    }
    other(value) {
        return this.constants.other(value);
    }
    block(block) {
        return block ? this.constants.block(block) : 0;
    }
    func(func) {
        return this.constants.function(func);
    }
}
function isCompilableExpression(expr$$1) {
    return typeof expr$$1 === 'object' && expr$$1 !== null && typeof expr$$1.compile === 'function';
}
class OpcodeBuilder extends BasicOpcodeBuilder {
    constructor(env, meta, program = env.program) {
        super(env, meta, program);
        this.component = new ComponentBuilder(this);
    }
    compileArgs(params, hash, synthetic) {
        let positional = 0;
        if (params) {
            for (let i = 0; i < params.length; i++) {
                expr(params[i], this);
            }
            positional = params.length;
        }
        this.pushImmediate(positional);
        let names = EMPTY_ARRAY;
        if (hash) {
            names = hash[0];
            let val = hash[1];
            for (let i = 0; i < val.length; i++) {
                expr(val[i], this);
            }
        }
        this.pushImmediate(names);
        this.pushArgs(synthetic);
    }
    compile(expr$$1) {
        if (isCompilableExpression(expr$$1)) {
            return expr$$1.compile(this);
        } else {
            return expr$$1;
        }
    }
    guardedAppend(expression, trusting) {
        this.startLabels();
        this.pushFrame();
        this.returnTo('END');
        expr(expression, this);
        this.dup();
        this.test(reference => {
            return IsComponentDefinitionReference.create(reference);
        });
        this.enter(2);
        this.jumpUnless('ELSE');
        this.pushDynamicComponentManager();
        this.invokeComponent(null, null, null, null, null);
        this.exit();
        this.return();
        this.label('ELSE');
        this.dynamicContent(trusting);
        this.exit();
        this.return();
        this.label('END');
        this.popFrame();
        this.stopLabels();
    }
    invokeComponent(attrs, params, hash, block, inverse = null) {
        this.fetch(Register.s0);
        this.dup(Register.sp, 1);
        this.load(Register.s0);
        this.pushBlock(block);
        this.pushBlock(inverse);
        this.compileArgs(params, hash, false);
        this.prepareArgs(Register.s0);
        this.beginComponentTransaction();
        this.pushDynamicScope();
        this.createComponent(Register.s0, block !== null, inverse !== null);
        this.registerComponentDestructor(Register.s0);
        this.getComponentSelf(Register.s0);
        this.getComponentLayout(Register.s0);
        this.invokeDynamic(new InvokeDynamicLayout(attrs && attrs.scan()));
        this.popFrame();
        this.popScope();
        this.popDynamicScope();
        this.commitComponentTransaction();
        this.load(Register.s0);
    }
    template(block) {
        if (!block) return null;
        return new RawInlineBlock(this.meta, block.statements, block.parameters);
    }
}

var Ops$2 = Opcodes;
const ATTRS_BLOCK = '&attrs';
class Compilers {
    constructor(offset = 0) {
        this.offset = offset;
        this.names = dict();
        this.funcs = [];
    }
    add(name, func) {
        this.funcs.push(func);
        this.names[name] = this.funcs.length - 1;
    }
    compile(sexp, builder) {
        let name = sexp[this.offset];
        let index = this.names[name];
        let func = this.funcs[index];
        debugAssert(!!func, `expected an implementation for ${this.offset === 0 ? Ops$2[sexp[0]] : Ops$1[sexp[1]]}`);
        func(sexp, builder);
    }
}
const STATEMENTS = new Compilers();
const CLIENT_SIDE = new Compilers(1);
STATEMENTS.add(Ops$2.Text, (sexp, builder) => {
    builder.text(sexp[1]);
});
STATEMENTS.add(Ops$2.Comment, (sexp, builder) => {
    builder.comment(sexp[1]);
});
STATEMENTS.add(Ops$2.CloseElement, (_sexp, builder) => {
    builder.closeElement();
});
STATEMENTS.add(Ops$2.FlushElement, (_sexp, builder) => {
    builder.flushElement();
});
STATEMENTS.add(Ops$2.Modifier, (sexp, builder) => {
    let env = builder.env,
        meta = builder.meta;
    let name = sexp[1],
        params = sexp[2],
        hash = sexp[3];

    if (env.hasModifier(name, meta.templateMeta)) {
        builder.compileArgs(params, hash, true);
        builder.modifier(env.lookupModifier(name, meta.templateMeta));
    } else {
        throw new Error(`Compile Error ${name} is not a modifier: Helpers may not be used in the element form.`);
    }
});
STATEMENTS.add(Ops$2.StaticAttr, (sexp, builder) => {
    let name = sexp[1],
        value = sexp[2],
        namespace = sexp[3];

    builder.staticAttr(name, namespace, value);
});
STATEMENTS.add(Ops$2.DynamicAttr, (sexp, builder) => {
    dynamicAttr(sexp, false, builder);
});
STATEMENTS.add(Ops$2.TrustingAttr, (sexp, builder) => {
    dynamicAttr(sexp, true, builder);
});
function dynamicAttr(sexp, trusting, builder) {
    let name = sexp[1],
        value = sexp[2],
        namespace = sexp[3];

    expr(value, builder);
    if (namespace) {
        builder.dynamicAttr(name, namespace, trusting);
    } else {
        builder.dynamicAttr(name, null, trusting);
    }
}
STATEMENTS.add(Ops$2.OpenElement, (sexp, builder) => {
    builder.openPrimitiveElement(sexp[1]);
});
CLIENT_SIDE.add(Ops$1.OpenComponentElement, (sexp, builder) => {
    builder.putComponentOperations();
    builder.openElementWithOperations(sexp[2]);
});
CLIENT_SIDE.add(Ops$1.DidCreateElement, (_sexp, builder) => {
    builder.didCreateElement(Register.s0);
});
CLIENT_SIDE.add(Ops$1.SetComponentAttrs, (sexp, builder) => {
    builder.setComponentAttrs(sexp[2]);
});
CLIENT_SIDE.add(Ops$1.Debugger, () => {
    // tslint:disable-next-line:no-debugger
    debugger;
});
CLIENT_SIDE.add(Ops$1.DidRenderLayout, (_sexp, builder) => {
    builder.didRenderLayout(Register.s0);
});
STATEMENTS.add(Ops$2.Append, (sexp, builder) => {
    let value = sexp[1],
        trusting = sexp[2];

    var _builder$env$macros = builder.env.macros();

    let inlines = _builder$env$macros.inlines;

    let returned = inlines.compile(sexp, builder) || value;
    if (returned === true) return;
    let isGet = E.isGet(value);
    let isMaybeLocal = E.isMaybeLocal(value);
    if (trusting) {
        builder.guardedAppend(value, true);
    } else {
        if (isGet || isMaybeLocal) {
            builder.guardedAppend(value, false);
        } else {
            expr(value, builder);
            builder.dynamicContent(false);
        }
    }
});
STATEMENTS.add(Ops$2.Block, (sexp, builder) => {
    let name = sexp[1],
        params = sexp[2],
        hash = sexp[3],
        _template = sexp[4],
        _inverse = sexp[5];

    let template = builder.template(_template);
    let inverse = builder.template(_inverse);
    let templateBlock = template && template.scan();
    let inverseBlock = inverse && inverse.scan();

    var _builder$env$macros2 = builder.env.macros();

    let blocks = _builder$env$macros2.blocks;

    blocks.compile(name, params, hash, templateBlock, inverseBlock, builder);
});
class InvokeDynamicLayout {
    constructor(attrs) {
        this.attrs = attrs;
    }
    invoke(vm, layout) {
        var _layout$symbolTable = layout.symbolTable;
        let symbols = _layout$symbolTable.symbols,
            hasEval = _layout$symbolTable.hasEval;

        let stack = vm.stack;
        let scope = vm.pushRootScope(symbols.length + 1, true);
        scope.bindSelf(stack.pop());
        scope.bindBlock(symbols.indexOf(ATTRS_BLOCK) + 1, this.attrs);
        let lookup = null;
        let $eval = -1;
        if (hasEval) {
            $eval = symbols.indexOf('$eval') + 1;
            lookup = dict();
        }
        let callerNames = stack.pop();
        for (let i = callerNames.length - 1; i >= 0; i--) {
            let symbol = symbols.indexOf(callerNames[i]);
            let value = stack.pop();
            if (symbol !== -1) scope.bindSymbol(symbol + 1, value);
            if (hasEval) lookup[callerNames[i]] = value;
        }
        let numPositionalArgs = stack.pop();
        debugAssert(typeof numPositionalArgs === 'number', '[BUG] Incorrect value of positional argument count found during invoke-dynamic-layout.');
        // Currently we don't support accessing positional args in templates, so just throw them away
        stack.pop(numPositionalArgs);
        let inverseSymbol = symbols.indexOf('&inverse');
        let inverse = stack.pop();
        if (inverseSymbol !== -1) {
            scope.bindBlock(inverseSymbol + 1, inverse);
        }
        if (lookup) lookup['&inverse'] = inverse;
        let defaultSymbol = symbols.indexOf('&default');
        let defaultBlock = stack.pop();
        if (defaultSymbol !== -1) {
            scope.bindBlock(defaultSymbol + 1, defaultBlock);
        }
        if (lookup) lookup['&default'] = defaultBlock;
        if (lookup) scope.bindEvalScope(lookup);
        vm.pushFrame();
        vm.call(layout.handle);
    }
    toJSON() {
        return { GlimmerDebug: '<invoke-dynamic-layout>' };
    }
}
STATEMENTS.add(Ops$2.Component, (sexp, builder) => {
    let tag = sexp[1],
        _attrs = sexp[2],
        args = sexp[3],
        block = sexp[4];

    if (builder.env.hasComponentDefinition(tag, builder.meta.templateMeta)) {
        let child = builder.template(block);
        let attrs = [[Ops$2.ClientSideStatement, Ops$1.SetComponentAttrs, true], ..._attrs, [Ops$2.ClientSideStatement, Ops$1.SetComponentAttrs, false]];
        let attrsBlock = new RawInlineBlock(builder.meta, attrs, EMPTY_ARRAY);
        let definition = builder.env.getComponentDefinition(tag, builder.meta.templateMeta);
        builder.pushComponentManager(definition);
        builder.invokeComponent(attrsBlock, null, args, child && child.scan());
    } else if (block && block.parameters.length) {
        throw new Error(`Compile Error: Cannot find component ${tag}`);
    } else {
        builder.openPrimitiveElement(tag);
        for (let i = 0; i < _attrs.length; i++) {
            STATEMENTS.compile(_attrs[i], builder);
        }
        builder.flushElement();
        if (block) {
            let stmts = block.statements;
            for (let i = 0; i < stmts.length; i++) {
                STATEMENTS.compile(stmts[i], builder);
            }
        }
        builder.closeElement();
    }
});
class PartialInvoker {
    constructor(outerSymbols, evalInfo) {
        this.outerSymbols = outerSymbols;
        this.evalInfo = evalInfo;
    }
    invoke(vm, _partial) {
        let partial = unwrap(_partial);
        let partialSymbols = partial.symbolTable.symbols;
        let outerScope = vm.scope();
        let partialScope = vm.pushRootScope(partialSymbols.length, false);
        partialScope.bindCallerScope(outerScope.getCallerScope());
        partialScope.bindEvalScope(outerScope.getEvalScope());
        partialScope.bindSelf(outerScope.getSelf());
        let evalInfo = this.evalInfo,
            outerSymbols = this.outerSymbols;

        let locals = dict();
        for (let i = 0; i < evalInfo.length; i++) {
            let slot = evalInfo[i];
            let name = outerSymbols[slot - 1];
            let ref = outerScope.getSymbol(slot);
            locals[name] = ref;
        }
        let evalScope = outerScope.getEvalScope();
        for (let i = 0; i < partialSymbols.length; i++) {
            let name = partialSymbols[i];
            let symbol = i + 1;
            let value = evalScope[name];
            if (value !== undefined) partialScope.bind(symbol, value);
        }
        partialScope.bindPartialMap(locals);
        vm.pushFrame();
        vm.call(partial.handle);
    }
}
STATEMENTS.add(Ops$2.Partial, (sexp, builder) => {
    let name = sexp[1],
        evalInfo = sexp[2];
    var _builder$meta = builder.meta;
    let templateMeta = _builder$meta.templateMeta,
        symbols = _builder$meta.symbols;

    function helper(vm, args) {
        let env = vm.env;

        let nameRef = args.positional.at(0);
        return map(nameRef, n => {
            if (typeof n === 'string' && n) {
                if (!env.hasPartial(n, templateMeta)) {
                    throw new Error(`Could not find a partial named "${n}"`);
                }
                return env.lookupPartial(n, templateMeta);
            } else if (n) {
                throw new Error(`Could not find a partial named "${String(n)}"`);
            } else {
                return null;
            }
        });
    }
    builder.startLabels();
    builder.pushFrame();
    builder.returnTo('END');
    expr(name, builder);
    builder.pushImmediate(1);
    builder.pushImmediate(EMPTY_ARRAY);
    builder.pushArgs(true);
    builder.helper(helper);
    builder.dup();
    builder.test('simple');
    builder.enter(2);
    builder.jumpUnless('ELSE');
    builder.getPartialTemplate();
    builder.compileDynamicBlock();
    builder.invokeDynamic(new PartialInvoker(symbols, evalInfo));
    builder.popScope();
    builder.popFrame();
    builder.label('ELSE');
    builder.exit();
    builder.return();
    builder.label('END');
    builder.popFrame();
    builder.stopLabels();
});
class InvokeDynamicYield {
    constructor(callerCount) {
        this.callerCount = callerCount;
    }
    invoke(vm, block) {
        let callerCount = this.callerCount;

        let stack = vm.stack;
        if (!block) {
            // To balance the pop{Frame,Scope}
            vm.pushFrame();
            vm.pushCallerScope();
            return;
        }
        let table = block.symbolTable;
        let locals = table.parameters; // always present in inline blocks
        let calleeCount = locals ? locals.length : 0;
        let count = Math.min(callerCount, calleeCount);
        vm.pushFrame();
        vm.pushCallerScope(calleeCount > 0);
        let scope = vm.scope();
        for (let i = 0; i < count; i++) {
            scope.bindSymbol(locals[i], stack.fromBase(callerCount - i));
        }
        vm.call(block.handle);
    }
    toJSON() {
        return { GlimmerDebug: `<invoke-dynamic-yield caller-count=${this.callerCount}>` };
    }
}
STATEMENTS.add(Ops$2.Yield, (sexp, builder) => {
    let to = sexp[1],
        params = sexp[2];

    let count = compileList(params, builder);
    builder.getBlock(to);
    builder.compileDynamicBlock();
    builder.invokeDynamic(new InvokeDynamicYield(count));
    builder.popScope();
    builder.popFrame();
    if (count) {
        builder.pop(count);
    }
});
STATEMENTS.add(Ops$2.Debugger, (sexp, builder) => {
    let evalInfo = sexp[1];

    builder.debugger(builder.meta.symbols, evalInfo);
});
STATEMENTS.add(Ops$2.ClientSideStatement, (sexp, builder) => {
    CLIENT_SIDE.compile(sexp, builder);
});
const EXPRESSIONS = new Compilers();
const CLIENT_SIDE_EXPRS = new Compilers(1);
var E = Expressions;
function expr(expression, builder) {
    if (Array.isArray(expression)) {
        EXPRESSIONS.compile(expression, builder);
    } else {
        builder.primitive(expression);
    }
}
EXPRESSIONS.add(Ops$2.Unknown, (sexp, builder) => {
    let name = sexp[1];
    if (builder.env.hasHelper(name, builder.meta.templateMeta)) {
        EXPRESSIONS.compile([Ops$2.Helper, name, EMPTY_ARRAY, null], builder);
    } else if (builder.meta.asPartial) {
        builder.resolveMaybeLocal(name);
    } else {
        builder.getVariable(0);
        builder.getProperty(name);
    }
});
EXPRESSIONS.add(Ops$2.Concat, (sexp, builder) => {
    let parts = sexp[1];
    for (let i = 0; i < parts.length; i++) {
        expr(parts[i], builder);
    }
    builder.concat(parts.length);
});
CLIENT_SIDE_EXPRS.add(Ops$1.FunctionExpression, (sexp, builder) => {
    builder.function(sexp[2]);
});
EXPRESSIONS.add(Ops$2.Helper, (sexp, builder) => {
    let env = builder.env,
        meta = builder.meta;
    let name = sexp[1],
        params = sexp[2],
        hash = sexp[3];

    if (env.hasHelper(name, meta.templateMeta)) {
        builder.compileArgs(params, hash, true);
        builder.helper(env.lookupHelper(name, meta.templateMeta));
    } else {
        throw new Error(`Compile Error: ${name} is not a helper`);
    }
});
EXPRESSIONS.add(Ops$2.Get, (sexp, builder) => {
    let head = sexp[1],
        path = sexp[2];

    builder.getVariable(head);
    for (let i = 0; i < path.length; i++) {
        builder.getProperty(path[i]);
    }
});
EXPRESSIONS.add(Ops$2.MaybeLocal, (sexp, builder) => {
    let path = sexp[1];

    if (builder.meta.asPartial) {
        let head = path[0];
        path = path.slice(1);
        builder.resolveMaybeLocal(head);
    } else {
        builder.getVariable(0);
    }
    for (let i = 0; i < path.length; i++) {
        builder.getProperty(path[i]);
    }
});
EXPRESSIONS.add(Ops$2.Undefined, (_sexp, builder) => {
    return builder.primitive(undefined);
});
EXPRESSIONS.add(Ops$2.HasBlock, (sexp, builder) => {
    builder.hasBlock(sexp[1]);
});
EXPRESSIONS.add(Ops$2.HasBlockParams, (sexp, builder) => {
    builder.hasBlockParams(sexp[1]);
});
EXPRESSIONS.add(Ops$2.ClientSideExpression, (sexp, builder) => {
    CLIENT_SIDE_EXPRS.compile(sexp, builder);
});
function compileList(params, builder) {
    if (!params) return 0;
    for (let i = 0; i < params.length; i++) {
        expr(params[i], builder);
    }
    return params.length;
}
class Blocks {
    constructor() {
        this.names = dict();
        this.funcs = [];
    }
    add(name, func) {
        this.funcs.push(func);
        this.names[name] = this.funcs.length - 1;
    }
    addMissing(func) {
        this.missing = func;
    }
    compile(name, params, hash, template, inverse, builder) {
        let index = this.names[name];
        if (index === undefined) {
            debugAssert(!!this.missing, `${name} not found, and no catch-all block handler was registered`);
            let func = this.missing;
            let handled = func(name, params, hash, template, inverse, builder);
            debugAssert(!!handled, `${name} not found, and the catch-all block handler didn't handle it`);
        } else {
            let func = this.funcs[index];
            func(params, hash, template, inverse, builder);
        }
    }
}
const BLOCKS = new Blocks();
class Inlines {
    constructor() {
        this.names = dict();
        this.funcs = [];
    }
    add(name, func) {
        this.funcs.push(func);
        this.names[name] = this.funcs.length - 1;
    }
    addMissing(func) {
        this.missing = func;
    }
    compile(sexp, builder) {
        let value = sexp[1];
        // TODO: Fix this so that expression macros can return
        // things like components, so that {{component foo}}
        // is the same as {{(component foo)}}
        if (!Array.isArray(value)) return ['expr', value];
        let name;
        let params;
        let hash;
        if (value[0] === Ops$2.Helper) {
            name = value[1];
            params = value[2];
            hash = value[3];
        } else if (value[0] === Ops$2.Unknown) {
            name = value[1];
            params = hash = null;
        } else {
            return ['expr', value];
        }
        let index = this.names[name];
        if (index === undefined && this.missing) {
            let func = this.missing;
            let returned = func(name, params, hash, builder);
            return returned === false ? ['expr', value] : returned;
        } else if (index !== undefined) {
            let func = this.funcs[index];
            let returned = func(name, params, hash, builder);
            return returned === false ? ['expr', value] : returned;
        } else {
            return ['expr', value];
        }
    }
}
const INLINES = new Inlines();
populateBuiltins(BLOCKS, INLINES);
function populateBuiltins(blocks = new Blocks(), inlines = new Inlines()) {
    blocks.add('if', (params, _hash, template, inverse, builder) => {
        //        PutArgs
        //        Test(Environment)
        //        Enter(BEGIN, END)
        // BEGIN: Noop
        //        JumpUnless(ELSE)
        //        Evaluate(default)
        //        Jump(END)
        // ELSE:  Noop
        //        Evalulate(inverse)
        // END:   Noop
        //        Exit
        if (!params || params.length !== 1) {
            throw new Error(`SYNTAX ERROR: #if requires a single argument`);
        }
        builder.startLabels();
        builder.pushFrame();
        builder.returnTo('END');
        expr(params[0], builder);
        builder.test('environment');
        builder.enter(1);
        builder.jumpUnless('ELSE');
        builder.invokeStatic(unwrap(template));
        if (inverse) {
            builder.jump('EXIT');
            builder.label('ELSE');
            builder.invokeStatic(inverse);
            builder.label('EXIT');
            builder.exit();
            builder.return();
        } else {
            builder.label('ELSE');
            builder.exit();
            builder.return();
        }
        builder.label('END');
        builder.popFrame();
        builder.stopLabels();
    });
    blocks.add('unless', (params, _hash, template, inverse, builder) => {
        //        PutArgs
        //        Test(Environment)
        //        Enter(BEGIN, END)
        // BEGIN: Noop
        //        JumpUnless(ELSE)
        //        Evaluate(default)
        //        Jump(END)
        // ELSE:  Noop
        //        Evalulate(inverse)
        // END:   Noop
        //        Exit
        if (!params || params.length !== 1) {
            throw new Error(`SYNTAX ERROR: #unless requires a single argument`);
        }
        builder.startLabels();
        builder.pushFrame();
        builder.returnTo('END');
        expr(params[0], builder);
        builder.test('environment');
        builder.enter(1);
        builder.jumpIf('ELSE');
        builder.invokeStatic(unwrap(template));
        if (inverse) {
            builder.jump('EXIT');
            builder.label('ELSE');
            builder.invokeStatic(inverse);
            builder.label('EXIT');
            builder.exit();
            builder.return();
        } else {
            builder.label('ELSE');
            builder.exit();
            builder.return();
        }
        builder.label('END');
        builder.popFrame();
        builder.stopLabels();
    });
    blocks.add('with', (params, _hash, template, inverse, builder) => {
        //        PutArgs
        //        Test(Environment)
        //        Enter(BEGIN, END)
        // BEGIN: Noop
        //        JumpUnless(ELSE)
        //        Evaluate(default)
        //        Jump(END)
        // ELSE:  Noop
        //        Evalulate(inverse)
        // END:   Noop
        //        Exit
        if (!params || params.length !== 1) {
            throw new Error(`SYNTAX ERROR: #with requires a single argument`);
        }
        builder.startLabels();
        builder.pushFrame();
        builder.returnTo('END');
        expr(params[0], builder);
        builder.dup();
        builder.test('environment');
        builder.enter(2);
        builder.jumpUnless('ELSE');
        builder.invokeStatic(unwrap(template), 1);
        if (inverse) {
            builder.jump('EXIT');
            builder.label('ELSE');
            builder.invokeStatic(inverse);
            builder.label('EXIT');
            builder.exit();
            builder.return();
        } else {
            builder.label('ELSE');
            builder.exit();
            builder.return();
        }
        builder.label('END');
        builder.popFrame();
        builder.stopLabels();
    });
    blocks.add('each', (params, hash, template, inverse, builder) => {
        //         Enter(BEGIN, END)
        // BEGIN:  Noop
        //         PutArgs
        //         PutIterable
        //         JumpUnless(ELSE)
        //         EnterList(BEGIN2, END2)
        // ITER:   Noop
        //         NextIter(BREAK)
        // BEGIN2: Noop
        //         PushChildScope
        //         Evaluate(default)
        //         PopScope
        // END2:   Noop
        //         Exit
        //         Jump(ITER)
        // BREAK:  Noop
        //         ExitList
        //         Jump(END)
        // ELSE:   Noop
        //         Evalulate(inverse)
        // END:    Noop
        //         Exit
        builder.startLabels();
        builder.pushFrame();
        builder.returnTo('END');
        if (hash && hash[0][0] === 'key') {
            expr(hash[1][0], builder);
        } else {
            builder.primitive(null);
        }
        expr(params[0], builder);
        builder.enter(2);
        builder.putIterator();
        builder.jumpUnless('ELSE');
        builder.pushFrame();
        builder.returnTo('ITER');
        builder.dup(Register.fp, 1);
        builder.enterList('BODY');
        builder.label('ITER');
        builder.iterate('BREAK');
        builder.label('BODY');
        builder.invokeStatic(unwrap(template), 2);
        builder.pop(2);
        builder.exit();
        builder.return();
        builder.label('BREAK');
        builder.exitList();
        builder.popFrame();
        if (inverse) {
            builder.jump('EXIT');
            builder.label('ELSE');
            builder.invokeStatic(inverse);
            builder.label('EXIT');
            builder.exit();
            builder.return();
        } else {
            builder.label('ELSE');
            builder.exit();
            builder.return();
        }
        builder.label('END');
        builder.popFrame();
        builder.stopLabels();
    });
    blocks.add('-in-element', (params, hash, template, _inverse, builder) => {
        if (!params || params.length !== 1) {
            throw new Error(`SYNTAX ERROR: #-in-element requires a single argument`);
        }
        builder.startLabels();
        builder.pushFrame();
        builder.returnTo('END');
        if (hash && hash[0].length) {
            let keys = hash[0],
                values = hash[1];

            if (keys.length === 1 && keys[0] === 'nextSibling') {
                expr(values[0], builder);
            } else {
                throw new Error(`SYNTAX ERROR: #-in-element does not take a \`${keys[0]}\` option`);
            }
        } else {
            expr(null, builder);
        }
        expr(params[0], builder);
        builder.dup();
        builder.test('simple');
        builder.enter(3);
        builder.jumpUnless('ELSE');
        builder.pushRemoteElement();
        builder.invokeStatic(unwrap(template));
        builder.popRemoteElement();
        builder.label('ELSE');
        builder.exit();
        builder.return();
        builder.label('END');
        builder.popFrame();
        builder.stopLabels();
    });
    blocks.add('-with-dynamic-vars', (_params, hash, template, _inverse, builder) => {
        if (hash) {
            let names = hash[0],
                expressions = hash[1];

            compileList(expressions, builder);
            builder.pushDynamicScope();
            builder.bindDynamicScope(names);
            builder.invokeStatic(unwrap(template));
            builder.popDynamicScope();
        } else {
            builder.invokeStatic(unwrap(template));
        }
    });
    return { blocks, inlines };
}
function compileStatement(statement, builder) {
    STATEMENTS.compile(statement, builder);
}
function compileStatements(statements, meta, env) {
    let b = new OpcodeBuilder(env, meta);
    for (let i = 0; i < statements.length; i++) {
        compileStatement(statements[i], b);
    }
    return b;
}

class CompilableTemplate {
    constructor(statements, symbolTable) {
        this.statements = statements;
        this.symbolTable = symbolTable;
        this.compiledStatic = null;
        this.compiledDynamic = null;
    }
    compileStatic(env) {
        let compiledStatic = this.compiledStatic;

        if (!compiledStatic) {
            let builder = compileStatements(this.statements, this.symbolTable.meta, env);
            builder.finalize();
            let handle = builder.start;
            compiledStatic = this.compiledStatic = new CompiledStaticTemplate(handle);
        }
        return compiledStatic;
    }
    compileDynamic(env) {
        let compiledDynamic = this.compiledDynamic;

        if (!compiledDynamic) {
            let staticBlock = this.compileStatic(env);
            compiledDynamic = new CompiledDynamicTemplate(staticBlock.handle, this.symbolTable);
        }
        return compiledDynamic;
    }
}

var Ops$$1 = Opcodes;
class Scanner {
    constructor(block, env) {
        this.block = block;
        this.env = env;
    }
    scanEntryPoint(meta) {
        let block = this.block;
        let statements = block.statements,
            symbols = block.symbols,
            hasEval = block.hasEval;

        return new CompilableTemplate(statements, { meta, symbols, hasEval });
    }
    scanBlock(meta) {
        let block = this.block;
        let statements = block.statements;

        return new CompilableTemplate(statements, { meta, parameters: EMPTY_ARRAY });
    }
    scanLayout(meta, attrs, componentName) {
        let block = this.block;
        let symbols = block.symbols,
            hasEval = block.hasEval;

        let scanner = new LayoutScanner(block, this.env, meta, attrs, componentName);
        return new CompilableTemplate(scanner.scan(), { meta, hasEval, symbols });
    }
}
class LayoutScanner {
    constructor(block, env, meta, attrs, componentName) {
        this.env = env;
        this.attrs = attrs;
        this.componentName = componentName;
        this.state = 0 /* BeforeTopLevel */;
        let statements = block.statements,
            symbols = block.symbols;

        this.statements = statements;
        this.symbols = symbols;
        this.meta = meta.templateMeta;
    }
    scan() {
        let statements = this.statements;

        this.state = 0 /* BeforeTopLevel */;
        let buffer = [];
        for (let i = 0; i < statements.length; i++) {
            this.processStatement(this.statements[i], buffer);
        }
        buffer.push([Ops$$1.ClientSideStatement, Ops$1.DidRenderLayout]);
        return buffer;
    }
    processStatement(statement, buffer) {
        switch (this.state) {
            case 0 /* BeforeTopLevel */:
                this.processBeforeTopLevel(statement, buffer);
                break;
            case 1 /* InTopLevel */:
                this.processInTopLevel(statement, buffer);
                break;
            case 2 /* AfterFlush */:
                buffer.push(statement);
                break;
            default:
                throw unreachable();
        }
    }
    processBeforeTopLevel(statement, buffer) {
        if (Statements.isComponent(statement)) {
            this.processTopLevelComponent(statement, buffer);
        } else if (Statements.isOpenElement(statement)) {
            this.processIsOpenElement(statement, buffer);
        } else {
            // Should be whitespace
            buffer.push(statement);
        }
    }
    processTopLevelComponent(statement, buffer) {
        let tagName = statement[1],
            attrs = statement[2],
            block = statement[4];

        if (this.env.hasComponentDefinition(tagName, this.meta) && tagName !== this.componentName) {
            buffer.push(statement);
            this.state = 2 /* AfterFlush */;
            return;
        }
        debugAssert(!this.env.hasComponentDefinition(tagName, this.meta) || tagName === this.componentName, `Cannot use a component (<${tagName}>) as the top-level element in the layout of <${this.componentName}>`);
        this.state = 1 /* InTopLevel */;
        buffer.push([Ops$$1.ClientSideStatement, Ops$1.SetComponentAttrs, true]);
        buffer.push([Ops$$1.ClientSideStatement, Ops$1.OpenComponentElement, tagName]);
        buffer.push([Ops$$1.ClientSideStatement, Ops$1.DidCreateElement]);
        for (let i = 0; i < attrs.length; i++) {
            this.processStatement(attrs[i], buffer);
        }
        this.processStatement([Ops$$1.FlushElement], buffer);
        if (block) {
            let statements = block.statements;

            for (let i = 0; i < statements.length; i++) {
                this.processStatement(statements[i], buffer);
            }
        }
        this.processStatement([Ops$$1.CloseElement], buffer);
    }
    processIsOpenElement(statement, buffer) {
        let tagName = statement[1];

        this.state = 1 /* InTopLevel */;
        buffer.push([Ops$$1.ClientSideStatement, Ops$1.SetComponentAttrs, true]);
        buffer.push([Ops$$1.ClientSideStatement, Ops$1.OpenComponentElement, tagName]);
        buffer.push([Ops$$1.ClientSideStatement, Ops$1.DidCreateElement]);
    }
    processInTopLevel(statement, buffer) {
        debugAssert(!Statements.isModifier(statement), `Cannot use element modifiers ({{${statement[1]} ...}}) in the top-level element in the layout of <${this.componentName}>`);
        if (Statements.isFlushElement(statement)) {
            let symbols = this.symbols,
                attrs = this.attrs;

            this.state = 2 /* AfterFlush */;
            let attrsSymbol = symbols.push(ATTRS_BLOCK);
            buffer.push(...attrs);
            buffer.push([Ops$$1.Yield, attrsSymbol, EMPTY_ARRAY]);
            buffer.push([Ops$$1.ClientSideStatement, Ops$1.SetComponentAttrs, false]);
        }
        buffer.push(statement);
    }
}

class Constants {
    constructor() {
        // `0` means NULL
        this.references = [];
        this.strings = [];
        this.expressions = [];
        this.arrays = [];
        this.blocks = [];
        this.functions = [];
        this.others = [];
    }
    getReference(value) {
        return this.references[value - 1];
    }
    reference(value) {
        let index = this.references.length;
        this.references.push(value);
        return index + 1;
    }
    getString(value) {
        return this.strings[value - 1];
    }
    string(value) {
        let index = this.strings.length;
        this.strings.push(value);
        return index + 1;
    }
    getExpression(value) {
        return this.expressions[value - 1];
    }
    getArray(value) {
        return this.arrays[value - 1];
    }
    getNames(value) {
        let _names = [];
        let names = this.getArray(value);
        for (let i = 0; i < names.length; i++) {
            let n = names[i];
            _names[i] = this.getString(n);
        }
        return _names;
    }
    array(values) {
        let index = this.arrays.length;
        this.arrays.push(values);
        return index + 1;
    }
    getBlock(value) {
        return this.blocks[value - 1];
    }
    block(block) {
        let index = this.blocks.length;
        this.blocks.push(block);
        return index + 1;
    }
    getFunction(value) {
        return this.functions[value - 1];
    }
    function(f) {
        let index = this.functions.length;
        this.functions.push(f);
        return index + 1;
    }
    getOther(value) {
        return this.others[value - 1];
    }
    other(other) {
        let index = this.others.length;
        this.others.push(other);
        return index + 1;
    }
}

const badProtocols = ['javascript:', 'vbscript:'];
const badTags = ['A', 'BODY', 'LINK', 'IMG', 'IFRAME', 'BASE', 'FORM'];
const badTagsForDataURI = ['EMBED'];
const badAttributes = ['href', 'src', 'background', 'action'];
const badAttributesForDataURI = ['src'];
function has(array, item) {
    return array.indexOf(item) !== -1;
}
function checkURI(tagName, attribute) {
    return (tagName === null || has(badTags, tagName)) && has(badAttributes, attribute);
}
function checkDataURI(tagName, attribute) {
    if (tagName === null) return false;
    return has(badTagsForDataURI, tagName) && has(badAttributesForDataURI, attribute);
}
function requiresSanitization(tagName, attribute) {
    return checkURI(tagName, attribute) || checkDataURI(tagName, attribute);
}
function sanitizeAttributeValue(env, element, attribute, value) {
    let tagName = null;
    if (value === null || value === undefined) {
        return value;
    }
    if (isSafeString(value)) {
        return value.toHTML();
    }
    if (!element) {
        tagName = null;
    } else {
        tagName = element.tagName.toUpperCase();
    }
    let str = normalizeStringValue(value);
    if (checkURI(tagName, attribute)) {
        let protocol = env.protocolForURL(str);
        if (has(badProtocols, protocol)) {
            return `unsafe:${str}`;
        }
    }
    if (checkDataURI(tagName, attribute)) {
        return `unsafe:${str}`;
    }
    return str;
}

/*
 * @method normalizeProperty
 * @param element {HTMLElement}
 * @param slotName {String}
 * @returns {Object} { name, type }
 */
function normalizeProperty(element, slotName) {
    let type, normalized;
    if (slotName in element) {
        normalized = slotName;
        type = 'prop';
    } else {
        let lower = slotName.toLowerCase();
        if (lower in element) {
            type = 'prop';
            normalized = lower;
        } else {
            type = 'attr';
            normalized = slotName;
        }
    }
    if (type === 'prop' && (normalized.toLowerCase() === 'style' || preferAttr(element.tagName, normalized))) {
        type = 'attr';
    }
    return { normalized, type };
}

// properties that MUST be set as attributes, due to:
// * browser bug
// * strange spec outlier
const ATTR_OVERRIDES = {
    // phantomjs < 2.0 lets you set it as a prop but won't reflect it
    // back to the attribute. button.getAttribute('type') === null
    BUTTON: { type: true, form: true },
    INPUT: {
        // Some version of IE (like IE9) actually throw an exception
        // if you set input.type = 'something-unknown'
        type: true,
        form: true,
        // Chrome 46.0.2464.0: 'autocorrect' in document.createElement('input') === false
        // Safari 8.0.7: 'autocorrect' in document.createElement('input') === false
        // Mobile Safari (iOS 8.4 simulator): 'autocorrect' in document.createElement('input') === true
        autocorrect: true,
        // Chrome 54.0.2840.98: 'list' in document.createElement('input') === true
        // Safari 9.1.3: 'list' in document.createElement('input') === false
        list: true
    },
    // element.form is actually a legitimate readOnly property, that is to be
    // mutated, but must be mutated by setAttribute...
    SELECT: { form: true },
    OPTION: { form: true },
    TEXTAREA: { form: true },
    LABEL: { form: true },
    FIELDSET: { form: true },
    LEGEND: { form: true },
    OBJECT: { form: true }
};
function preferAttr(tagName, propName) {
    let tag = ATTR_OVERRIDES[tagName.toUpperCase()];
    return tag && tag[propName.toLowerCase()] || false;
}

let innerHTMLWrapper = {
    colgroup: { depth: 2, before: '<table><colgroup>', after: '</colgroup></table>' },
    table: { depth: 1, before: '<table>', after: '</table>' },
    tbody: { depth: 2, before: '<table><tbody>', after: '</tbody></table>' },
    tfoot: { depth: 2, before: '<table><tfoot>', after: '</tfoot></table>' },
    thead: { depth: 2, before: '<table><thead>', after: '</thead></table>' },
    tr: { depth: 3, before: '<table><tbody><tr>', after: '</tr></tbody></table>' }
};
// Patch:    innerHTML Fix
// Browsers: IE9
// Reason:   IE9 don't allow us to set innerHTML on col, colgroup, frameset,
//           html, style, table, tbody, tfoot, thead, title, tr.
// Fix:      Wrap the innerHTML we are about to set in its parents, apply the
//           wrapped innerHTML on a div, then move the unwrapped nodes into the
//           target position.
function domChanges(document, DOMChangesClass) {
    if (!document) return DOMChangesClass;
    if (!shouldApplyFix(document)) {
        return DOMChangesClass;
    }
    let div = document.createElement('div');
    return class DOMChangesWithInnerHTMLFix extends DOMChangesClass {
        insertHTMLBefore(parent, nextSibling, html) {
            if (html === null || html === '') {
                return super.insertHTMLBefore(parent, nextSibling, html);
            }
            let parentTag = parent.tagName.toLowerCase();
            let wrapper = innerHTMLWrapper[parentTag];
            if (wrapper === undefined) {
                return super.insertHTMLBefore(parent, nextSibling, html);
            }
            return fixInnerHTML(parent, wrapper, div, html, nextSibling);
        }
    };
}
function treeConstruction(document, DOMTreeConstructionClass) {
    if (!document) return DOMTreeConstructionClass;
    if (!shouldApplyFix(document)) {
        return DOMTreeConstructionClass;
    }
    let div = document.createElement('div');
    return class DOMTreeConstructionWithInnerHTMLFix extends DOMTreeConstructionClass {
        insertHTMLBefore(parent, referenceNode, html) {
            if (html === null || html === '') {
                return super.insertHTMLBefore(parent, referenceNode, html);
            }
            let parentTag = parent.tagName.toLowerCase();
            let wrapper = innerHTMLWrapper[parentTag];
            if (wrapper === undefined) {
                return super.insertHTMLBefore(parent, referenceNode, html);
            }
            return fixInnerHTML(parent, wrapper, div, html, referenceNode);
        }
    };
}
function fixInnerHTML(parent, wrapper, div, html, reference) {
    let wrappedHtml = wrapper.before + html + wrapper.after;
    div.innerHTML = wrappedHtml;
    let parentNode = div;
    for (let i = 0; i < wrapper.depth; i++) {
        parentNode = parentNode.childNodes[0];
    }

    var _moveNodesBefore = moveNodesBefore(parentNode, parent, reference);

    let first = _moveNodesBefore[0],
        last = _moveNodesBefore[1];

    return new ConcreteBounds(parent, first, last);
}
function shouldApplyFix(document) {
    let table = document.createElement('table');
    try {
        table.innerHTML = '<tbody></tbody>';
    } catch (e) {} finally {
        if (table.childNodes.length !== 0) {
            // It worked as expected, no fix required
            return false;
        }
    }
    return true;
}

const SVG_NAMESPACE$1 = 'http://www.w3.org/2000/svg';
// Patch:    insertAdjacentHTML on SVG Fix
// Browsers: Safari, IE, Edge, Firefox ~33-34
// Reason:   insertAdjacentHTML does not exist on SVG elements in Safari. It is
//           present but throws an exception on IE and Edge. Old versions of
//           Firefox create nodes in the incorrect namespace.
// Fix:      Since IE and Edge silently fail to create SVG nodes using
//           innerHTML, and because Firefox may create nodes in the incorrect
//           namespace using innerHTML on SVG elements, an HTML-string wrapping
//           approach is used. A pre/post SVG tag is added to the string, then
//           that whole string is added to a div. The created nodes are plucked
//           out and applied to the target location on DOM.
function domChanges$1(document, DOMChangesClass, svgNamespace) {
    if (!document) return DOMChangesClass;
    if (!shouldApplyFix$1(document, svgNamespace)) {
        return DOMChangesClass;
    }
    let div = document.createElement('div');
    return class DOMChangesWithSVGInnerHTMLFix extends DOMChangesClass {
        insertHTMLBefore(parent, nextSibling, html) {
            if (html === null || html === '') {
                return super.insertHTMLBefore(parent, nextSibling, html);
            }
            if (parent.namespaceURI !== svgNamespace) {
                return super.insertHTMLBefore(parent, nextSibling, html);
            }
            return fixSVG(parent, div, html, nextSibling);
        }
    };
}
function treeConstruction$1(document, TreeConstructionClass, svgNamespace) {
    if (!document) return TreeConstructionClass;
    if (!shouldApplyFix$1(document, svgNamespace)) {
        return TreeConstructionClass;
    }
    let div = document.createElement('div');
    return class TreeConstructionWithSVGInnerHTMLFix extends TreeConstructionClass {
        insertHTMLBefore(parent, reference, html) {
            if (html === null || html === '') {
                return super.insertHTMLBefore(parent, reference, html);
            }
            if (parent.namespaceURI !== svgNamespace) {
                return super.insertHTMLBefore(parent, reference, html);
            }
            return fixSVG(parent, div, html, reference);
        }
    };
}
function fixSVG(parent, div, html, reference) {
    // IE, Edge: also do not correctly support using `innerHTML` on SVG
    // namespaced elements. So here a wrapper is used.
    let wrappedHtml = '<svg>' + html + '</svg>';
    div.innerHTML = wrappedHtml;

    var _moveNodesBefore = moveNodesBefore(div.firstChild, parent, reference);

    let first = _moveNodesBefore[0],
        last = _moveNodesBefore[1];

    return new ConcreteBounds(parent, first, last);
}
function shouldApplyFix$1(document, svgNamespace) {
    let svg = document.createElementNS(svgNamespace, 'svg');
    try {
        svg['insertAdjacentHTML']('beforeend', '<circle></circle>');
    } catch (e) {
        // IE, Edge: Will throw, insertAdjacentHTML is unsupported on SVG
        // Safari: Will throw, insertAdjacentHTML is not present on SVG
    } finally {
        // FF: Old versions will create a node in the wrong namespace
        if (svg.childNodes.length === 1 && unwrap(svg.firstChild).namespaceURI === SVG_NAMESPACE$1) {
            // The test worked as expected, no fix required
            return false;
        }
        return true;
    }
}

// Patch:    Adjacent text node merging fix
// Browsers: IE, Edge, Firefox w/o inspector open
// Reason:   These browsers will merge adjacent text nodes. For exmaple given
//           <div>Hello</div> with div.insertAdjacentHTML(' world') browsers
//           with proper behavior will populate div.childNodes with two items.
//           These browsers will populate it with one merged node instead.
// Fix:      Add these nodes to a wrapper element, then iterate the childNodes
//           of that wrapper and move the nodes to their target location. Note
//           that potential SVG bugs will have been handled before this fix.
//           Note that this fix must only apply to the previous text node, as
//           the base implementation of `insertHTMLBefore` already handles
//           following text nodes correctly.
function domChanges$2(document, DOMChangesClass) {
    if (!document) return DOMChangesClass;
    if (!shouldApplyFix$2(document)) {
        return DOMChangesClass;
    }
    return class DOMChangesWithTextNodeMergingFix extends DOMChangesClass {
        constructor(document) {
            super(document);
            this.uselessComment = document.createComment('');
        }
        insertHTMLBefore(parent, nextSibling, html) {
            if (html === null) {
                return super.insertHTMLBefore(parent, nextSibling, html);
            }
            let didSetUselessComment = false;
            let nextPrevious = nextSibling ? nextSibling.previousSibling : parent.lastChild;
            if (nextPrevious && nextPrevious instanceof Text) {
                didSetUselessComment = true;
                parent.insertBefore(this.uselessComment, nextSibling);
            }
            let bounds = super.insertHTMLBefore(parent, nextSibling, html);
            if (didSetUselessComment) {
                parent.removeChild(this.uselessComment);
            }
            return bounds;
        }
    };
}
function treeConstruction$2(document, TreeConstructionClass) {
    if (!document) return TreeConstructionClass;
    if (!shouldApplyFix$2(document)) {
        return TreeConstructionClass;
    }
    return class TreeConstructionWithTextNodeMergingFix extends TreeConstructionClass {
        constructor(document) {
            super(document);
            this.uselessComment = this.createComment('');
        }
        insertHTMLBefore(parent, reference, html) {
            if (html === null) {
                return super.insertHTMLBefore(parent, reference, html);
            }
            let didSetUselessComment = false;
            let nextPrevious = reference ? reference.previousSibling : parent.lastChild;
            if (nextPrevious && nextPrevious instanceof Text) {
                didSetUselessComment = true;
                parent.insertBefore(this.uselessComment, reference);
            }
            let bounds = super.insertHTMLBefore(parent, reference, html);
            if (didSetUselessComment) {
                parent.removeChild(this.uselessComment);
            }
            return bounds;
        }
    };
}
function shouldApplyFix$2(document) {
    let mergingTextDiv = document.createElement('div');
    mergingTextDiv.innerHTML = 'first';
    mergingTextDiv.insertAdjacentHTML('beforeend', 'second');
    if (mergingTextDiv.childNodes.length === 2) {
        // It worked as expected, no fix required
        return false;
    }
    return true;
}

const SVG_NAMESPACE$$1 = 'http://www.w3.org/2000/svg';
// http://www.w3.org/TR/html/syntax.html#html-integration-point
const SVG_INTEGRATION_POINTS = { foreignObject: 1, desc: 1, title: 1 };
// http://www.w3.org/TR/html/syntax.html#adjust-svg-attributes
// TODO: Adjust SVG attributes
// http://www.w3.org/TR/html/syntax.html#parsing-main-inforeign
// TODO: Adjust SVG elements
// http://www.w3.org/TR/html/syntax.html#parsing-main-inforeign
const BLACKLIST_TABLE = Object.create(null);
["b", "big", "blockquote", "body", "br", "center", "code", "dd", "div", "dl", "dt", "em", "embed", "h1", "h2", "h3", "h4", "h5", "h6", "head", "hr", "i", "img", "li", "listing", "main", "meta", "nobr", "ol", "p", "pre", "ruby", "s", "small", "span", "strong", "strike", "sub", "sup", "table", "tt", "u", "ul", "var"].forEach(tag => BLACKLIST_TABLE[tag] = 1);
let doc = typeof document === 'undefined' ? null : document;

function moveNodesBefore(source, target, nextSibling) {
    let first = source.firstChild;
    let last = null;
    let current = first;
    while (current) {
        last = current;
        current = current.nextSibling;
        target.insertBefore(last, nextSibling);
    }
    return [first, last];
}
class DOMOperations {
    constructor(document) {
        this.document = document;
        this.setupUselessElement();
    }
    // split into seperate method so that NodeDOMTreeConstruction
    // can override it.
    setupUselessElement() {
        this.uselessElement = this.document.createElement('div');
    }
    createElement(tag, context) {
        let isElementInSVGNamespace, isHTMLIntegrationPoint;
        if (context) {
            isElementInSVGNamespace = context.namespaceURI === SVG_NAMESPACE$$1 || tag === 'svg';
            isHTMLIntegrationPoint = SVG_INTEGRATION_POINTS[context.tagName];
        } else {
            isElementInSVGNamespace = tag === 'svg';
            isHTMLIntegrationPoint = false;
        }
        if (isElementInSVGNamespace && !isHTMLIntegrationPoint) {
            // FIXME: This does not properly handle <font> with color, face, or
            // size attributes, which is also disallowed by the spec. We should fix
            // this.
            if (BLACKLIST_TABLE[tag]) {
                throw new Error(`Cannot create a ${tag} inside an SVG context`);
            }
            return this.document.createElementNS(SVG_NAMESPACE$$1, tag);
        } else {
            return this.document.createElement(tag);
        }
    }
    insertBefore(parent, node, reference) {
        parent.insertBefore(node, reference);
    }
    insertHTMLBefore(_parent, nextSibling, html) {
        return insertHTMLBefore(this.uselessElement, _parent, nextSibling, html);
    }
    createTextNode(text) {
        return this.document.createTextNode(text);
    }
    createComment(data) {
        return this.document.createComment(data);
    }
}
var DOM;
(function (DOM) {
    class TreeConstruction extends DOMOperations {
        createElementNS(namespace, tag) {
            return this.document.createElementNS(namespace, tag);
        }
        setAttribute(element, name, value, namespace = null) {
            if (namespace) {
                element.setAttributeNS(namespace, name, value);
            } else {
                element.setAttribute(name, value);
            }
        }
    }
    DOM.TreeConstruction = TreeConstruction;
    let appliedTreeContruction = TreeConstruction;
    appliedTreeContruction = treeConstruction$2(doc, appliedTreeContruction);
    appliedTreeContruction = treeConstruction(doc, appliedTreeContruction);
    appliedTreeContruction = treeConstruction$1(doc, appliedTreeContruction, SVG_NAMESPACE$$1);
    DOM.DOMTreeConstruction = appliedTreeContruction;
})(DOM || (DOM = {}));
class DOMChanges extends DOMOperations {
    constructor(document) {
        super(document);
        this.document = document;
        this.namespace = null;
    }
    setAttribute(element, name, value) {
        element.setAttribute(name, value);
    }
    setAttributeNS(element, namespace, name, value) {
        element.setAttributeNS(namespace, name, value);
    }
    removeAttribute(element, name) {
        element.removeAttribute(name);
    }
    removeAttributeNS(element, namespace, name) {
        element.removeAttributeNS(namespace, name);
    }
    insertNodeBefore(parent, node, reference) {
        if (isDocumentFragment(node)) {
            let firstChild = node.firstChild,
                lastChild = node.lastChild;

            this.insertBefore(parent, node, reference);
            return new ConcreteBounds(parent, firstChild, lastChild);
        } else {
            this.insertBefore(parent, node, reference);
            return new SingleNodeBounds(parent, node);
        }
    }
    insertTextBefore(parent, nextSibling, text) {
        let textNode = this.createTextNode(text);
        this.insertBefore(parent, textNode, nextSibling);
        return textNode;
    }
    insertBefore(element, node, reference) {
        element.insertBefore(node, reference);
    }
    insertAfter(element, node, reference) {
        this.insertBefore(element, node, reference.nextSibling);
    }
}
function insertHTMLBefore(_useless, _parent, _nextSibling, html) {
    // TypeScript vendored an old version of the DOM spec where `insertAdjacentHTML`
    // only exists on `HTMLElement` but not on `Element`. We actually work with the
    // newer version of the DOM API here (and monkey-patch this method in `./compat`
    // when we detect older browsers). This is a hack to work around this limitation.
    let parent = _parent;
    let useless = _useless;
    let nextSibling = _nextSibling;
    let prev = nextSibling ? nextSibling.previousSibling : parent.lastChild;
    let last;
    if (html === null || html === '') {
        return new ConcreteBounds(parent, null, null);
    }
    if (nextSibling === null) {
        parent.insertAdjacentHTML('beforeend', html);
        last = parent.lastChild;
    } else if (nextSibling instanceof HTMLElement) {
        nextSibling.insertAdjacentHTML('beforebegin', html);
        last = nextSibling.previousSibling;
    } else {
        // Non-element nodes do not support insertAdjacentHTML, so add an
        // element and call it on that element. Then remove the element.
        //
        // This also protects Edge, IE and Firefox w/o the inspector open
        // from merging adjacent text nodes. See ./compat/text-node-merging-fix.ts
        parent.insertBefore(useless, nextSibling);
        useless.insertAdjacentHTML('beforebegin', html);
        last = useless.previousSibling;
        parent.removeChild(useless);
    }
    let first = prev ? prev.nextSibling : parent.firstChild;
    return new ConcreteBounds(parent, first, last);
}
function isDocumentFragment(node) {
    return node.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
}
let helper = DOMChanges;
helper = domChanges$2(doc, helper);
helper = domChanges(doc, helper);
helper = domChanges$1(doc, helper, SVG_NAMESPACE$$1);
var DOMChanges$1 = helper;
const DOMTreeConstruction = DOM.DOMTreeConstruction;

function defaultDynamicAttributes(element, attr) {
    let tagName = element.tagName,
        namespaceURI = element.namespaceURI;

    if (namespaceURI === SVG_NAMESPACE$$1) {
        return defaultDynamicAttribute(tagName, attr);
    }

    var _normalizeProperty = normalizeProperty(element, attr);

    let type = _normalizeProperty.type,
        normalized = _normalizeProperty.normalized;

    if (type === 'attr') {
        return defaultDynamicAttribute(tagName, normalized);
    } else {
        return defaultDynamicProperty(tagName, normalized);
    }
}
function defaultDynamicAttribute(tagName, name) {
    if (requiresSanitization(tagName, name)) {
        return SafeDynamicAttribute;
    } else {
        return SimpleDynamicAttribute;
    }
}
function defaultDynamicProperty(tagName, name) {
    if (requiresSanitization(tagName, name)) {
        return SafeDynamicProperty;
    }
    if (isUserInputValue(tagName, name)) {
        return InputValueDynamicAttribute;
    }
    if (isOptionSelected(tagName, name)) {
        return OptionSelectedDynamicAttribute;
    }
    return DefaultDynamicProperty;
}
class DynamicAttribute {
    constructor(attribute) {
        this.attribute = attribute;
    }
}
class SimpleDynamicAttribute extends DynamicAttribute {
    set(dom, value, _env) {
        let normalizedValue = normalizeValue(value);
        if (normalizedValue !== null) {
            var _attribute = this.attribute;
            let name = _attribute.name,
                namespace = _attribute.namespace;

            dom.__setAttribute(name, normalizedValue, namespace);
        }
    }
    update(value, _env) {
        let normalizedValue = normalizeValue(value);
        var _attribute2 = this.attribute;
        let element = _attribute2.element,
            name = _attribute2.name;

        if (normalizedValue === null) {
            element.removeAttribute(name);
        } else {
            element.setAttribute(name, normalizedValue);
        }
    }
}
class DefaultDynamicProperty extends DynamicAttribute {
    set(dom, value, _env) {
        if (value !== null && value !== undefined) {
            let name = this.attribute.name;

            dom.__setProperty(name, value);
        }
    }
    update(value, _env) {
        var _attribute3 = this.attribute;
        let element = _attribute3.element,
            name = _attribute3.name;

        element[name] = value;
        if (value === null || value === undefined) {
            this.removeAttribute();
        }
    }
    removeAttribute() {
        // TODO this sucks but to preserve properties first and to meet current
        // semantics we must do this.
        var _attribute4 = this.attribute;
        let element = _attribute4.element,
            name = _attribute4.name,
            namespace = _attribute4.namespace;

        if (namespace) {
            element.removeAttributeNS(namespace, name);
        } else {
            element.removeAttribute(name);
        }
    }
}
class SafeDynamicProperty extends DefaultDynamicProperty {
    set(dom, value, env) {
        var _attribute5 = this.attribute;
        let element = _attribute5.element,
            name = _attribute5.name;

        let sanitized = sanitizeAttributeValue(env, element, name, value);
        super.set(dom, sanitized, env);
    }
    update(value, env) {
        var _attribute6 = this.attribute;
        let element = _attribute6.element,
            name = _attribute6.name;

        let sanitized = sanitizeAttributeValue(env, element, name, value);
        super.update(sanitized, env);
    }
}
class SafeDynamicAttribute extends SimpleDynamicAttribute {
    set(dom, value, env) {
        var _attribute7 = this.attribute;
        let element = _attribute7.element,
            name = _attribute7.name;

        let sanitized = sanitizeAttributeValue(env, element, name, value);
        super.set(dom, sanitized, env);
    }
    update(value, env) {
        var _attribute8 = this.attribute;
        let element = _attribute8.element,
            name = _attribute8.name;

        let sanitized = sanitizeAttributeValue(env, element, name, value);
        super.update(sanitized, env);
    }
}
class InputValueDynamicAttribute extends DefaultDynamicProperty {
    set(dom, value) {
        dom.__setProperty('value', normalizeStringValue(value));
    }
    update(value) {
        let input = this.attribute.element;
        let currentValue = input.value;
        let normalizedValue = normalizeStringValue(value);
        if (currentValue !== normalizedValue) {
            input.value = normalizedValue;
        }
    }
}
class OptionSelectedDynamicAttribute extends DefaultDynamicProperty {
    set(dom, value) {
        if (value !== null && value !== undefined && value !== false) {
            dom.__setProperty('selected', true);
        }
    }
    update(value) {
        let option = this.attribute.element;
        if (value) {
            option.selected = true;
        } else {
            option.selected = false;
        }
    }
}
function isOptionSelected(tagName, attribute) {
    return tagName === 'OPTION' && attribute === 'selected';
}
function isUserInputValue(tagName, attribute) {
    return (tagName === 'INPUT' || tagName === 'TEXTAREA') && attribute === 'value';
}
function normalizeValue(value) {
    if (value === false || value === undefined || value === null || typeof value.toString === 'undefined') {
        return null;
    }
    if (value === true) {
        return '';
    }
    // onclick function etc in SSR
    if (typeof value === 'function') {
        return null;
    }
    return String(value);
}

class Scope {
    constructor(
    // the 0th slot is `self`
    slots, callerScope,
    // named arguments and blocks passed to a layout that uses eval
    evalScope,
    // locals in scope when the partial was invoked
    partialMap) {
        this.slots = slots;
        this.callerScope = callerScope;
        this.evalScope = evalScope;
        this.partialMap = partialMap;
    }
    static root(self, size = 0) {
        let refs = new Array(size + 1);
        for (let i = 0; i <= size; i++) {
            refs[i] = UNDEFINED_REFERENCE;
        }
        return new Scope(refs, null, null, null).init({ self });
    }
    static sized(size = 0) {
        let refs = new Array(size + 1);
        for (let i = 0; i <= size; i++) {
            refs[i] = UNDEFINED_REFERENCE;
        }
        return new Scope(refs, null, null, null);
    }
    init({ self }) {
        this.slots[0] = self;
        return this;
    }
    getSelf() {
        return this.get(0);
    }
    getSymbol(symbol) {
        return this.get(symbol);
    }
    getBlock(symbol) {
        return this.get(symbol);
    }
    getEvalScope() {
        return this.evalScope;
    }
    getPartialMap() {
        return this.partialMap;
    }
    bind(symbol, value) {
        this.set(symbol, value);
    }
    bindSelf(self) {
        this.set(0, self);
    }
    bindSymbol(symbol, value) {
        this.set(symbol, value);
    }
    bindBlock(symbol, value) {
        this.set(symbol, value);
    }
    bindEvalScope(map) {
        this.evalScope = map;
    }
    bindPartialMap(map) {
        this.partialMap = map;
    }
    bindCallerScope(scope) {
        this.callerScope = scope;
    }
    getCallerScope() {
        return this.callerScope;
    }
    child() {
        return new Scope(this.slots.slice(), this.callerScope, this.evalScope, this.partialMap);
    }
    get(index) {
        if (index >= this.slots.length) {
            throw new RangeError(`BUG: cannot get $${index} from scope; length=${this.slots.length}`);
        }
        return this.slots[index];
    }
    set(index, value) {
        if (index >= this.slots.length) {
            throw new RangeError(`BUG: cannot get $${index} from scope; length=${this.slots.length}`);
        }
        this.slots[index] = value;
    }
}
class Transaction {
    constructor() {
        this.scheduledInstallManagers = [];
        this.scheduledInstallModifiers = [];
        this.scheduledUpdateModifierManagers = [];
        this.scheduledUpdateModifiers = [];
        this.createdComponents = [];
        this.createdManagers = [];
        this.updatedComponents = [];
        this.updatedManagers = [];
        this.destructors = [];
    }
    didCreate(component, manager) {
        this.createdComponents.push(component);
        this.createdManagers.push(manager);
    }
    didUpdate(component, manager) {
        this.updatedComponents.push(component);
        this.updatedManagers.push(manager);
    }
    scheduleInstallModifier(modifier, manager) {
        this.scheduledInstallManagers.push(manager);
        this.scheduledInstallModifiers.push(modifier);
    }
    scheduleUpdateModifier(modifier, manager) {
        this.scheduledUpdateModifierManagers.push(manager);
        this.scheduledUpdateModifiers.push(modifier);
    }
    didDestroy(d) {
        this.destructors.push(d);
    }
    commit() {
        let createdComponents = this.createdComponents,
            createdManagers = this.createdManagers;

        for (let i = 0; i < createdComponents.length; i++) {
            let component = createdComponents[i];
            let manager = createdManagers[i];
            manager.didCreate(component);
        }
        let updatedComponents = this.updatedComponents,
            updatedManagers = this.updatedManagers;

        for (let i = 0; i < updatedComponents.length; i++) {
            let component = updatedComponents[i];
            let manager = updatedManagers[i];
            manager.didUpdate(component);
        }
        let destructors = this.destructors;

        for (let i = 0; i < destructors.length; i++) {
            destructors[i].destroy();
        }
        let scheduledInstallManagers = this.scheduledInstallManagers,
            scheduledInstallModifiers = this.scheduledInstallModifiers;

        for (let i = 0; i < scheduledInstallManagers.length; i++) {
            let manager = scheduledInstallManagers[i];
            let modifier = scheduledInstallModifiers[i];
            manager.install(modifier);
        }
        let scheduledUpdateModifierManagers = this.scheduledUpdateModifierManagers,
            scheduledUpdateModifiers = this.scheduledUpdateModifiers;

        for (let i = 0; i < scheduledUpdateModifierManagers.length; i++) {
            let manager = scheduledUpdateModifierManagers[i];
            let modifier = scheduledUpdateModifiers[i];
            manager.update(modifier);
        }
    }
}
class Opcode {
    constructor(heap) {
        this.heap = heap;
        this.offset = 0;
    }
    get type() {
        return this.heap.getbyaddr(this.offset);
    }
    get op1() {
        return this.heap.getbyaddr(this.offset + 1);
    }
    get op2() {
        return this.heap.getbyaddr(this.offset + 2);
    }
    get op3() {
        return this.heap.getbyaddr(this.offset + 3);
    }
}
var TableSlotState;
(function (TableSlotState) {
    TableSlotState[TableSlotState["Allocated"] = 0] = "Allocated";
    TableSlotState[TableSlotState["Freed"] = 1] = "Freed";
    TableSlotState[TableSlotState["Purged"] = 2] = "Purged";
    TableSlotState[TableSlotState["Pointer"] = 3] = "Pointer";
})(TableSlotState || (TableSlotState = {}));
class Heap {
    constructor() {
        this.heap = [];
        this.offset = 0;
        this.handle = 0;
        /**
         * layout:
         *
         * - pointer into heap
         * - size
         * - freed (0 or 1)
         */
        this.table = [];
    }
    push(item) {
        this.heap[this.offset++] = item;
    }
    getbyaddr(address) {
        return this.heap[address];
    }
    setbyaddr(address, value) {
        this.heap[address] = value;
    }
    malloc() {
        this.table.push(this.offset, 0, 0);
        let handle = this.handle;
        this.handle += 3;
        return handle;
    }
    finishMalloc(handle) {
        let start = this.table[handle];
        let finish = this.offset;
        this.table[handle + 1] = finish - start;
    }
    size() {
        return this.offset;
    }
    // It is illegal to close over this address, as compaction
    // may move it. However, it is legal to use this address
    // multiple times between compactions.
    getaddr(handle) {
        return this.table[handle];
    }
    gethandle(address) {
        this.table.push(address, 0, TableSlotState.Pointer);
        let handle = this.handle;
        this.handle += 3;
        return handle;
    }
    sizeof(handle) {
        return -1;
    }
    free(handle) {
        this.table[handle + 2] = 1;
    }
    compact() {
        let compactedSize = 0;
        let table = this.table,
            length = this.table.length,
            heap = this.heap;

        for (let i = 0; i < length; i += 3) {
            let offset = table[i];
            let size = table[i + 1];
            let state = table[i + 2];
            if (state === TableSlotState.Purged) {
                continue;
            } else if (state === TableSlotState.Freed) {
                // transition to "already freed"
                // a good improvement would be to reuse
                // these slots
                table[i + 2] = 2;
                compactedSize += size;
            } else if (state === TableSlotState.Allocated) {
                for (let j = offset; j <= i + size; j++) {
                    heap[j - compactedSize] = heap[j];
                }
                table[i] = offset - compactedSize;
            } else if (state === TableSlotState.Pointer) {
                table[i] = offset - compactedSize;
            }
        }
        this.offset = this.offset - compactedSize;
    }
}
class Program {
    constructor() {
        this.heap = new Heap();
        this._opcode = new Opcode(this.heap);
        this.constants = new Constants();
    }
    opcode(offset) {
        this._opcode.offset = offset;
        return this._opcode;
    }
}
class Environment {
    constructor({ appendOperations, updateOperations }) {
        this._macros = null;
        this._transaction = null;
        this.program = new Program();
        this.appendOperations = appendOperations;
        this.updateOperations = updateOperations;
    }
    toConditionalReference(reference) {
        return new ConditionalReference(reference);
    }
    getAppendOperations() {
        return this.appendOperations;
    }
    getDOM() {
        return this.updateOperations;
    }
    getIdentity(object) {
        return ensureGuid(object) + '';
    }
    begin() {
        debugAssert(!this._transaction, 'a glimmer transaction was begun, but one already exists. You may have a nested transaction');
        this._transaction = new Transaction();
    }
    get transaction() {
        return expect(this._transaction, 'must be in a transaction');
    }
    didCreate(component, manager) {
        this.transaction.didCreate(component, manager);
    }
    didUpdate(component, manager) {
        this.transaction.didUpdate(component, manager);
    }
    scheduleInstallModifier(modifier, manager) {
        this.transaction.scheduleInstallModifier(modifier, manager);
    }
    scheduleUpdateModifier(modifier, manager) {
        this.transaction.scheduleUpdateModifier(modifier, manager);
    }
    didDestroy(d) {
        this.transaction.didDestroy(d);
    }
    commit() {
        let transaction = this.transaction;
        this._transaction = null;
        transaction.commit();
    }
    attributeFor(element, attr, _isTrusting, _namespace = null) {
        return defaultDynamicAttributes(element, attr);
    }
    macros() {
        let macros = this._macros;
        if (!macros) {
            this._macros = macros = this.populateBuiltins();
        }
        return macros;
    }
    populateBuiltins() {
        return populateBuiltins();
    }
}

class UpdatingVM {
    constructor(env, { alwaysRevalidate = false }) {
        this.frameStack = new Stack();
        this.env = env;
        this.constants = env.program.constants;
        this.dom = env.getDOM();
        this.alwaysRevalidate = alwaysRevalidate;
    }
    execute(opcodes, handler) {
        let frameStack = this.frameStack;

        this.try(opcodes, handler);
        while (true) {
            if (frameStack.isEmpty()) break;
            let opcode = this.frame.nextStatement();
            if (opcode === null) {
                this.frameStack.pop();
                continue;
            }
            opcode.evaluate(this);
        }
    }
    get frame() {
        return expect(this.frameStack.current, 'bug: expected a frame');
    }
    goto(op) {
        this.frame.goto(op);
    }
    try(ops, handler) {
        this.frameStack.push(new UpdatingVMFrame(this, ops, handler));
    }
    throw() {
        this.frame.handleException();
        this.frameStack.pop();
    }
    evaluateOpcode(opcode) {
        opcode.evaluate(this);
    }
}
class BlockOpcode extends UpdatingOpcode {
    constructor(start, state, bounds$$1, children) {
        super();
        this.start = start;
        this.type = "block";
        this.next = null;
        this.prev = null;
        let env = state.env,
            scope = state.scope,
            dynamicScope = state.dynamicScope,
            stack = state.stack;

        this.children = children;
        this.env = env;
        this.scope = scope;
        this.dynamicScope = dynamicScope;
        this.stack = stack;
        this.bounds = bounds$$1;
    }
    parentElement() {
        return this.bounds.parentElement();
    }
    firstNode() {
        return this.bounds.firstNode();
    }
    lastNode() {
        return this.bounds.lastNode();
    }
    evaluate(vm) {
        vm.try(this.children, null);
    }
    destroy() {
        this.bounds.destroy();
    }
    didDestroy() {
        this.env.didDestroy(this.bounds);
    }
    toJSON() {
        let details = dict();
        details["guid"] = `${this._guid}`;
        return {
            guid: this._guid,
            type: this.type,
            details,
            children: this.children.toArray().map(op => op.toJSON())
        };
    }
}
class TryOpcode extends BlockOpcode {
    constructor(start, state, bounds$$1, children) {
        super(start, state, bounds$$1, children);
        this.type = "try";
        this.tag = this._tag = UpdatableTag.create(CONSTANT_TAG);
    }
    didInitializeChildren() {
        this._tag.inner.update(combineSlice(this.children));
    }
    evaluate(vm) {
        vm.try(this.children, this);
    }
    handleException() {
        let env = this.env,
            bounds$$1 = this.bounds,
            children = this.children,
            scope = this.scope,
            dynamicScope = this.dynamicScope,
            start = this.start,
            stack = this.stack,
            prev = this.prev,
            next = this.next;

        children.clear();
        let elementStack = NewElementBuilder.resume(env, bounds$$1, bounds$$1.reset(env));
        let vm = new VM(env, scope, dynamicScope, elementStack);
        let updating = new LinkedList();
        vm.execute(start, vm => {
            vm.stack = EvaluationStack.restore(stack);
            vm.updatingOpcodeStack.push(updating);
            vm.updateWith(this);
            vm.updatingOpcodeStack.push(children);
        });
        this.prev = prev;
        this.next = next;
    }
    toJSON() {
        let json = super.toJSON();
        let details = json["details"];
        if (!details) {
            details = json["details"] = {};
        }
        return super.toJSON();
    }
}
class ListRevalidationDelegate {
    constructor(opcode, marker) {
        this.opcode = opcode;
        this.marker = marker;
        this.didInsert = false;
        this.didDelete = false;
        this.map = opcode.map;
        this.updating = opcode['children'];
    }
    insert(key, item, memo, before) {
        let map$$1 = this.map,
            opcode = this.opcode,
            updating = this.updating;

        let nextSibling = null;
        let reference = null;
        if (before) {
            reference = map$$1[before];
            nextSibling = reference['bounds'].firstNode();
        } else {
            nextSibling = this.marker;
        }
        let vm = opcode.vmForInsertion(nextSibling);
        let tryOpcode = null;
        let start = opcode.start;

        vm.execute(start, vm => {
            map$$1[key] = tryOpcode = vm.iterate(memo, item);
            vm.updatingOpcodeStack.push(new LinkedList());
            vm.updateWith(tryOpcode);
            vm.updatingOpcodeStack.push(tryOpcode.children);
        });
        updating.insertBefore(tryOpcode, reference);
        this.didInsert = true;
    }
    retain(_key, _item, _memo) {}
    move(key, _item, _memo, before) {
        let map$$1 = this.map,
            updating = this.updating;

        let entry = map$$1[key];
        let reference = map$$1[before] || null;
        if (before) {
            move(entry, reference.firstNode());
        } else {
            move(entry, this.marker);
        }
        updating.remove(entry);
        updating.insertBefore(entry, reference);
    }
    delete(key) {
        let map$$1 = this.map;

        let opcode = map$$1[key];
        opcode.didDestroy();
        clear(opcode);
        this.updating.remove(opcode);
        delete map$$1[key];
        this.didDelete = true;
    }
    done() {
        this.opcode.didInitializeChildren(this.didInsert || this.didDelete);
    }
}
class ListBlockOpcode extends BlockOpcode {
    constructor(start, state, bounds$$1, children, artifacts) {
        super(start, state, bounds$$1, children);
        this.type = "list-block";
        this.map = dict();
        this.lastIterated = INITIAL;
        this.artifacts = artifacts;
        let _tag = this._tag = UpdatableTag.create(CONSTANT_TAG);
        this.tag = combine([artifacts.tag, _tag]);
    }
    didInitializeChildren(listDidChange = true) {
        this.lastIterated = this.artifacts.tag.value();
        if (listDidChange) {
            this._tag.inner.update(combineSlice(this.children));
        }
    }
    evaluate(vm) {
        let artifacts = this.artifacts,
            lastIterated = this.lastIterated;

        if (!artifacts.tag.validate(lastIterated)) {
            let bounds$$1 = this.bounds;
            let dom = vm.dom;

            let marker = dom.createComment('');
            dom.insertAfter(bounds$$1.parentElement(), marker, expect(bounds$$1.lastNode(), "can't insert after an empty bounds"));
            let target = new ListRevalidationDelegate(this, marker);
            let synchronizer = new IteratorSynchronizer({ target, artifacts });
            synchronizer.sync();
            this.parentElement().removeChild(marker);
        }
        // Run now-updated updating opcodes
        super.evaluate(vm);
    }
    vmForInsertion(nextSibling) {
        let env = this.env,
            scope = this.scope,
            dynamicScope = this.dynamicScope;

        let elementStack = NewElementBuilder.forInitialRender(this.env, this.bounds.parentElement(), nextSibling);
        return new VM(env, scope, dynamicScope, elementStack);
    }
    toJSON() {
        let json = super.toJSON();
        let map$$1 = this.map;
        let inner = Object.keys(map$$1).map(key => {
            return `${JSON.stringify(key)}: ${map$$1[key]._guid}`;
        }).join(", ");
        let details = json["details"];
        if (!details) {
            details = json["details"] = {};
        }
        details["map"] = `{${inner}}`;
        return json;
    }
}
class UpdatingVMFrame {
    constructor(vm, ops, exceptionHandler) {
        this.vm = vm;
        this.ops = ops;
        this.exceptionHandler = exceptionHandler;
        this.vm = vm;
        this.ops = ops;
        this.current = ops.head();
    }
    goto(op) {
        this.current = op;
    }
    nextStatement() {
        let current = this.current,
            ops = this.ops;

        if (current) this.current = ops.nextNode(current);
        return current;
    }
    handleException() {
        if (this.exceptionHandler) {
            this.exceptionHandler.handleException();
        }
    }
}

class RenderResult {
    constructor(env, updating, bounds$$1) {
        this.env = env;
        this.updating = updating;
        this.bounds = bounds$$1;
    }
    rerender({ alwaysRevalidate = false } = { alwaysRevalidate: false }) {
        let env = this.env,
            updating = this.updating;

        let vm = new UpdatingVM(env, { alwaysRevalidate });
        vm.execute(updating, this);
    }
    parentElement() {
        return this.bounds.parentElement();
    }
    firstNode() {
        return this.bounds.firstNode();
    }
    lastNode() {
        return this.bounds.lastNode();
    }
    opcodes() {
        return this.updating;
    }
    handleException() {
        throw "this should never happen";
    }
    destroy() {
        this.bounds.destroy();
        clear(this.bounds);
    }
}

class EvaluationStack {
    constructor(stack, fp, sp) {
        this.stack = stack;
        this.fp = fp;
        this.sp = sp;
        
    }
    static empty() {
        return new this([], 0, -1);
    }
    static restore(snapshot) {
        return new this(snapshot.slice(), 0, snapshot.length - 1);
    }
    isEmpty() {
        return this.sp === -1;
    }
    push(value) {
        this.stack[++this.sp] = value;
    }
    dup(position = this.sp) {
        this.push(this.stack[position]);
    }
    pop(n = 1) {
        let top = this.stack[this.sp];
        this.sp -= n;
        return top;
    }
    peek() {
        return this.stack[this.sp];
    }
    fromBase(offset) {
        return this.stack[this.fp - offset];
    }
    fromTop(offset) {
        return this.stack[this.sp - offset];
    }
    capture(items) {
        let end = this.sp + 1;
        let start = end - items;
        return this.stack.slice(start, end);
    }
    reset() {
        this.stack.length = 0;
    }
    toArray() {
        return this.stack.slice(this.fp, this.sp + 1);
    }
}
class VM {
    constructor(env, scope, dynamicScope, elementStack) {
        this.env = env;
        this.elementStack = elementStack;
        this.dynamicScopeStack = new Stack();
        this.scopeStack = new Stack();
        this.updatingOpcodeStack = new Stack();
        this.cacheGroups = new Stack();
        this.listBlockStack = new Stack();
        this.stack = EvaluationStack.empty();
        /* Registers */
        this.pc = -1;
        this.ra = -1;
        this.s0 = null;
        this.s1 = null;
        this.t0 = null;
        this.t1 = null;
        this.env = env;
        this.heap = env.program.heap;
        this.constants = env.program.constants;
        this.elementStack = elementStack;
        this.scopeStack.push(scope);
        this.dynamicScopeStack.push(dynamicScope);
    }
    get fp() {
        return this.stack.fp;
    }
    set fp(fp) {
        this.stack.fp = fp;
    }
    get sp() {
        return this.stack.sp;
    }
    set sp(sp) {
        this.stack.sp = sp;
    }
    // Fetch a value from a register onto the stack
    fetch(register) {
        this.stack.push(this[Register[register]]);
    }
    // Load a value from the stack into a register
    load(register) {
        this[Register[register]] = this.stack.pop();
    }
    // Fetch a value from a register
    fetchValue(register) {
        return this[Register[register]];
    }
    // Load a value into a register
    loadValue(register, value) {
        this[Register[register]] = value;
    }
    // Start a new frame and save $ra and $fp on the stack
    pushFrame() {
        this.stack.push(this.ra);
        this.stack.push(this.fp);
        this.fp = this.sp - 1;
    }
    // Restore $ra, $sp and $fp
    popFrame() {
        this.sp = this.fp - 1;
        this.ra = this.stack.fromBase(0);
        this.fp = this.stack.fromBase(-1);
    }
    // Jump to an address in `program`
    goto(offset) {
        this.pc = typePos(this.pc + offset);
    }
    // Save $pc into $ra, then jump to a new address in `program` (jal in MIPS)
    call(handle) {
        let pc = this.heap.getaddr(handle);
        this.ra = this.pc;
        this.pc = pc;
    }
    // Put a specific `program` address in $ra
    returnTo(offset) {
        this.ra = typePos(this.pc + offset);
    }
    // Return to the `program` address stored in $ra
    return() {
        this.pc = this.ra;
    }
    static initial(env, self, dynamicScope, elementStack, program) {
        let scope = Scope.root(self, program.symbolTable.symbols.length);
        let vm = new VM(env, scope, dynamicScope, elementStack);
        vm.pc = vm.heap.getaddr(program.handle);
        vm.updatingOpcodeStack.push(new LinkedList());
        return vm;
    }
    capture(args) {
        return {
            dynamicScope: this.dynamicScope(),
            env: this.env,
            scope: this.scope(),
            stack: this.stack.capture(args)
        };
    }
    beginCacheGroup() {
        this.cacheGroups.push(this.updating().tail());
    }
    commitCacheGroup() {
        //        JumpIfNotModified(END)
        //        (head)
        //        (....)
        //        (tail)
        //        DidModify
        // END:   Noop
        let END = new LabelOpcode("END");
        let opcodes = this.updating();
        let marker = this.cacheGroups.pop();
        let head = marker ? opcodes.nextNode(marker) : opcodes.head();
        let tail = opcodes.tail();
        let tag = combineSlice(new ListSlice(head, tail));
        let guard = new JumpIfNotModifiedOpcode(tag, END);
        opcodes.insertBefore(guard, head);
        opcodes.append(new DidModifyOpcode(guard));
        opcodes.append(END);
    }
    enter(args) {
        let updating = new LinkedList();
        let state = this.capture(args);
        let tracker = this.elements().pushUpdatableBlock();
        let tryOpcode = new TryOpcode(this.heap.gethandle(this.pc), state, tracker, updating);
        this.didEnter(tryOpcode);
    }
    iterate(memo, value) {
        let stack = this.stack;
        stack.push(value);
        stack.push(memo);
        let state = this.capture(2);
        let tracker = this.elements().pushUpdatableBlock();
        // let ip = this.ip;
        // this.ip = end + 4;
        // this.frames.push(ip);
        return new TryOpcode(this.heap.gethandle(this.pc), state, tracker, new LinkedList());
    }
    enterItem(key, opcode) {
        this.listBlock().map[key] = opcode;
        this.didEnter(opcode);
    }
    enterList(relativeStart) {
        let updating = new LinkedList();
        let state = this.capture(0);
        let tracker = this.elements().pushBlockList(updating);
        let artifacts = this.stack.peek().artifacts;
        let start = this.heap.gethandle(typePos(this.pc + relativeStart));
        let opcode = new ListBlockOpcode(start, state, tracker, updating, artifacts);
        this.listBlockStack.push(opcode);
        this.didEnter(opcode);
    }
    didEnter(opcode) {
        this.updateWith(opcode);
        this.updatingOpcodeStack.push(opcode.children);
    }
    exit() {
        this.elements().popBlock();
        this.updatingOpcodeStack.pop();
        let parent = this.updating().tail();
        parent.didInitializeChildren();
    }
    exitList() {
        this.exit();
        this.listBlockStack.pop();
    }
    updateWith(opcode) {
        this.updating().append(opcode);
    }
    listBlock() {
        return expect(this.listBlockStack.current, 'expected a list block');
    }
    updating() {
        return expect(this.updatingOpcodeStack.current, 'expected updating opcode on the updating opcode stack');
    }
    elements() {
        return this.elementStack;
    }
    scope() {
        return expect(this.scopeStack.current, 'expected scope on the scope stack');
    }
    dynamicScope() {
        return expect(this.dynamicScopeStack.current, 'expected dynamic scope on the dynamic scope stack');
    }
    pushChildScope() {
        this.scopeStack.push(this.scope().child());
    }
    pushCallerScope(childScope = false) {
        let callerScope = expect(this.scope().getCallerScope(), 'pushCallerScope is called when a caller scope is present');
        this.scopeStack.push(childScope ? callerScope.child() : callerScope);
    }
    pushDynamicScope() {
        let child = this.dynamicScope().child();
        this.dynamicScopeStack.push(child);
        return child;
    }
    pushRootScope(size, bindCaller) {
        let scope = Scope.sized(size);
        if (bindCaller) scope.bindCallerScope(this.scope());
        this.scopeStack.push(scope);
        return scope;
    }
    popScope() {
        this.scopeStack.pop();
    }
    popDynamicScope() {
        this.dynamicScopeStack.pop();
    }
    newDestroyable(d) {
        this.elements().didAddDestroyable(d);
    }
    /// SCOPE HELPERS
    getSelf() {
        return this.scope().getSelf();
    }
    referenceForSymbol(symbol) {
        return this.scope().getSymbol(symbol);
    }
    /// EXECUTION
    execute(start, initialize) {
        this.pc = this.heap.getaddr(start);
        if (initialize) initialize(this);
        let result;
        while (true) {
            result = this.next();
            if (result.done) break;
        }
        return result.value;
    }
    next() {
        let env = this.env,
            updatingOpcodeStack = this.updatingOpcodeStack,
            elementStack = this.elementStack;

        let opcode = this.nextStatement(env);
        let result;
        if (opcode !== null) {
            APPEND_OPCODES.evaluate(this, opcode, opcode.type);
            result = { done: false, value: null };
        } else {
            // Unload the stack
            this.stack.reset();
            result = {
                done: true,
                value: new RenderResult(env, expect(updatingOpcodeStack.pop(), 'there should be a final updating opcode stack'), elementStack.popBlock())
            };
        }
        return result;
    }
    nextStatement(env) {
        let pc = this.pc;

        if (pc === -1) {
            return null;
        }
        let program = env.program;
        this.pc += 4;
        return program.opcode(pc);
    }
    evaluateOpcode(opcode) {
        APPEND_OPCODES.evaluate(this, opcode, opcode.type);
    }
    bindDynamicScope(names) {
        let scope = this.dynamicScope();
        for (let i = names.length - 1; i >= 0; i--) {
            let name = this.constants.getString(names[i]);
            scope.set(name, this.stack.pop());
        }
    }
}

class TemplateIterator {
    constructor(vm) {
        this.vm = vm;
    }
    next() {
        return this.vm.next();
    }
}
let clientId = 0;
function templateFactory({ id: templateId, meta, block }) {
    let parsedBlock;
    let id = templateId || `client-${clientId++}`;
    let create = (env, envMeta) => {
        let newMeta = envMeta ? assign({}, envMeta, meta) : meta;
        if (!parsedBlock) {
            parsedBlock = JSON.parse(block);
        }
        return new ScannableTemplate(id, newMeta, env, parsedBlock);
    };
    return { id, meta, create };
}
class ScannableTemplate {
    constructor(id, meta, env, rawBlock) {
        this.id = id;
        this.meta = meta;
        this.env = env;
        this.entryPoint = null;
        this.layout = null;
        this.partial = null;
        this.block = null;
        this.scanner = new Scanner(rawBlock, env);
        this.symbols = rawBlock.symbols;
        this.hasEval = rawBlock.hasEval;
    }
    render({ self, parentNode, dynamicScope, mode }) {
        let env = this.env;

        let elementBuilder;
        switch (mode) {
            case undefined:
                elementBuilder = NewElementBuilder.forInitialRender(env, parentNode, null);
                break;
            case 'rehydrate':
                elementBuilder = RehydrateBuilder.forInitialRender(env, parentNode, null);
                break;
            case 'serialize':
                elementBuilder = SerializeBuilder.forInitialRender(env, parentNode, null);
                break;
            default:
                throw new Error('unreachable');
        }
        let compiled = this.asEntryPoint().compileDynamic(env);
        let vm = VM.initial(env, self, dynamicScope, elementBuilder, compiled);
        return new TemplateIterator(vm);
    }
    asEntryPoint() {
        if (!this.entryPoint) this.entryPoint = this.scanner.scanEntryPoint(this.compilationMeta());
        return this.entryPoint;
    }
    asLayout(componentName, attrs) {
        if (!this.layout) this.layout = this.scanner.scanLayout(this.compilationMeta(), attrs || EMPTY_ARRAY, componentName);
        return this.layout;
    }
    asPartial() {
        if (!this.partial) this.partial = this.scanner.scanEntryPoint(this.compilationMeta(true));
        return this.partial;
    }
    asBlock() {
        if (!this.block) this.block = this.scanner.scanBlock(this.compilationMeta());
        return this.block;
    }
    compilationMeta(asPartial = false) {
        return { templateMeta: this.meta, symbols: this.symbols, asPartial };
    }
}

function EMPTY_CACHE() {}

class PathReference {
    constructor(parent, property) {
        this.cache = EMPTY_CACHE;
        this.inner = null;
        this.chains = null;
        this.lastParentValue = EMPTY_CACHE;
        this._guid = 0;
        this.tag = VOLATILE_TAG;
        this.parent = parent;
        this.property = property;
    }
    value() {
        let lastParentValue = this.lastParentValue,
            property = this.property,
            inner = this.inner;

        let parentValue = this._parentValue();
        if (parentValue === null || parentValue === undefined) {
            return this.cache = undefined;
        }
        if (lastParentValue === parentValue) {
            inner = this.inner;
        } else {
            let ReferenceType = typeof parentValue === 'object' ? Meta.for(parentValue).referenceTypeFor(property) : PropertyReference;
            inner = this.inner = new ReferenceType(parentValue, property, this);
        }
        // if (typeof parentValue === 'object') {
        //   Meta.for(parentValue).addReference(property, this);
        // }
        return this.cache = inner.value();
    }
    get(prop) {
        let chains = this._getChains();
        if (prop in chains) return chains[prop];
        return chains[prop] = new PathReference(this, prop);
    }
    label() {
        return '[reference Direct]';
    }
    _getChains() {
        if (this.chains) return this.chains;
        return this.chains = dict();
    }
    _parentValue() {
        let parent = this.parent.value();
        this.lastParentValue = parent;
        return parent;
    }
}

class RootReference {
    constructor(object) {
        this.chains = dict();
        this.tag = VOLATILE_TAG;
        this.object = object;
    }
    value() {
        return this.object;
    }
    update(object) {
        this.object = object;
        // this.notify();
    }
    get(prop) {
        let chains = this.chains;
        if (prop in chains) return chains[prop];
        return chains[prop] = new PathReference(this, prop);
    }
    chainFor(prop) {
        let chains = this.chains;
        if (prop in chains) return chains[prop];
        return null;
    }
    path(string) {
        return string.split('.').reduce((ref, part) => ref.get(part), this);
    }
    referenceFromParts(parts) {
        return parts.reduce((ref, part) => ref.get(part), this);
    }
    label() {
        return '[reference Root]';
    }
}

const NOOP_DESTROY = { destroy() {} };
class ConstPath {
    constructor(parent, _property) {
        this.tag = VOLATILE_TAG;
        this.parent = parent;
    }
    chain() {
        return NOOP_DESTROY;
    }
    notify() {}
    value() {
        return this.parent[this.property];
    }
    get(prop) {
        return new ConstPath(this.parent[this.property], prop);
    }
}
class ConstRoot {
    constructor(value) {
        this.tag = VOLATILE_TAG;
        this.inner = value;
    }
    update(inner) {
        this.inner = inner;
    }
    chain() {
        return NOOP_DESTROY;
    }
    notify() {}
    value() {
        return this.inner;
    }
    referenceFromParts(_parts) {
        throw new Error("Not implemented");
    }
    chainFor(_prop) {
        throw new Error("Not implemented");
    }
    get(prop) {
        return new ConstPath(this.inner, prop);
    }
}
class ConstMeta /*implements IMeta*/ {
    constructor(object) {
        this.object = object;
    }
    root() {
        return new ConstRoot(this.object);
    }
}
const CLASS_META = "df8be4c8-4e89-44e2-a8f9-550c8dacdca7";
const hasOwnProperty = Object.hasOwnProperty;
class Meta {
    constructor(object, { RootReferenceFactory, DefaultPathReferenceFactory }) {
        this.references = null;
        this.slots = null;
        this.referenceTypes = null;
        this.propertyMetadata = null;
        this.object = object;
        this.RootReferenceFactory = RootReferenceFactory || RootReference;
        this.DefaultPathReferenceFactory = DefaultPathReferenceFactory || PropertyReference;
    }
    static for(obj) {
        if (obj === null || obj === undefined) return new Meta(obj, {});
        if (hasOwnProperty.call(obj, '_meta') && obj._meta) return obj._meta;
        if (!Object.isExtensible(obj)) return new ConstMeta(obj);
        let MetaToUse = Meta;
        if (obj.constructor && obj.constructor[CLASS_META]) {
            let classMeta = obj.constructor[CLASS_META];
            MetaToUse = classMeta.InstanceMetaConstructor;
        } else if (obj[CLASS_META]) {
            MetaToUse = obj[CLASS_META].InstanceMetaConstructor;
        }
        return obj._meta = new MetaToUse(obj, {});
    }
    static exists(obj) {
        return typeof obj === 'object' && obj._meta;
    }
    static metadataForProperty(_key) {
        return null;
    }
    addReference(property, reference) {
        let refs = this.references = this.references || dict();
        let set = refs[property] = refs[property] || new DictSet();
        set.add(reference);
    }
    addReferenceTypeFor(property, type) {
        this.referenceTypes = this.referenceTypes || dict();
        this.referenceTypes[property] = type;
    }
    referenceTypeFor(property) {
        if (!this.referenceTypes) return PropertyReference;
        return this.referenceTypes[property] || PropertyReference;
    }
    removeReference(property, reference) {
        if (!this.references) return;
        let set = this.references[property];
        set.delete(reference);
    }
    getReferenceTypes() {
        this.referenceTypes = this.referenceTypes || dict();
        return this.referenceTypes;
    }
    referencesFor(property) {
        if (!this.references) return null;
        return this.references[property];
    }
    getSlots() {
        return this.slots = this.slots || dict();
    }
    root() {
        return this.rootCache = this.rootCache || new this.RootReferenceFactory(this.object);
    }
}

class PropertyReference {
    constructor(object, property, _outer) {
        this.tag = VOLATILE_TAG;
        this.object = object;
        this.property = property;
    }
    value() {
        return this.object[this.property];
    }
    label() {
        return '[reference Property]';
    }
}

// import { metaFor } from './meta';
// import { intern } from '@glimmer/util';

function isTypeSpecifier(specifier) {
    return specifier.indexOf(':') === -1;
}
class ApplicationRegistry {
    constructor(registry, resolver) {
        this._registry = registry;
        this._resolver = resolver;
    }
    register(specifier, factory, options) {
        let normalizedSpecifier = this._toAbsoluteSpecifier(specifier);
        this._registry.register(normalizedSpecifier, factory, options);
    }
    registration(specifier) {
        let normalizedSpecifier = this._toAbsoluteSpecifier(specifier);
        return this._registry.registration(normalizedSpecifier);
    }
    unregister(specifier) {
        let normalizedSpecifier = this._toAbsoluteSpecifier(specifier);
        this._registry.unregister(normalizedSpecifier);
    }
    registerOption(specifier, option, value) {
        let normalizedSpecifier = this._toAbsoluteOrTypeSpecifier(specifier);
        this._registry.registerOption(normalizedSpecifier, option, value);
    }
    registeredOption(specifier, option) {
        let normalizedSpecifier = this._toAbsoluteOrTypeSpecifier(specifier);
        return this._registry.registeredOption(normalizedSpecifier, option);
    }
    registeredOptions(specifier) {
        let normalizedSpecifier = this._toAbsoluteOrTypeSpecifier(specifier);
        return this._registry.registeredOptions(normalizedSpecifier);
    }
    unregisterOption(specifier, option) {
        let normalizedSpecifier = this._toAbsoluteOrTypeSpecifier(specifier);
        this._registry.unregisterOption(normalizedSpecifier, option);
    }
    registerInjection(specifier, property, injection) {
        let normalizedSpecifier = this._toAbsoluteOrTypeSpecifier(specifier);
        let normalizedInjection = this._toAbsoluteSpecifier(injection);
        this._registry.registerInjection(normalizedSpecifier, property, normalizedInjection);
    }
    registeredInjections(specifier) {
        let normalizedSpecifier = this._toAbsoluteOrTypeSpecifier(specifier);
        return this._registry.registeredInjections(normalizedSpecifier);
    }
    _toAbsoluteSpecifier(specifier, referrer) {
        return this._resolver.identify(specifier, referrer);
    }
    _toAbsoluteOrTypeSpecifier(specifier) {
        if (isTypeSpecifier(specifier)) {
            return specifier;
        } else {
            return this._toAbsoluteSpecifier(specifier);
        }
    }
}

class DynamicScope {
    constructor(bucket = null) {
        if (bucket) {
            this.bucket = assign({}, bucket);
        } else {
            this.bucket = {};
        }
    }
    get(key) {
        return this.bucket[key];
    }
    set(key, reference) {
        return this.bucket[key] = reference;
    }
    child() {
        return new DynamicScope(this.bucket);
    }
}

class ArrayIterator {
    constructor(array, keyFor) {
        this.position = 0;
        this.array = array;
        this.keyFor = keyFor;
    }
    isEmpty() {
        return this.array.length === 0;
    }
    next() {
        let position = this.position,
            array = this.array,
            keyFor = this.keyFor;

        if (position >= array.length) return null;
        let value = array[position];
        let key = keyFor(value, position);
        let memo = position;
        this.position++;
        return { key, value, memo };
    }
}
class ObjectKeysIterator {
    constructor(keys, values, keyFor) {
        this.position = 0;
        this.keys = keys;
        this.values = values;
        this.keyFor = keyFor;
    }
    isEmpty() {
        return this.keys.length === 0;
    }
    next() {
        let position = this.position,
            keys = this.keys,
            values = this.values,
            keyFor = this.keyFor;

        if (position >= keys.length) return null;
        let value = values[position];
        let memo = keys[position];
        let key = keyFor(value, memo);
        this.position++;
        return { key, value, memo };
    }
}
class EmptyIterator {
    isEmpty() {
        return true;
    }
    next() {
        throw new Error(`Cannot call next() on an empty iterator`);
    }
}
const EMPTY_ITERATOR = new EmptyIterator();
class Iterable {
    constructor(ref, keyFor) {
        this.tag = ref.tag;
        this.ref = ref;
        this.keyFor = keyFor;
    }
    iterate() {
        let ref = this.ref,
            keyFor = this.keyFor;

        let iterable = ref.value();
        if (Array.isArray(iterable)) {
            return iterable.length > 0 ? new ArrayIterator(iterable, keyFor) : EMPTY_ITERATOR;
        } else if (iterable === undefined || iterable === null) {
            return EMPTY_ITERATOR;
        } else if (iterable.forEach !== undefined) {
            let array = [];
            iterable.forEach(function (item) {
                array.push(item);
            });
            return array.length > 0 ? new ArrayIterator(array, keyFor) : EMPTY_ITERATOR;
        } else if (typeof iterable === 'object') {
            let keys = Object.keys(iterable);
            return keys.length > 0 ? new ObjectKeysIterator(keys, keys.map(key => iterable[key]), keyFor) : EMPTY_ITERATOR;
        } else {
            throw new Error(`Don't know how to {{#each ${iterable}}}`);
        }
    }
    valueReferenceFor(item) {
        return new RootReference(item.value);
    }
    updateValueReference(reference, item) {
        reference.update(item.value);
    }
    memoReferenceFor(item) {
        return new RootReference(item.memo);
    }
    updateMemoReference(reference, item) {
        reference.update(item.memo);
    }
}

function blockComponentMacro(params, hash, template, inverse, builder) {
    let definitionArgs = [params.slice(0, 1), null, null, null];
    let args = [params.slice(1), hashToArgs(hash), template, inverse];
    builder.component.dynamic(definitionArgs, dynamicComponentFor, args);
    return true;
}
function inlineComponentMacro(_name, params, hash, builder) {
    let definitionArgs = [params.slice(0, 1), null, null, null];
    let args = [params.slice(1), hashToArgs(hash), null, null];
    builder.component.dynamic(definitionArgs, dynamicComponentFor, args);
    return true;
}
function dynamicComponentFor(vm, args, meta) {
    let nameRef = args.positional.at(0);
    let env = vm.env;
    return new DynamicComponentReference(nameRef, env, meta);
}
class DynamicComponentReference {
    constructor(nameRef, env, meta) {
        this.nameRef = nameRef;
        this.env = env;
        this.meta = meta;
        this.tag = nameRef.tag;
    }
    value() {
        let env = this.env,
            nameRef = this.nameRef;

        let nameOrDef = nameRef.value();
        if (typeof nameOrDef === 'string') {
            return env.getComponentDefinition(nameOrDef, this.meta);
        }
        return null;
    }
    get() {
        return UNDEFINED_REFERENCE;
    }
}
function hashToArgs(hash) {
    if (hash === null) return null;
    let names = hash[0].map(key => `@${key}`);
    return [names, hash[1]];
}

function buildAction(vm, _args) {
    let componentRef = vm.getSelf();
    let args = _args.capture();
    let actionFunc = args.positional.at(0).value();
    if (typeof actionFunc !== 'function') {
        throwNoActionError(actionFunc, args.positional.at(0));
    }
    return new ConstReference(function action(...invokedArgs) {
        let curriedArgs = args.positional.value();
        // Consume the action function that was already captured above.
        curriedArgs.shift();
        curriedArgs.push(...invokedArgs);
        // Invoke the function with the component as the context, the curried
        // arguments passed to `{{action}}`, and the arguments the bound function
        // was invoked with.
        actionFunc.apply(componentRef && componentRef.value(), curriedArgs);
    });
}
function throwNoActionError(actionFunc, actionFuncReference) {
    let referenceInfo = debugInfoForReference(actionFuncReference);
    throw new Error(`You tried to create an action with the {{action}} helper, but the first argument ${referenceInfo}was ${typeof actionFunc} instead of a function.`);
}
function debugInfoForReference(reference) {
    let message = '';
    let parent;
    let property;
    if (reference === null || reference === undefined) {
        return message;
    }
    if ('parent' in reference && 'property' in reference) {
        parent = reference['parent'].value();
        property = reference['property'];
    } else if ('_parentValue' in reference && '_propertyKey' in reference) {
        parent = reference['_parentValue'];
        property = reference['_propertyKey'];
    }
    if (property !== undefined) {
        message += `('${property}' on ${debugName(parent)}) `;
    }
    return message;
}
function debugName(obj) {
    let objType = typeof obj;
    if (obj === null || obj === undefined) {
        return objType;
    } else if (objType === 'number' || objType === 'boolean') {
        return obj.toString();
    } else {
        if (obj['debugName']) {
            return obj['debugName'];
        }
        try {
            return JSON.stringify(obj);
        } catch (e) {}
        return obj.toString();
    }
}

function buildUserHelper(helperFunc) {
    return (_vm, args) => new HelperReference(helperFunc, args);
}
class SimplePathReference {
    constructor(parent, property) {
        this.tag = VOLATILE_TAG;
        this.parent = parent;
        this.property = property;
    }
    value() {
        return this.parent.value()[this.property];
    }
    get(prop) {
        return new SimplePathReference(this, prop);
    }
}
class HelperReference {
    constructor(helper, args) {
        this.tag = VOLATILE_TAG;
        this.helper = helper;
        this.args = args.capture();
    }
    value() {
        let helper = this.helper,
            args = this.args;

        return helper(args.positional.value(), args.named.value());
    }
    get(prop) {
        return new SimplePathReference(this, prop);
    }
}

class DefaultComponentDefinition extends ComponentDefinition {
    toJSON() {
        return `<default-component-definition name=${this.name}>`;
    }
}
const DEFAULT_MANAGER = 'main';
const DEFAULT_HELPERS = {
    action: buildAction
};
class Environment$1 extends Environment {
    constructor(options) {
        super({ appendOperations: options.appendOperations, updateOperations: new DOMChanges$1(options.document || document) });
        this.helpers = dict();
        this.modifiers = dict();
        this.components = dict();
        this.managers = dict();
        setOwner(this, getOwner(options));
        // TODO - required for `protocolForURL` - seek alternative approach
        // e.g. see `installPlatformSpecificProtocolForURL` in Ember
        this.uselessAnchor = options.document.createElement('a');
    }
    static create(options = {}) {
        options.document = options.document || self.document;
        options.appendOperations = options.appendOperations || new DOMTreeConstruction(options.document);
        return new Environment$1(options);
    }
    protocolForURL(url) {
        // TODO - investigate alternative approaches
        // e.g. see `installPlatformSpecificProtocolForURL` in Ember
        this.uselessAnchor.href = url;
        return this.uselessAnchor.protocol;
    }
    hasPartial() {
        return false;
    }
    lookupPartial() {}
    managerFor(managerId = DEFAULT_MANAGER) {
        let manager;
        manager = this.managers[managerId];
        if (!manager) {
            let app = getOwner(this);
            manager = this.managers[managerId] = getOwner(this).lookup(`component-manager:/${app.rootName}/component-managers/${managerId}`);
            if (!manager) {
                throw new Error(`No component manager found for ID ${managerId}.`);
            }
        }
        return manager;
    }
    hasComponentDefinition(name, meta) {
        return !!this.identifyComponent(name, meta);
    }
    getComponentDefinition(name, meta) {
        let owner = getOwner(this);
        let specifier = unwrap(this.identifyComponent(name, meta));
        if (!this.components[specifier]) {
            return this.registerComponent(name, specifier, meta, owner);
        }
        return this.components[specifier];
    }
    registerComponent(name, templateSpecifier, meta, owner) {
        let serializedTemplate = owner.lookup('template', templateSpecifier);
        let componentSpecifier = owner.identify('component', templateSpecifier);
        let componentFactory = null;
        if (componentSpecifier) {
            componentFactory = owner.factoryFor(componentSpecifier);
        }
        let template = templateFactory(serializedTemplate).create(this);
        let manager = this.managerFor(serializedTemplate.meta.managerId);
        let definition;
        if (canCreateComponentDefinition(manager)) {
            definition = manager.createComponentDefinition(name, template, componentFactory);
        } else {
            definition = new DefaultComponentDefinition(name, manager, componentFactory);
        }
        this.components[templateSpecifier] = definition;
        return definition;
    }
    hasHelper(name, meta) {
        return !!this.lookupHelper(name, meta);
    }
    lookupHelper(name, meta) {
        if (DEFAULT_HELPERS[name]) {
            return DEFAULT_HELPERS[name];
        }
        let owner = getOwner(this);
        let relSpecifier = `helper:${name}`;
        let referrer = meta.specifier;
        let specifier = owner.identify(relSpecifier, referrer);
        if (specifier === undefined) {
            return;
        }
        if (!this.helpers[specifier]) {
            return this.registerHelper(specifier, owner);
        }
        return this.helpers[specifier];
    }
    registerHelper(specifier, owner) {
        let helperFunc = owner.lookup(specifier);
        let userHelper = buildUserHelper(helperFunc);
        this.helpers[specifier] = userHelper;
        return userHelper;
    }
    hasModifier(modifierName, blockMeta) {
        return modifierName.length === 1 && modifierName in this.modifiers;
    }
    lookupModifier(modifierName, blockMeta) {
        let modifier = this.modifiers[modifierName];
        if (!modifier) throw new Error(`Modifier for ${modifierName} not found.`);
        return modifier;
    }
    iterableFor(ref, keyPath) {
        let keyFor;
        if (!keyPath) {
            throw new Error('Must specify a key for #each');
        }
        switch (keyPath) {
            case '@index':
                keyFor = (_, index) => String(index);
                break;
            case '@primitive':
                keyFor = item => String(item);
                break;
            default:
                keyFor = item => item[keyPath];
                break;
        }
        return new Iterable(ref, keyFor);
    }
    macros() {
        let macros = super.macros();
        populateMacros(macros.blocks, macros.inlines);
        return macros;
    }
    identifyComponent(name, meta) {
        let owner = getOwner(this);
        let relSpecifier = `template:${name}`;
        let referrer = meta.specifier;
        let specifier = owner.identify(relSpecifier, referrer);
        if (specifier === undefined && owner.identify(`component:${name}`, referrer)) {
            throw new Error(`The component '${name}' is missing a template. All components must have a template. Make sure there is a template.hbs in the component directory.`);
        }
        return specifier;
    }
}
function populateMacros(blocks, inlines) {
    blocks.add('component', blockComponentMacro);
    inlines.add('component', inlineComponentMacro);
}
function canCreateComponentDefinition(manager) {
    return manager.createComponentDefinition !== undefined;
}

var mainTemplate = { "id": "UN61+JFU", "block": "{\"symbols\":[\"root\"],\"statements\":[[4,\"each\",[[19,0,[\"roots\"]]],[[\"key\"],[\"id\"]],{\"statements\":[[4,\"-in-element\",[[19,1,[\"parent\"]]],[[\"nextSibling\"],[[19,1,[\"nextSibling\"]]]],{\"statements\":[[1,[25,\"component\",[[19,1,[\"component\"]]],null],false]],\"parameters\":[]},null]],\"parameters\":[1]},null]],\"hasEval\":false}", "meta": { "specifier": "template:/-application/templates/main" } };

function NOOP() {}
class Application {
    constructor(options) {
        this._roots = [];
        this._rootsIndex = 0;
        this._initializers = [];
        this._initialized = false;
        this._rendering = false;
        this._rendered = false;
        this._scheduled = false;
        this._rerender = NOOP;
        this.rootName = options.rootName;
        this.resolver = options.resolver;
        this.document = options.document || window.document;
    }
    /** @hidden */
    registerInitializer(initializer) {
        this._initializers.push(initializer);
    }
    /** @hidden */
    initRegistry() {
        let registry = this._registry = new Registry();
        // Create ApplicationRegistry as a proxy to the underlying registry
        // that will only be available during `initialize`.
        let appRegistry = new ApplicationRegistry(this._registry, this.resolver);
        registry.register(`environment:/${this.rootName}/main/main`, Environment$1);
        registry.registerOption('helper', 'instantiate', false);
        registry.registerOption('template', 'instantiate', false);
        registry.register(`document:/${this.rootName}/main/main`, this.document);
        registry.registerOption('document', 'instantiate', false);
        registry.registerInjection('environment', 'document', `document:/${this.rootName}/main/main`);
        registry.registerInjection('component-manager', 'env', `environment:/${this.rootName}/main/main`);
        let initializers = this._initializers;
        for (let i = 0; i < initializers.length; i++) {
            initializers[i].initialize(appRegistry);
        }
        this._initialized = true;
    }
    /** @hidden */
    initContainer() {
        this._container = new Container(this._registry, this.resolver);
        // Inject `this` (the app) as the "owner" of every object instantiated
        // by its container.
        this._container.defaultInjections = specifier => {
            let hash = {};
            setOwner(hash, this);
            return hash;
        };
    }
    /** @hidden */
    initialize() {
        this.initRegistry();
        this.initContainer();
    }
    /** @hidden */
    boot() {
        this.initialize();
        this.env = this.lookup(`environment:/${this.rootName}/main/main`);
        this.render();
    }
    /** @hidden */
    render() {
        this.env.begin();
        let mainLayout = templateFactory(mainTemplate).create(this.env);
        let self = new RootReference({ roots: this._roots });
        let doc = this.document; // TODO FixReification
        let parentNode = doc.body;
        let dynamicScope = new DynamicScope();
        let templateIterator = mainLayout.render({ self, parentNode, dynamicScope });
        let result;
        do {
            result = templateIterator.next();
        } while (!result.done);
        this.env.commit();
        let renderResult = result.value;
        this._rerender = () => {
            this.env.begin();
            renderResult.rerender();
            this.env.commit();
            this._didRender();
        };
        this._didRender();
    }
    _didRender() {
        this._rendered = true;
    }
    renderComponent(component, parent, nextSibling = null) {
        this._roots.push({ id: this._rootsIndex++, component, parent, nextSibling });
        this.scheduleRerender();
    }
    scheduleRerender() {
        if (this._scheduled || !this._rendered) return;
        this._rendering = true;
        this._scheduled = true;
        requestAnimationFrame(() => {
            this._scheduled = false;
            this._rerender();
            this._rendering = false;
        });
    }
    /**
     * Owner interface implementation
     *
     * @hidden
     */
    identify(specifier, referrer) {
        return this.resolver.identify(specifier, referrer);
    }
    /** @hidden */
    factoryFor(specifier, referrer) {
        return this._container.factoryFor(this.identify(specifier, referrer));
    }
    /** @hidden */
    lookup(specifier, referrer) {
        return this._container.lookup(this.identify(specifier, referrer));
    }
}

// TODO - use symbol

function isSpecifierStringAbsolute$1(specifier) {
    var _specifier$split = specifier.split(':');

    let type = _specifier$split[0],
        path = _specifier$split[1];

    return !!(type && path && path.indexOf('/') === 0 && path.split('/').length > 3);
}
function isSpecifierObjectAbsolute$1(specifier) {
    return specifier.rootName !== undefined && specifier.collection !== undefined && specifier.name !== undefined && specifier.type !== undefined;
}
function serializeSpecifier$1(specifier) {
    let type = specifier.type;
    let path = serializeSpecifierPath$1(specifier);
    if (path) {
        return type + ':' + path;
    } else {
        return type;
    }
}
function serializeSpecifierPath$1(specifier) {
    let path = [];
    if (specifier.rootName) {
        path.push(specifier.rootName);
    }
    if (specifier.collection) {
        path.push(specifier.collection);
    }
    if (specifier.namespace) {
        path.push(specifier.namespace);
    }
    if (specifier.name) {
        path.push(specifier.name);
    }
    if (path.length > 0) {
        let fullPath = path.join('/');
        if (isSpecifierObjectAbsolute$1(specifier)) {
            fullPath = '/' + fullPath;
        }
        return fullPath;
    }
}
function deserializeSpecifier$1(specifier) {
    let obj = {};
    if (specifier.indexOf(':') > -1) {
        var _specifier$split2 = specifier.split(':');

        let type = _specifier$split2[0],
            path = _specifier$split2[1];

        obj.type = type;
        let pathSegments;
        if (path.indexOf('/') === 0) {
            pathSegments = path.substr(1).split('/');
            obj.rootName = pathSegments.shift();
            obj.collection = pathSegments.shift();
        } else {
            pathSegments = path.split('/');
        }
        if (pathSegments.length > 0) {
            obj.name = pathSegments.pop();
            if (pathSegments.length > 0) {
                obj.namespace = pathSegments.join('/');
            }
        }
    } else {
        obj.type = specifier;
    }
    return obj;
}

function assert$1(description, test) {
    if (!test) {
        throw new Error('Assertion Failed: ' + description);
    }
}

class Resolver {
    constructor(config, registry) {
        this.config = config;
        this.registry = registry;
    }
    identify(specifier, referrer) {
        if (isSpecifierStringAbsolute$1(specifier)) {
            return specifier;
        }
        let s = deserializeSpecifier$1(specifier);
        let result;
        if (referrer) {
            let r = deserializeSpecifier$1(referrer);
            if (isSpecifierObjectAbsolute$1(r)) {
                assert$1('Specifier must not include a rootName, collection, or namespace when combined with an absolute referrer', s.rootName === undefined && s.collection === undefined && s.namespace === undefined);
                // Look locally in the referrer's namespace
                s.rootName = r.rootName;
                s.collection = r.collection;
                if (s.name) {
                    s.namespace = r.namespace ? r.namespace + '/' + r.name : r.name;
                } else {
                    s.namespace = r.namespace;
                    s.name = r.name;
                }
                if (result = this._serializeAndVerify(s)) {
                    return result;
                }
                // Look for a private collection in the referrer's namespace
                let privateCollection = this._definitiveCollection(s.type);
                if (privateCollection) {
                    s.namespace += '/-' + privateCollection;
                    if (result = this._serializeAndVerify(s)) {
                        return result;
                    }
                }
                // Because local and private resolution has failed, clear all but `name` and `type`
                // to proceed with top-level resolution
                s.rootName = s.collection = s.namespace = undefined;
            } else {
                assert$1('Referrer must either be "absolute" or include a `type` to determine the associated type', r.type);
                // Look in the definitive collection for the associated type
                s.collection = this._definitiveCollection(r.type);
                assert$1(`'${r.type}' does not have a definitive collection`, s.collection);
            }
        }
        // If the collection is unspecified, use the definitive collection for the `type`
        if (!s.collection) {
            s.collection = this._definitiveCollection(s.type);
            assert$1(`'${s.type}' does not have a definitive collection`, s.collection);
        }
        if (!s.rootName) {
            // If the root name is unspecified, try the app's `rootName` first
            s.rootName = this.config.app.rootName || 'app';
            if (result = this._serializeAndVerify(s)) {
                return result;
            }
            // Then look for an addon with a matching `rootName`
            let addonDef;
            if (s.namespace) {
                addonDef = this.config.addons && this.config.addons[s.namespace];
                s.rootName = s.namespace;
                s.namespace = undefined;
            } else {
                addonDef = this.config.addons && this.config.addons[s.name];
                s.rootName = s.name;
                s.name = 'main';
            }
        }
        if (result = this._serializeAndVerify(s)) {
            return result;
        }
    }
    retrieve(specifier) {
        return this.registry.get(specifier);
    }
    resolve(specifier, referrer) {
        let id = this.identify(specifier, referrer);
        if (id) {
            return this.retrieve(id);
        }
    }
    _definitiveCollection(type) {
        let typeDef = this.config.types[type];
        assert$1(`'${type}' is not a recognized type`, typeDef);
        return typeDef.definitiveCollection;
    }
    _serializeAndVerify(specifier) {
        let serialized = serializeSpecifier$1(specifier);
        if (this.registry.has(serialized)) {
            return serialized;
        }
    }
}

class BasicRegistry {
    constructor(entries = {}) {
        this._entries = entries;
    }
    has(specifier) {
        return specifier in this._entries;
    }
    get(specifier) {
        return this._entries[specifier];
    }
}

var __ui_components_app_layout_template__ = { "id": "mbJByemq", "block": "{\"symbols\":[],\"statements\":[[5,\"top-nav\",[],[[],[]],{\"statements\":[],\"parameters\":[]}],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "specifier": "template:/web-ui/components/app-layout" } };

var __ui_components_app_layout_top_nav_template__ = { "id": "RjEkdNl5", "block": "{\"symbols\":[],\"statements\":[[6,\"header\"],[9,\"class\",\"header\"],[7],[0,\"\\n  \"],[6,\"nav\"],[9,\"class\",\"inner\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"container-logo\"],[7],[0,\"\\n      \"],[6,\"a\"],[9,\"href\",\"#/catalog/1\"],[7],[0,\"\\n        \"],[6,\"img\"],[9,\"alt\",\"Rapid Stack\"],[9,\"class\",\"logo\"],[9,\"src\",\"/assets/icon.jpg\"],[7],[8],[0,\"\\n        \"],[6,\"span\"],[7],[0,\"\\n        Rapid Stack |\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "specifier": "template:/web-ui/components/app-layout/top-nav" } };

/**
 * Stores bookkeeping information about tracked properties on the target object
 * and includes helper methods for manipulating and retrieving that data.
 *
 * Computed properties (i.e., tracked getters/setters) deserve some explanation.
 * A computed property is invalidated when either it is set, or one of its
 * dependencies is invalidated. Therefore, we store two tags for each computed
 * property:
 *
 * 1. The dirtyable tag that we invalidate when the setter is invoked.
 * 2. A union tag (tag combinator) of the dirtyable tag and all of the computed
 *    property's dependencies' tags, used by Glimmer to determine "does this
 *    computed property need to be recomputed?"
 */
class Meta$2 {
    constructor(parent) {
        this.tags = dict();
        this.computedPropertyTags = dict();
        this.trackedProperties = parent ? Object.create(parent.trackedProperties) : dict();
        this.trackedPropertyDependencies = parent ? Object.create(parent.trackedPropertyDependencies) : dict();
    }
    /**
     * The tag representing whether the given property should be recomputed. Used
     * by e.g. Glimmer VM to detect when a property should be re-rendered. Think
     * of this as the "public-facing" tag.
     *
     * For static tracked properties, this is a single DirtyableTag. For computed
     * properties, it is a combinator of the property's DirtyableTag as well as
     * all of its dependencies' tags.
     */
    tagFor(key) {
        let tag = this.tags[key];
        if (tag) {
            return tag;
        }
        let dependencies;
        if (dependencies = this.trackedPropertyDependencies[key]) {
            return this.tags[key] = combinatorForComputedProperties(this, key, dependencies);
        }
        return this.tags[key] = DirtyableTag.create();
    }
    /**
     * The tag used internally to invalidate when a tracked property is set. For
     * static properties, this is the same DirtyableTag returned from `tagFor`.
     * For computed properties, it is the DirtyableTag used as one of the tags in
     * the tag combinator of the CP and its dependencies.
    */
    dirtyableTagFor(key) {
        let dependencies = this.trackedPropertyDependencies[key];
        let tag;
        if (dependencies) {
            // The key is for a computed property.
            tag = this.computedPropertyTags[key];
            if (tag) {
                return tag;
            }
            return this.computedPropertyTags[key] = DirtyableTag.create();
        } else {
            // The key is for a static property.
            tag = this.tags[key];
            if (tag) {
                return tag;
            }
            return this.tags[key] = DirtyableTag.create();
        }
    }
}
function combinatorForComputedProperties(meta, key, dependencies) {
    // Start off with the tag for the CP's own dirty state.
    let tags = [meta.dirtyableTagFor(key)];
    // Next, add in all of the tags for its dependencies.
    if (dependencies && dependencies.length) {
        for (let i = 0; i < dependencies.length; i++) {
            tags.push(meta.tagFor(dependencies[i]));
        }
    }
    // Return a combinator across the CP's tags and its dependencies' tags.
    return combine(tags);
}
let META = Symbol("ember-object");
function metaFor$1(obj) {
    let meta = obj[META];
    if (meta && hasOwnProperty$1(obj, META)) {
        return meta;
    }
    return obj[META] = new Meta$2(meta);
}
let hOP = Object.prototype.hasOwnProperty;
function hasOwnProperty$1(obj, key) {
    return hOP.call(obj, key);
}
let propertyDidChange = function propertyDidChange() {};
function setPropertyDidChange(cb) {
    propertyDidChange = cb;
}
function hasTag(obj, key) {
    let meta = obj[META];
    if (!obj[META]) {
        return false;
    }
    if (!meta.trackedProperties[key]) {
        return false;
    }
    return true;
}
class UntrackedPropertyError extends Error {
    constructor(target, key, message) {
        super(message);
        this.target = target;
        this.key = key;
    }
    static for(obj, key) {
        return new UntrackedPropertyError(obj, key, `The property '${key}' on ${obj} was changed after being rendered. If you want to change a property used in a template after the component has rendered, mark the property as a tracked property with the @tracked decorator.`);
    }
}
function defaultErrorThrower(obj, key) {
    throw UntrackedPropertyError.for(obj, key);
}
function tagForProperty(obj, key, throwError = defaultErrorThrower) {
    if (typeof obj === "object" && obj) {
        if (true && !hasTag(obj, key)) {
            installDevModeErrorInterceptor(obj, key, throwError);
        }
        let meta = metaFor$1(obj);
        return meta.tagFor(key);
    } else {
        return CONSTANT_TAG;
    }
}
/**
 * In development mode only, we install an ad hoc setter on properties where a
 * tag is requested (i.e., it was used in a template) without being tracked. In
 * cases where the property is set, we raise an error.
 */
function installDevModeErrorInterceptor(obj, key, throwError) {
    let target = obj;
    let descriptor;
    // Find the descriptor for the current property. We may need to walk the
    // prototype chain to do so. If the property is undefined, we may never get a
    // descriptor here.
    let hasOwnDescriptor = true;
    while (target) {
        descriptor = Object.getOwnPropertyDescriptor(target, key);
        if (descriptor) {
            break;
        }
        hasOwnDescriptor = false;
        target = Object.getPrototypeOf(target);
    }
    // If possible, define a property descriptor that passes through the current
    // value on reads but throws an exception on writes.
    if (descriptor) {
        if (descriptor.configurable || !hasOwnDescriptor) {
            Object.defineProperty(obj, key, {
                configurable: descriptor.configurable,
                enumerable: descriptor.enumerable,
                get() {
                    if (descriptor.get) {
                        return descriptor.get.call(this);
                    } else {
                        return descriptor.value;
                    }
                },
                set() {
                    throwError(this, key);
                }
            });
        }
    } else {
        Object.defineProperty(obj, key, {
            set() {
                throwError(this, key);
            }
        });
    }
}

/**
 * The `Component` class defines an encapsulated UI element that is rendered to
 * the DOM. A component is made up of a template and, optionally, this component
 * object.
 *
 * ## Defining a Component
 *
 * To define a component, subclass `Component` and add your own properties,
 * methods and lifecycle hooks:
 *
 * ```ts
 * import Component from '@glimmer/component';
 *
 * export default class extends Component {
 * }
 * ```
 *
 * ## Lifecycle Hooks
 *
 * Lifecycle hooks allow you to respond to changes to a component, such as when
 * it gets created, rendered, updated or destroyed. To add a lifecycle hook to a
 * component, implement the hook as a method on your component subclass.
 *
 * For example, to be notified when Glimmer has rendered your component so you
 * can attach a legacy jQuery plugin, implement the `didInsertElement()` method:
 *
 * ```ts
 * import Component from '@glimmer/component';
 *
 * export default class extends Component {
 *   didInsertElement() {
 *     $(this.element).pickadate();
 *   }
 * }
 * ```
 *
 * ## Data for Templates
 *
 * `Component`s have two different kinds of data, or state, that can be
 * displayed in templates:
 *
 * 1. Arguments
 * 2. Properties
 *
 * Arguments are data that is passed in to a component from its parent
 * component. For example, if I have a `user-greeting` component, I can pass it
 * a name and greeting to use:
 *
 * ```hbs
 * <user-greeting @name="Ricardo" @greeting="Olá">
 * ```
 *
 * Inside my `user-greeting` template, I can access the `@name` and `@greeting`
 * arguments that I've been given:
 *
 * ```hbs
 * {{@greeting}}, {{@name}}!
 * ```
 *
 * Arguments are also available inside my component:
 *
 * ```ts
 * console.log(this.args.greeting); // prints "Olá"
 * ```
 *
 * Properties, on the other hand, are internal to the component and declared in
 * the class. You can use properties to store data that you want to show in the
 * template, or pass to another component as an argument.
 *
 * ```ts
 * import Component from '@glimmer/component';
 *
 * export default class extends Component {
 *   user = {
 *     name: 'Robbie'
 *   }
 * }
 * ```
 *
 * In the above example, we've defined a component with a `user` property that
 * contains an object with its own `name` property.
 *
 * We can render that property in our template:
 *
 * ```hbs
 * Hello, {{user.name}}!
 * ```
 *
 * We can also take that property and pass it as an argument to the
 * `user-greeting` component we defined above:
 *
 * ```hbs
 * <user-greeting @greeting="Hello" @name={{user.name}} />
 * ```
 *
 * ## Arguments vs. Properties
 *
 * Remember, arguments are data that was given to your component by its parent
 * component, and properties are data your component has defined for itself.
 *
 * You can tell the difference between arguments and properties in templates
 * because arguments always start with an `@` sign (think "A is for arguments"):
 *
 * ```hbs
 * {{@firstName}}
 * ```
 *
 * We know that `@firstName` came from the parent component, not the current
 * component, because it starts with `@` and is therefore an argument.
 *
 * On the other hand, if we see:
 *
 * ```hbs
 * {{name}}
 * ```
 *
 * We know that `name` is a property on the component. If we want to know where
 * the data is coming from, we can go look at our component class to find out.
 *
 * Inside the component itself, arguments always show up inside the component's
 * `args` property. For example, if `{{@firstName}}` is `Tom` in the template,
 * inside the component `this.args.firstName` would also be `Tom`.
 */
class Component {
  /**
   * Constructs a new component and assigns itself the passed properties. You
   * should not construct new components yourself. Instead, Glimmer will
   * instantiate new components automatically as it renders.
   *
   * @param options
   */
  constructor(options) {
    /**
     * The element corresponding to the top-level element of the component's template.
     * You should not try to access this property until after the component's `didInsertElement()`
     * lifecycle hook is called.
     */
    this.element = null;
    /**
     * Development-mode only name of the component, useful for debugging.
     */
    this.debugName = null;
    /** @private
     * Slot on the component to save Arguments object passed to the `args` setter.
     */
    this.__args__ = null;
    Object.assign(this, options);
  }
  /**
   * Named arguments passed to the component from its parent component.
   * They can be accessed in JavaScript via `this.args.argumentName` and in the template via `@argumentName`.
   *
   * Say you have the following component, which will have two `args`, `firstName` and `lastName`:
   *
   * ```hbs
   * <my-component @firstName="Arthur" @lastName="Dent" />
   * ```
   *
   * If you needed to calculate `fullName` by combining both of them, you would do:
   *
   * ```ts
   * didInsertElement() {
   *   console.log(`Hi, my full name is ${this.args.firstName} ${this.args.lastName}`);
   * }
   * ```
   *
   * While in the template you could do:
   *
   * ```hbs
   * <p>Welcome, {{@firstName}} {{@lastName}}!</p>
   * ```
   *
   */
  get args() {
    return this.__args__;
  }
  set args(args) {
    this.__args__ = args;
    metaFor$1(this).dirtyableTagFor("args").inner.dirty();
  }
  static create(injections) {
    return new this(injections);
  }
  /**
   * Called when the component has been inserted into the DOM.
   * Override this function to do any set up that requires an element in the document body.
   */
  didInsertElement() {}
  /**
   * Called when the component has updated and rerendered itself.
   * Called only during a rerender, not during an initial render.
   */
  didUpdate() {}
  /**
   * Called before the component has been removed from the DOM.
   */
  willDestroy() {}
  destroy() {
    this.willDestroy();
  }
  toString() {
    return `${this.debugName} component`;
  }
}

class ComponentDefinition$1 extends ComponentDefinition {
    constructor(name, manager, template, componentFactory) {
        super(name, manager, componentFactory);
        this.template = template;
        this.componentFactory = componentFactory;
    }
    toJSON() {
        return { GlimmerDebug: `<component-definition name="${this.name}">` };
    }
}

/**
 * The base PathReference.
 */
class ComponentPathReference {
    get(key) {
        return PropertyReference$1.create(this, key);
    }
}
class CachedReference$1 extends ComponentPathReference {
    constructor() {
        super(...arguments);
        this._lastRevision = null;
        this._lastValue = null;
    }
    value() {
        let tag = this.tag,
            _lastRevision = this._lastRevision,
            _lastValue = this._lastValue;

        if (!_lastRevision || !tag.validate(_lastRevision)) {
            _lastValue = this._lastValue = this.compute();
            this._lastRevision = tag.value();
        }
        return _lastValue;
    }
}
class RootReference$1 extends ConstReference {
    constructor() {
        super(...arguments);
        this.children = dict();
    }
    get(propertyKey) {
        let ref = this.children[propertyKey];
        if (!ref) {
            ref = this.children[propertyKey] = new RootPropertyReference(this.inner, propertyKey);
        }
        return ref;
    }
}
class PropertyReference$1 extends CachedReference$1 {
    static create(parentReference, propertyKey) {
        if (isConst(parentReference)) {
            return new RootPropertyReference(parentReference.value(), propertyKey);
        } else {
            return new NestedPropertyReference(parentReference, propertyKey);
        }
    }
    get(key) {
        return new NestedPropertyReference(this, key);
    }
}
function buildError(obj, key) {
    let message = `The '${key}' property on the ${obj} was changed after it had been rendered. Properties that change after being rendered must be tracked. Use the @tracked decorator to mark this as a tracked property.`;
    throw new UntrackedPropertyError(obj, key, message);
}
class RootPropertyReference extends PropertyReference$1 {
    constructor(parentValue, propertyKey) {
        super();
        this._parentValue = parentValue;
        this._propertyKey = propertyKey;
        this.tag = tagForProperty(parentValue, propertyKey, buildError);
    }
    compute() {
        return this._parentValue[this._propertyKey];
    }
}
class NestedPropertyReference extends PropertyReference$1 {
    constructor(parentReference, propertyKey) {
        super();
        let parentReferenceTag = parentReference.tag;
        let parentObjectTag = UpdatableTag.create(CONSTANT_TAG);
        this._parentReference = parentReference;
        this._parentObjectTag = parentObjectTag;
        this._propertyKey = propertyKey;
        this.tag = combine([parentReferenceTag, parentObjectTag]);
    }
    compute() {
        let _parentReference = this._parentReference,
            _parentObjectTag = this._parentObjectTag,
            _propertyKey = this._propertyKey;

        let parentValue = _parentReference.value();
        _parentObjectTag.inner.update(tagForProperty(parentValue, _propertyKey));
        if (typeof parentValue === "string" && _propertyKey === "length") {
            return parentValue.length;
        }
        if (typeof parentValue === "object" && parentValue) {
            return parentValue[_propertyKey];
        } else {
            return undefined;
        }
    }
}

class ComponentStateBucket {
    constructor(definition, args, owner) {
        let componentFactory = definition.componentFactory;
        let name = definition.name;
        this.args = args;
        let injections = {
            debugName: name,
            args: this.namedArgsSnapshot()
        };
        setOwner(injections, owner);
        this.component = componentFactory.create(injections);
    }
    get tag() {
        return this.args.tag;
    }
    namedArgsSnapshot() {
        return Object.freeze(this.args.named.value());
    }
}
class LayoutCompiler {
    constructor(name, template) {
        this.template = template;
        this.name = name;
    }
    compile(builder) {
        builder.fromLayout(this.name, this.template);
    }
}
class ComponentManager {
    static create(options) {
        return new ComponentManager(options);
    }
    constructor(options) {
        this.env = options.env;
    }
    prepareArgs(definition, args) {
        return null;
    }
    create(environment, definition, volatileArgs) {
        let owner = getOwner(this.env);
        return new ComponentStateBucket(definition, volatileArgs.capture(), owner);
    }
    createComponentDefinition(name, template, componentFactory) {
        if (!componentFactory) {
            componentFactory = {
                class: Component,
                create(injections) {
                    return this.class.create(injections);
                }
            };
        }
        return new ComponentDefinition$1(name, this, template, componentFactory);
    }
    layoutFor(definition, bucket, env) {
        let template = definition.template;
        return compileLayout(new LayoutCompiler(definition.name, template), this.env);
    }
    getSelf(bucket) {
        return new RootReference$1(bucket.component);
    }
    didCreateElement(bucket, element) {
        if (!bucket) {
            return;
        }
        bucket.component.element = element;
    }
    didRenderLayout(bucket, bounds) {}
    didCreate(bucket) {
        bucket && bucket.component.didInsertElement();
    }
    getTag({ tag }) {
        return tag;
    }
    update(bucket, scope) {}
    didUpdateLayout() {}
    didUpdate(bucket) {
        if (!bucket) {
            return;
        }
        // TODO: This should be moved to `didUpdate`, but there's currently a
        // Glimmer bug that causes it not to be called if the layout doesn't update.
        let component = bucket.component;

        component.args = bucket.namedArgsSnapshot();
        component.didUpdate();
    }
    getDestructor(bucket) {
        return bucket.component;
    }
}

class WebUi extends Component {}

var __ui_components_web_ui_template__ = { "id": "7lOqBimr", "block": "{\"symbols\":[],\"statements\":[[5,\"app-layout\",[],[[],[]],{\"statements\":[],\"parameters\":[]}],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "specifier": "template:/web-ui/components/web-ui" } };

var moduleMap = { 'template:/web-ui/components/app-layout': __ui_components_app_layout_template__, 'template:/web-ui/components/app-layout/top-nav': __ui_components_app_layout_top_nav_template__, 'component:/web-ui/components/web-ui': WebUi, 'template:/web-ui/components/web-ui': __ui_components_web_ui_template__ };

var resolverConfiguration = { "app": { "name": "web-ui", "rootName": "web-ui" }, "types": { "application": { "definitiveCollection": "main" }, "component": { "definitiveCollection": "components" }, "component-test": { "unresolvable": true }, "helper": { "definitiveCollection": "components" }, "helper-test": { "unresolvable": true }, "renderer": { "definitiveCollection": "main" }, "template": { "definitiveCollection": "components" } }, "collections": { "main": { "types": ["application", "renderer"] }, "components": { "group": "ui", "types": ["component", "component-test", "template", "helper", "helper-test"], "defaultType": "component", "privateCollections": ["utils"] }, "styles": { "group": "ui", "unresolvable": true }, "utils": { "unresolvable": true } } };

class App extends Application {
    constructor() {
        let moduleRegistry = new BasicRegistry(moduleMap);
        let resolver = new Resolver(resolverConfiguration, moduleRegistry);
        super({
            rootName: resolverConfiguration.app.rootName,
            resolver
        });
    }
}

function initializeCustomElements(app, customElementDefinitions) {
    customElementDefinitions.forEach(name => {
        initializeCustomElement(app, name);
    });
}
function initializeCustomElement(app, name) {
    function GlimmerElement() {
        return Reflect.construct(HTMLElement, [], GlimmerElement);
    }
    GlimmerElement.prototype = Object.create(HTMLElement.prototype, {
        constructor: { value: GlimmerElement },
        connectedCallback: {
            value: function connectedCallback() {
                let placeholder = document.createElement('span');
                let parent = this.parentNode;
                parent.insertBefore(placeholder, this);
                parent.removeChild(this);
                app.renderComponent(name, parent, placeholder);
                whenRendered(app, () => {
                    let customElement = this;
                    let glimmerElement = placeholder.previousElementSibling;
                    placeholder.remove();
                    assignAttributes(customElement, glimmerElement);
                });
            }
        }
    });
    window.customElements.define(name, GlimmerElement);
}
function assignAttributes(fromElement, toElement) {
    let attributes = fromElement.attributes;
    for (let i = 0; i < attributes.length; i++) {
        var _attributes$item = attributes.item(i);

        let name = _attributes$item.name,
            value = _attributes$item.value;

        toElement.setAttribute(name, value);
    }
}
function whenRendered(app, callback) {
    if (app['_rendering']) {
        setTimeout(whenRendered, 10, app, callback);
    } else {
        callback();
    }
}

const app = new App();
const containerElement = document.getElementById('app');
setPropertyDidChange(() => {
    app.scheduleRerender();
});
app.registerInitializer({
    initialize(registry) {
        registry.register(`component-manager:/${app.rootName}/component-managers/main`, ComponentManager);
    }
});
app.renderComponent('web-ui', containerElement, null);
app.boot();
initializeCustomElements(app, ['web-ui']);

})));

//# sourceMappingURL=app.js.map
