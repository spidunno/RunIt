declare type ClassDecorator = <TFunction extends Function>(target: TFunction) => TFunction | void;
declare type PropertyDecorator = (target: Object, propertyKey: string | symbol) => void;
declare type MethodDecorator = <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;
declare type ParameterDecorator = (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => void;
/**
 * The decorator context types provided to class element decorators.
 */
type ClassMemberDecoratorContext =
    | ClassMethodDecoratorContext
    | ClassGetterDecoratorContext
    | ClassSetterDecoratorContext
    | ClassFieldDecoratorContext
    | ClassAccessorDecoratorContext;

/**
 * The decorator context types provided to any decorator.
 */
type DecoratorContext =
    | ClassDecoratorContext
    | ClassMemberDecoratorContext;

type DecoratorMetadataObject = Record<PropertyKey, unknown> & object;

type DecoratorMetadata = typeof globalThis extends { Symbol: { readonly metadata: symbol; }; } ? DecoratorMetadataObject : DecoratorMetadataObject | undefined;

/**
 * Context provided to a class decorator.
 * @template Class The type of the decorated class associated with this context.
 */
interface ClassDecoratorContext<
    Class extends abstract new (...args: any) => any = abstract new (...args: any) => any,
> {
    /** The kind of element that was decorated. */
    readonly kind: "class";

    /** The name of the decorated class. */
    readonly name: string | undefined;

    /**
     * Adds a callback to be invoked after the class definition has been finalized.
     *
     * @example
     * ```ts
     * function customElement(name: string): ClassDecoratorFunction {
     *   return (target, context) => {
     *     context.addInitializer(function () {
     *       customElements.define(name, this);
     *     });
     *   }
     * }
     *
     * @customElement("my-element")
     * class MyElement {}
     * ```
     */
    addInitializer(initializer: (this: Class) => void): void;

    readonly metadata: DecoratorMetadata;
}

/**
 * Context provided to a class method decorator.
 * @template This The type on which the class element will be defined. For a static class element, this will be
 * the type of the constructor. For a non-static class element, this will be the type of the instance.
 * @template Value The type of the decorated class method.
 */
interface ClassMethodDecoratorContext<
    This = unknown,
    Value extends (this: This, ...args: any) => any = (this: This, ...args: any) => any,
> {
    /** The kind of class element that was decorated. */
    readonly kind: "method";

    /** The name of the decorated class element. */
    readonly name: string | symbol;

    /** A value indicating whether the class element is a static (`true`) or instance (`false`) element. */
    readonly static: boolean;

    /** A value indicating whether the class element has a private name. */
    readonly private: boolean;

    /** An object that can be used to access the current value of the class element at runtime. */
    readonly access: {
        /**
         * Determines whether an object has a property with the same name as the decorated element.
         */
        has(object: This): boolean;
        /**
         * Gets the current value of the method from the provided object.
         *
         * @example
         * let fn = context.access.get(instance);
         */
        get(object: This): Value;
    };

    /**
     * Adds a callback to be invoked either before static initializers are run (when
     * decorating a `static` element), or before instance initializers are run (when
     * decorating a non-`static` element).
     *
     * @example
     * ```ts
     * const bound: ClassMethodDecoratorFunction = (value, context) {
     *   if (context.private) throw new TypeError("Not supported on private methods.");
     *   context.addInitializer(function () {
     *     this[context.name] = this[context.name].bind(this);
     *   });
     * }
     *
     * class C {
     *   message = "Hello";
     *
     *   @bound
     *   m() {
     *     console.log(this.message);
     *   }
     * }
     * ```
     */
    addInitializer(initializer: (this: This) => void): void;

    readonly metadata: DecoratorMetadata;
}

/**
 * Context provided to a class getter decorator.
 * @template This The type on which the class element will be defined. For a static class element, this will be
 * the type of the constructor. For a non-static class element, this will be the type of the instance.
 * @template Value The property type of the decorated class getter.
 */
interface ClassGetterDecoratorContext<
    This = unknown,
    Value = unknown,
> {
    /** The kind of class element that was decorated. */
    readonly kind: "getter";

    /** The name of the decorated class element. */
    readonly name: string | symbol;

    /** A value indicating whether the class element is a static (`true`) or instance (`false`) element. */
    readonly static: boolean;

    /** A value indicating whether the class element has a private name. */
    readonly private: boolean;

    /** An object that can be used to access the current value of the class element at runtime. */
    readonly access: {
        /**
         * Determines whether an object has a property with the same name as the decorated element.
         */
        has(object: This): boolean;
        /**
         * Invokes the getter on the provided object.
         *
         * @example
         * let value = context.access.get(instance);
         */
        get(object: This): Value;
    };

    /**
     * Adds a callback to be invoked either before static initializers are run (when
     * decorating a `static` element), or before instance initializers are run (when
     * decorating a non-`static` element).
     */
    addInitializer(initializer: (this: This) => void): void;

    readonly metadata: DecoratorMetadata;
}

/**
 * Context provided to a class setter decorator.
 * @template This The type on which the class element will be defined. For a static class element, this will be
 * the type of the constructor. For a non-static class element, this will be the type of the instance.
 * @template Value The type of the decorated class setter.
 */
interface ClassSetterDecoratorContext<
    This = unknown,
    Value = unknown,
> {
    /** The kind of class element that was decorated. */
    readonly kind: "setter";

    /** The name of the decorated class element. */
    readonly name: string | symbol;

    /** A value indicating whether the class element is a static (`true`) or instance (`false`) element. */
    readonly static: boolean;

    /** A value indicating whether the class element has a private name. */
    readonly private: boolean;

    /** An object that can be used to access the current value of the class element at runtime. */
    readonly access: {
        /**
         * Determines whether an object has a property with the same name as the decorated element.
         */
        has(object: This): boolean;
        /**
         * Invokes the setter on the provided object.
         *
         * @example
         * context.access.set(instance, value);
         */
        set(object: This, value: Value): void;
    };

    /**
     * Adds a callback to be invoked either before static initializers are run (when
     * decorating a `static` element), or before instance initializers are run (when
     * decorating a non-`static` element).
     */
    addInitializer(initializer: (this: This) => void): void;

    readonly metadata: DecoratorMetadata;
}

/**
 * Context provided to a class `accessor` field decorator.
 * @template This The type on which the class element will be defined. For a static class element, this will be
 * the type of the constructor. For a non-static class element, this will be the type of the instance.
 * @template Value The type of decorated class field.
 */
interface ClassAccessorDecoratorContext<
    This = unknown,
    Value = unknown,
> {
    /** The kind of class element that was decorated. */
    readonly kind: "accessor";

    /** The name of the decorated class element. */
    readonly name: string | symbol;

    /** A value indicating whether the class element is a static (`true`) or instance (`false`) element. */
    readonly static: boolean;

    /** A value indicating whether the class element has a private name. */
    readonly private: boolean;

    /** An object that can be used to access the current value of the class element at runtime. */
    readonly access: {
        /**
         * Determines whether an object has a property with the same name as the decorated element.
         */
        has(object: This): boolean;

        /**
         * Invokes the getter on the provided object.
         *
         * @example
         * let value = context.access.get(instance);
         */
        get(object: This): Value;

        /**
         * Invokes the setter on the provided object.
         *
         * @example
         * context.access.set(instance, value);
         */
        set(object: This, value: Value): void;
    };

    /**
     * Adds a callback to be invoked either before static initializers are run (when
     * decorating a `static` element), or before instance initializers are run (when
     * decorating a non-`static` element).
     */
    addInitializer(initializer: (this: This) => void): void;

    readonly metadata: DecoratorMetadata;
}

/**
 * Describes the target provided to class `accessor` field decorators.
 * @template This The `this` type to which the target applies.
 * @template Value The property type for the class `accessor` field.
 */
interface ClassAccessorDecoratorTarget<This, Value> {
    /**
     * Invokes the getter that was defined prior to decorator application.
     *
     * @example
     * let value = target.get.call(instance);
     */
    get(this: This): Value;

    /**
     * Invokes the setter that was defined prior to decorator application.
     *
     * @example
     * target.set.call(instance, value);
     */
    set(this: This, value: Value): void;
}

/**
 * Describes the allowed return value from a class `accessor` field decorator.
 * @template This The `this` type to which the target applies.
 * @template Value The property type for the class `accessor` field.
 */
interface ClassAccessorDecoratorResult<This, Value> {
    /**
     * An optional replacement getter function. If not provided, the existing getter function is used instead.
     */
    get?(this: This): Value;

    /**
     * An optional replacement setter function. If not provided, the existing setter function is used instead.
     */
    set?(this: This, value: Value): void;

    /**
     * An optional initializer mutator that is invoked when the underlying field initializer is evaluated.
     * @param value The incoming initializer value.
     * @returns The replacement initializer value.
     */
    init?(this: This, value: Value): Value;
}

/**
 * Context provided to a class field decorator.
 * @template This The type on which the class element will be defined. For a static class element, this will be
 * the type of the constructor. For a non-static class element, this will be the type of the instance.
 * @template Value The type of the decorated class field.
 */
interface ClassFieldDecoratorContext<
    This = unknown,
    Value = unknown,
> {
    /** The kind of class element that was decorated. */
    readonly kind: "field";

    /** The name of the decorated class element. */
    readonly name: string | symbol;

    /** A value indicating whether the class element is a static (`true`) or instance (`false`) element. */
    readonly static: boolean;

    /** A value indicating whether the class element has a private name. */
    readonly private: boolean;

    /** An object that can be used to access the current value of the class element at runtime. */
    readonly access: {
        /**
         * Determines whether an object has a property with the same name as the decorated element.
         */
        has(object: This): boolean;

        /**
         * Gets the value of the field on the provided object.
         */
        get(object: This): Value;

        /**
         * Sets the value of the field on the provided object.
         */
        set(object: This, value: Value): void;
    };

    /**
     * Adds a callback to be invoked either before static initializers are run (when
     * decorating a `static` element), or before instance initializers are run (when
     * decorating a non-`static` element).
     */
    addInitializer(initializer: (this: This) => void): void;

    readonly metadata: DecoratorMetadata;
}
/////////////////////////////
/// ECMAScript APIs
/////////////////////////////

declare var NaN: number;
declare var Infinity: number;

/**
 * Evaluates JavaScript code and executes it.
 * @param x A String value that contains valid JavaScript code.
 */
declare function eval(x: string): any;

/**
 * Converts a string to an integer.
 * @param string A string to convert into a number.
 * @param radix A value between 2 and 36 that specifies the base of the number in `string`.
 * If this argument is not supplied, strings with a prefix of '0x' are considered hexadecimal.
 * All other strings are considered decimal.
 */
declare function parseInt(string: string, radix?: number): number;

/**
 * Converts a string to a floating-point number.
 * @param string A string that contains a floating-point number.
 */
declare function parseFloat(string: string): number;

/**
 * Returns a Boolean value that indicates whether a value is the reserved value NaN (not a number).
 * @param number A numeric value.
 */
declare function isNaN(number: number): boolean;

/**
 * Determines whether a supplied number is finite.
 * @param number Any numeric value.
 */
declare function isFinite(number: number): boolean;

/**
 * Gets the unencoded version of an encoded Uniform Resource Identifier (URI).
 * @param encodedURI A value representing an encoded URI.
 */
declare function decodeURI(encodedURI: string): string;

/**
 * Gets the unencoded version of an encoded component of a Uniform Resource Identifier (URI).
 * @param encodedURIComponent A value representing an encoded URI component.
 */
declare function decodeURIComponent(encodedURIComponent: string): string;

/**
 * Encodes a text string as a valid Uniform Resource Identifier (URI)
 * @param uri A value representing an unencoded URI.
 */
declare function encodeURI(uri: string): string;

/**
 * Encodes a text string as a valid component of a Uniform Resource Identifier (URI).
 * @param uriComponent A value representing an unencoded URI component.
 */
declare function encodeURIComponent(uriComponent: string | number | boolean): string;

/**
 * Computes a new string in which certain characters have been replaced by a hexadecimal escape sequence.
 * @deprecated A legacy feature for browser compatibility
 * @param string A string value
 */
declare function escape(string: string): string;

/**
 * Computes a new string in which hexadecimal escape sequences are replaced with the character that it represents.
 * @deprecated A legacy feature for browser compatibility
 * @param string A string value
 */
declare function unescape(string: string): string;

interface Symbol {
    /** Returns a string representation of an object. */
    toString(): string;

    /** Returns the primitive value of the specified object. */
    valueOf(): symbol;
}

declare type PropertyKey = string | number | symbol;

interface PropertyDescriptor {
    configurable?: boolean;
    enumerable?: boolean;
    value?: any;
    writable?: boolean;
    get?(): any;
    set?(v: any): void;
}

interface PropertyDescriptorMap {
    [key: PropertyKey]: PropertyDescriptor;
}

interface Object {
    /** The initial value of Object.prototype.constructor is the standard built-in Object constructor. */
    constructor: Function;

    /** Returns a string representation of an object. */
    toString(): string;

    /** Returns a date converted to a string using the current locale. */
    toLocaleString(): string;

    /** Returns the primitive value of the specified object. */
    valueOf(): Object;

    /**
     * Determines whether an object has a property with the specified name.
     * @param v A property name.
     */
    hasOwnProperty(v: PropertyKey): boolean;

    /**
     * Determines whether an object exists in another object's prototype chain.
     * @param v Another object whose prototype chain is to be checked.
     */
    isPrototypeOf(v: Object): boolean;

    /**
     * Determines whether a specified property is enumerable.
     * @param v A property name.
     */
    propertyIsEnumerable(v: PropertyKey): boolean;
}

interface ObjectConstructor {
    new (value?: any): Object;
    (): any;
    (value: any): any;

    /** A reference to the prototype for a class of objects. */
    readonly prototype: Object;

    /**
     * Returns the prototype of an object.
     * @param o The object that references the prototype.
     */
    getPrototypeOf(o: any): any;

    /**
     * Gets the own property descriptor of the specified object.
     * An own property descriptor is one that is defined directly on the object and is not inherited from the object's prototype.
     * @param o Object that contains the property.
     * @param p Name of the property.
     */
    getOwnPropertyDescriptor(o: any, p: PropertyKey): PropertyDescriptor | undefined;

    /**
     * Returns the names of the own properties of an object. The own properties of an object are those that are defined directly
     * on that object, and are not inherited from the object's prototype. The properties of an object include both fields (objects) and functions.
     * @param o Object that contains the own properties.
     */
    getOwnPropertyNames(o: any): string[];

    /**
     * Creates an object that has the specified prototype or that has null prototype.
     * @param o Object to use as a prototype. May be null.
     */
    create(o: object | null): any;

    /**
     * Creates an object that has the specified prototype, and that optionally contains specified properties.
     * @param o Object to use as a prototype. May be null
     * @param properties JavaScript object that contains one or more property descriptors.
     */
    create(o: object | null, properties: PropertyDescriptorMap & ThisType<any>): any;

    /**
     * Adds a property to an object, or modifies attributes of an existing property.
     * @param o Object on which to add or modify the property. This can be a native JavaScript object (that is, a user-defined object or a built in object) or a DOM object.
     * @param p The property name.
     * @param attributes Descriptor for the property. It can be for a data property or an accessor property.
     */
    defineProperty<T>(o: T, p: PropertyKey, attributes: PropertyDescriptor & ThisType<any>): T;

    /**
     * Adds one or more properties to an object, and/or modifies attributes of existing properties.
     * @param o Object on which to add or modify the properties. This can be a native JavaScript object or a DOM object.
     * @param properties JavaScript object that contains one or more descriptor objects. Each descriptor object describes a data property or an accessor property.
     */
    defineProperties<T>(o: T, properties: PropertyDescriptorMap & ThisType<any>): T;

    /**
     * Prevents the modification of attributes of existing properties, and prevents the addition of new properties.
     * @param o Object on which to lock the attributes.
     */
    seal<T>(o: T): T;

    /**
     * Prevents the modification of existing property attributes and values, and prevents the addition of new properties.
     * @param f Object on which to lock the attributes.
     */
    freeze<T extends Function>(f: T): T;

    /**
     * Prevents the modification of existing property attributes and values, and prevents the addition of new properties.
     * @param o Object on which to lock the attributes.
     */
    freeze<T extends { [idx: string]: U | null | undefined | object; }, U extends string | bigint | number | boolean | symbol>(o: T): Readonly<T>;

    /**
     * Prevents the modification of existing property attributes and values, and prevents the addition of new properties.
     * @param o Object on which to lock the attributes.
     */
    freeze<T>(o: T): Readonly<T>;

    /**
     * Prevents the addition of new properties to an object.
     * @param o Object to make non-extensible.
     */
    preventExtensions<T>(o: T): T;

    /**
     * Returns true if existing property attributes cannot be modified in an object and new properties cannot be added to the object.
     * @param o Object to test.
     */
    isSealed(o: any): boolean;

    /**
     * Returns true if existing property attributes and values cannot be modified in an object, and new properties cannot be added to the object.
     * @param o Object to test.
     */
    isFrozen(o: any): boolean;

    /**
     * Returns a value that indicates whether new properties can be added to an object.
     * @param o Object to test.
     */
    isExtensible(o: any): boolean;

    /**
     * Returns the names of the enumerable string properties and methods of an object.
     * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
     */
    keys(o: object): string[];
}

/**
 * Provides functionality common to all JavaScript objects.
 */
declare var Object: ObjectConstructor;

/**
 * Creates a new function.
 */
interface Function {
    /**
     * Calls the function, substituting the specified object for the this value of the function, and the specified array for the arguments of the function.
     * @param thisArg The object to be used as the this object.
     * @param argArray A set of arguments to be passed to the function.
     */
    apply(this: Function, thisArg: any, argArray?: any): any;

    /**
     * Calls a method of an object, substituting another object for the current object.
     * @param thisArg The object to be used as the current object.
     * @param argArray A list of arguments to be passed to the method.
     */
    call(this: Function, thisArg: any, ...argArray: any[]): any;

    /**
     * For a given function, creates a bound function that has the same body as the original function.
     * The this object of the bound function is associated with the specified object, and has the specified initial parameters.
     * @param thisArg An object to which the this keyword can refer inside the new function.
     * @param argArray A list of arguments to be passed to the new function.
     */
    bind(this: Function, thisArg: any, ...argArray: any[]): any;

    /** Returns a string representation of a function. */
    toString(): string;

    prototype: any;
    readonly length: number;

    // Non-standard extensions
    arguments: any;
    caller: Function;
}

interface FunctionConstructor {
    /**
     * Creates a new function.
     * @param args A list of arguments the function accepts.
     */
    new (...args: string[]): Function;
    (...args: string[]): Function;
    readonly prototype: Function;
}

declare var Function: FunctionConstructor;

/**
 * Extracts the type of the 'this' parameter of a function type, or 'unknown' if the function type has no 'this' parameter.
 */
type ThisParameterType<T> = T extends (this: infer U, ...args: never) => any ? U : unknown;

/**
 * Removes the 'this' parameter from a function type.
 */
type OmitThisParameter<T> = unknown extends ThisParameterType<T> ? T : T extends (...args: infer A) => infer R ? (...args: A) => R : T;

interface CallableFunction extends Function {
    /**
     * Calls the function with the specified object as the this value and the elements of specified array as the arguments.
     * @param thisArg The object to be used as the this object.
     */
    apply<T, R>(this: (this: T) => R, thisArg: T): R;

    /**
     * Calls the function with the specified object as the this value and the elements of specified array as the arguments.
     * @param thisArg The object to be used as the this object.
     * @param args An array of argument values to be passed to the function.
     */
    apply<T, A extends any[], R>(this: (this: T, ...args: A) => R, thisArg: T, args: A): R;

    /**
     * Calls the function with the specified object as the this value and the specified rest arguments as the arguments.
     * @param thisArg The object to be used as the this object.
     * @param args Argument values to be passed to the function.
     */
    call<T, A extends any[], R>(this: (this: T, ...args: A) => R, thisArg: T, ...args: A): R;

    /**
     * For a given function, creates a bound function that has the same body as the original function.
     * The this object of the bound function is associated with the specified object, and has the specified initial parameters.
     * @param thisArg The object to be used as the this object.
     */
    bind<T>(this: T, thisArg: ThisParameterType<T>): OmitThisParameter<T>;

    /**
     * For a given function, creates a bound function that has the same body as the original function.
     * The this object of the bound function is associated with the specified object, and has the specified initial parameters.
     * @param thisArg The object to be used as the this object.
     * @param args Arguments to bind to the parameters of the function.
     */
    bind<T, A extends any[], B extends any[], R>(this: (this: T, ...args: [...A, ...B]) => R, thisArg: T, ...args: A): (...args: B) => R;
}

interface NewableFunction extends Function {
    /**
     * Calls the function with the specified object as the this value and the elements of specified array as the arguments.
     * @param thisArg The object to be used as the this object.
     */
    apply<T>(this: new () => T, thisArg: T): void;
    /**
     * Calls the function with the specified object as the this value and the elements of specified array as the arguments.
     * @param thisArg The object to be used as the this object.
     * @param args An array of argument values to be passed to the function.
     */
    apply<T, A extends any[]>(this: new (...args: A) => T, thisArg: T, args: A): void;

    /**
     * Calls the function with the specified object as the this value and the specified rest arguments as the arguments.
     * @param thisArg The object to be used as the this object.
     * @param args Argument values to be passed to the function.
     */
    call<T, A extends any[]>(this: new (...args: A) => T, thisArg: T, ...args: A): void;

    /**
     * For a given function, creates a bound function that has the same body as the original function.
     * The this object of the bound function is associated with the specified object, and has the specified initial parameters.
     * @param thisArg The object to be used as the this object.
     */
    bind<T>(this: T, thisArg: any): T;

    /**
     * For a given function, creates a bound function that has the same body as the original function.
     * The this object of the bound function is associated with the specified object, and has the specified initial parameters.
     * @param thisArg The object to be used as the this object.
     * @param args Arguments to bind to the parameters of the function.
     */
    bind<A extends any[], B extends any[], R>(this: new (...args: [...A, ...B]) => R, thisArg: any, ...args: A): new (...args: B) => R;
}

interface IArguments {
    [index: number]: any;
    length: number;
    callee: Function;
}

interface String {
    /** Returns a string representation of a string. */
    toString(): string;

    /**
     * Returns the character at the specified index.
     * @param pos The zero-based index of the desired character.
     */
    charAt(pos: number): string;

    /**
     * Returns the Unicode value of the character at the specified location.
     * @param index The zero-based index of the desired character. If there is no character at the specified index, NaN is returned.
     */
    charCodeAt(index: number): number;

    /**
     * Returns a string that contains the concatenation of two or more strings.
     * @param strings The strings to append to the end of the string.
     */
    concat(...strings: string[]): string;

    /**
     * Returns the position of the first occurrence of a substring.
     * @param searchString The substring to search for in the string
     * @param position The index at which to begin searching the String object. If omitted, search starts at the beginning of the string.
     */
    indexOf(searchString: string, position?: number): number;

    /**
     * Returns the last occurrence of a substring in the string.
     * @param searchString The substring to search for.
     * @param position The index at which to begin searching. If omitted, the search begins at the end of the string.
     */
    lastIndexOf(searchString: string, position?: number): number;

    /**
     * Determines whether two strings are equivalent in the current locale.
     * @param that String to compare to target string
     */
    localeCompare(that: string): number;

    /**
     * Matches a string with a regular expression, and returns an array containing the results of that search.
     * @param regexp A variable name or string literal containing the regular expression pattern and flags.
     */
    match(regexp: string | RegExp): RegExpMatchArray | null;

    /**
     * Replaces text in a string, using a regular expression or search string.
     * @param searchValue A string or regular expression to search for.
     * @param replaceValue A string containing the text to replace. When the {@linkcode searchValue} is a `RegExp`, all matches are replaced if the `g` flag is set (or only those matches at the beginning, if the `y` flag is also present). Otherwise, only the first match of {@linkcode searchValue} is replaced.
     */
    replace(searchValue: string | RegExp, replaceValue: string): string;

    /**
     * Replaces text in a string, using a regular expression or search string.
     * @param searchValue A string to search for.
     * @param replacer A function that returns the replacement text.
     */
    replace(searchValue: string | RegExp, replacer: (substring: string, ...args: any[]) => string): string;

    /**
     * Finds the first substring match in a regular expression search.
     * @param regexp The regular expression pattern and applicable flags.
     */
    search(regexp: string | RegExp): number;

    /**
     * Returns a section of a string.
     * @param start The index to the beginning of the specified portion of stringObj.
     * @param end The index to the end of the specified portion of stringObj. The substring includes the characters up to, but not including, the character indicated by end.
     * If this value is not specified, the substring continues to the end of stringObj.
     */
    slice(start?: number, end?: number): string;

    /**
     * Split a string into substrings using the specified separator and return them as an array.
     * @param separator A string that identifies character or characters to use in separating the string. If omitted, a single-element array containing the entire string is returned.
     * @param limit A value used to limit the number of elements returned in the array.
     */
    split(separator: string | RegExp, limit?: number): string[];

    /**
     * Returns the substring at the specified location within a String object.
     * @param start The zero-based index number indicating the beginning of the substring.
     * @param end Zero-based index number indicating the end of the substring. The substring includes the characters up to, but not including, the character indicated by end.
     * If end is omitted, the characters from start through the end of the original string are returned.
     */
    substring(start: number, end?: number): string;

    /** Converts all the alphabetic characters in a string to lowercase. */
    toLowerCase(): string;

    /** Converts all alphabetic characters to lowercase, taking into account the host environment's current locale. */
    toLocaleLowerCase(locales?: string | string[]): string;

    /** Converts all the alphabetic characters in a string to uppercase. */
    toUpperCase(): string;

    /** Returns a string where all alphabetic characters have been converted to uppercase, taking into account the host environment's current locale. */
    toLocaleUpperCase(locales?: string | string[]): string;

    /** Removes the leading and trailing white space and line terminator characters from a string. */
    trim(): string;

    /** Returns the length of a String object. */
    readonly length: number;

    // IE extensions
    /**
     * Gets a substring beginning at the specified location and having the specified length.
     * @deprecated A legacy feature for browser compatibility
     * @param from The starting position of the desired substring. The index of the first character in the string is zero.
     * @param length The number of characters to include in the returned substring.
     */
    substr(from: number, length?: number): string;

    /** Returns the primitive value of the specified object. */
    valueOf(): string;

    readonly [index: number]: string;
}

interface StringConstructor {
    new (value?: any): String;
    (value?: any): string;
    readonly prototype: String;
    fromCharCode(...codes: number[]): string;
}

/**
 * Allows manipulation and formatting of text strings and determination and location of substrings within strings.
 */
declare var String: StringConstructor;

interface Boolean {
    /** Returns the primitive value of the specified object. */
    valueOf(): boolean;
}

interface BooleanConstructor {
    new (value?: any): Boolean;
    <T>(value?: T): boolean;
    readonly prototype: Boolean;
}

declare var Boolean: BooleanConstructor;

interface Number {
    /**
     * Returns a string representation of an object.
     * @param radix Specifies a radix for converting numeric values to strings. This value is only used for numbers.
     */
    toString(radix?: number): string;

    /**
     * Returns a string representing a number in fixed-point notation.
     * @param fractionDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
     */
    toFixed(fractionDigits?: number): string;

    /**
     * Returns a string containing a number represented in exponential notation.
     * @param fractionDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
     */
    toExponential(fractionDigits?: number): string;

    /**
     * Returns a string containing a number represented either in exponential or fixed-point notation with a specified number of digits.
     * @param precision Number of significant digits. Must be in the range 1 - 21, inclusive.
     */
    toPrecision(precision?: number): string;

    /** Returns the primitive value of the specified object. */
    valueOf(): number;
}

interface NumberConstructor {
    new (value?: any): Number;
    (value?: any): number;
    readonly prototype: Number;

    /** The largest number that can be represented in JavaScript. Equal to approximately 1.79E+308. */
    readonly MAX_VALUE: number;

    /** The closest number to zero that can be represented in JavaScript. Equal to approximately 5.00E-324. */
    readonly MIN_VALUE: number;

    /**
     * A value that is not a number.
     * In equality comparisons, NaN does not equal any value, including itself. To test whether a value is equivalent to NaN, use the isNaN function.
     */
    readonly NaN: number;

    /**
     * A value that is less than the largest negative number that can be represented in JavaScript.
     * JavaScript displays NEGATIVE_INFINITY values as -infinity.
     */
    readonly NEGATIVE_INFINITY: number;

    /**
     * A value greater than the largest number that can be represented in JavaScript.
     * JavaScript displays POSITIVE_INFINITY values as infinity.
     */
    readonly POSITIVE_INFINITY: number;
}

/** An object that represents a number of any kind. All JavaScript numbers are 64-bit floating-point numbers. */
declare var Number: NumberConstructor;

interface TemplateStringsArray extends ReadonlyArray<string> {
    readonly raw: readonly string[];
}

/**
 * The type of `import.meta`.
 *
 * If you need to declare that a given property exists on `import.meta`,
 * this type may be augmented via interface merging.
 */
interface ImportMeta {
}

/**
 * The type for the optional second argument to `import()`.
 *
 * If your host environment supports additional options, this type may be
 * augmented via interface merging.
 */
interface ImportCallOptions {
    /** @deprecated*/ assert?: ImportAssertions;
    with?: ImportAttributes;
}

/**
 * The type for the `assert` property of the optional second argument to `import()`.
 * @deprecated
 */
interface ImportAssertions {
    [key: string]: string;
}

/**
 * The type for the `with` property of the optional second argument to `import()`.
 */
interface ImportAttributes {
    [key: string]: string;
}

interface Math {
    /** The mathematical constant e. This is Euler's number, the base of natural logarithms. */
    readonly E: number;
    /** The natural logarithm of 10. */
    readonly LN10: number;
    /** The natural logarithm of 2. */
    readonly LN2: number;
    /** The base-2 logarithm of e. */
    readonly LOG2E: number;
    /** The base-10 logarithm of e. */
    readonly LOG10E: number;
    /** Pi. This is the ratio of the circumference of a circle to its diameter. */
    readonly PI: number;
    /** The square root of 0.5, or, equivalently, one divided by the square root of 2. */
    readonly SQRT1_2: number;
    /** The square root of 2. */
    readonly SQRT2: number;
    /**
     * Returns the absolute value of a number (the value without regard to whether it is positive or negative).
     * For example, the absolute value of -5 is the same as the absolute value of 5.
     * @param x A numeric expression for which the absolute value is needed.
     */
    abs(x: number): number;
    /**
     * Returns the arc cosine (or inverse cosine) of a number.
     * @param x A numeric expression.
     */
    acos(x: number): number;
    /**
     * Returns the arcsine of a number.
     * @param x A numeric expression.
     */
    asin(x: number): number;
    /**
     * Returns the arctangent of a number.
     * @param x A numeric expression for which the arctangent is needed.
     */
    atan(x: number): number;
    /**
     * Returns the angle (in radians) from the X axis to a point.
     * @param y A numeric expression representing the cartesian y-coordinate.
     * @param x A numeric expression representing the cartesian x-coordinate.
     */
    atan2(y: number, x: number): number;
    /**
     * Returns the smallest integer greater than or equal to its numeric argument.
     * @param x A numeric expression.
     */
    ceil(x: number): number;
    /**
     * Returns the cosine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    cos(x: number): number;
    /**
     * Returns e (the base of natural logarithms) raised to a power.
     * @param x A numeric expression representing the power of e.
     */
    exp(x: number): number;
    /**
     * Returns the greatest integer less than or equal to its numeric argument.
     * @param x A numeric expression.
     */
    floor(x: number): number;
    /**
     * Returns the natural logarithm (base e) of a number.
     * @param x A numeric expression.
     */
    log(x: number): number;
    /**
     * Returns the larger of a set of supplied numeric expressions.
     * @param values Numeric expressions to be evaluated.
     */
    max(...values: number[]): number;
    /**
     * Returns the smaller of a set of supplied numeric expressions.
     * @param values Numeric expressions to be evaluated.
     */
    min(...values: number[]): number;
    /**
     * Returns the value of a base expression taken to a specified power.
     * @param x The base value of the expression.
     * @param y The exponent value of the expression.
     */
    pow(x: number, y: number): number;
    /** Returns a pseudorandom number between 0 and 1. */
    random(): number;
    /**
     * Returns a supplied numeric expression rounded to the nearest integer.
     * @param x The value to be rounded to the nearest integer.
     */
    round(x: number): number;
    /**
     * Returns the sine of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    sin(x: number): number;
    /**
     * Returns the square root of a number.
     * @param x A numeric expression.
     */
    sqrt(x: number): number;
    /**
     * Returns the tangent of a number.
     * @param x A numeric expression that contains an angle measured in radians.
     */
    tan(x: number): number;
}
/** An intrinsic object that provides basic mathematics functionality and constants. */
declare var Math: Math;

/** Enables basic storage and retrieval of dates and times. */
interface Date {
    /** Returns a string representation of a date. The format of the string depends on the locale. */
    toString(): string;
    /** Returns a date as a string value. */
    toDateString(): string;
    /** Returns a time as a string value. */
    toTimeString(): string;
    /** Returns a value as a string value appropriate to the host environment's current locale. */
    toLocaleString(): string;
    /** Returns a date as a string value appropriate to the host environment's current locale. */
    toLocaleDateString(): string;
    /** Returns a time as a string value appropriate to the host environment's current locale. */
    toLocaleTimeString(): string;
    /** Returns the stored time value in milliseconds since midnight, January 1, 1970 UTC. */
    valueOf(): number;
    /** Returns the stored time value in milliseconds since midnight, January 1, 1970 UTC. */
    getTime(): number;
    /** Gets the year, using local time. */
    getFullYear(): number;
    /** Gets the year using Universal Coordinated Time (UTC). */
    getUTCFullYear(): number;
    /** Gets the month, using local time. */
    getMonth(): number;
    /** Gets the month of a Date object using Universal Coordinated Time (UTC). */
    getUTCMonth(): number;
    /** Gets the day-of-the-month, using local time. */
    getDate(): number;
    /** Gets the day-of-the-month, using Universal Coordinated Time (UTC). */
    getUTCDate(): number;
    /** Gets the day of the week, using local time. */
    getDay(): number;
    /** Gets the day of the week using Universal Coordinated Time (UTC). */
    getUTCDay(): number;
    /** Gets the hours in a date, using local time. */
    getHours(): number;
    /** Gets the hours value in a Date object using Universal Coordinated Time (UTC). */
    getUTCHours(): number;
    /** Gets the minutes of a Date object, using local time. */
    getMinutes(): number;
    /** Gets the minutes of a Date object using Universal Coordinated Time (UTC). */
    getUTCMinutes(): number;
    /** Gets the seconds of a Date object, using local time. */
    getSeconds(): number;
    /** Gets the seconds of a Date object using Universal Coordinated Time (UTC). */
    getUTCSeconds(): number;
    /** Gets the milliseconds of a Date, using local time. */
    getMilliseconds(): number;
    /** Gets the milliseconds of a Date object using Universal Coordinated Time (UTC). */
    getUTCMilliseconds(): number;
    /** Gets the difference in minutes between Universal Coordinated Time (UTC) and the time on the local computer. */
    getTimezoneOffset(): number;
    /**
     * Sets the date and time value in the Date object.
     * @param time A numeric value representing the number of elapsed milliseconds since midnight, January 1, 1970 GMT.
     */
    setTime(time: number): number;
    /**
     * Sets the milliseconds value in the Date object using local time.
     * @param ms A numeric value equal to the millisecond value.
     */
    setMilliseconds(ms: number): number;
    /**
     * Sets the milliseconds value in the Date object using Universal Coordinated Time (UTC).
     * @param ms A numeric value equal to the millisecond value.
     */
    setUTCMilliseconds(ms: number): number;

    /**
     * Sets the seconds value in the Date object using local time.
     * @param sec A numeric value equal to the seconds value.
     * @param ms A numeric value equal to the milliseconds value.
     */
    setSeconds(sec: number, ms?: number): number;
    /**
     * Sets the seconds value in the Date object using Universal Coordinated Time (UTC).
     * @param sec A numeric value equal to the seconds value.
     * @param ms A numeric value equal to the milliseconds value.
     */
    setUTCSeconds(sec: number, ms?: number): number;
    /**
     * Sets the minutes value in the Date object using local time.
     * @param min A numeric value equal to the minutes value.
     * @param sec A numeric value equal to the seconds value.
     * @param ms A numeric value equal to the milliseconds value.
     */
    setMinutes(min: number, sec?: number, ms?: number): number;
    /**
     * Sets the minutes value in the Date object using Universal Coordinated Time (UTC).
     * @param min A numeric value equal to the minutes value.
     * @param sec A numeric value equal to the seconds value.
     * @param ms A numeric value equal to the milliseconds value.
     */
    setUTCMinutes(min: number, sec?: number, ms?: number): number;
    /**
     * Sets the hour value in the Date object using local time.
     * @param hours A numeric value equal to the hours value.
     * @param min A numeric value equal to the minutes value.
     * @param sec A numeric value equal to the seconds value.
     * @param ms A numeric value equal to the milliseconds value.
     */
    setHours(hours: number, min?: number, sec?: number, ms?: number): number;
    /**
     * Sets the hours value in the Date object using Universal Coordinated Time (UTC).
     * @param hours A numeric value equal to the hours value.
     * @param min A numeric value equal to the minutes value.
     * @param sec A numeric value equal to the seconds value.
     * @param ms A numeric value equal to the milliseconds value.
     */
    setUTCHours(hours: number, min?: number, sec?: number, ms?: number): number;
    /**
     * Sets the numeric day-of-the-month value of the Date object using local time.
     * @param date A numeric value equal to the day of the month.
     */
    setDate(date: number): number;
    /**
     * Sets the numeric day of the month in the Date object using Universal Coordinated Time (UTC).
     * @param date A numeric value equal to the day of the month.
     */
    setUTCDate(date: number): number;
    /**
     * Sets the month value in the Date object using local time.
     * @param month A numeric value equal to the month. The value for January is 0, and other month values follow consecutively.
     * @param date A numeric value representing the day of the month. If this value is not supplied, the value from a call to the getDate method is used.
     */
    setMonth(month: number, date?: number): number;
    /**
     * Sets the month value in the Date object using Universal Coordinated Time (UTC).
     * @param month A numeric value equal to the month. The value for January is 0, and other month values follow consecutively.
     * @param date A numeric value representing the day of the month. If it is not supplied, the value from a call to the getUTCDate method is used.
     */
    setUTCMonth(month: number, date?: number): number;
    /**
     * Sets the year of the Date object using local time.
     * @param year A numeric value for the year.
     * @param month A zero-based numeric value for the month (0 for January, 11 for December). Must be specified if numDate is specified.
     * @param date A numeric value equal for the day of the month.
     */
    setFullYear(year: number, month?: number, date?: number): number;
    /**
     * Sets the year value in the Date object using Universal Coordinated Time (UTC).
     * @param year A numeric value equal to the year.
     * @param month A numeric value equal to the month. The value for January is 0, and other month values follow consecutively. Must be supplied if numDate is supplied.
     * @param date A numeric value equal to the day of the month.
     */
    setUTCFullYear(year: number, month?: number, date?: number): number;
    /** Returns a date converted to a string using Universal Coordinated Time (UTC). */
    toUTCString(): string;
    /** Returns a date as a string value in ISO format. */
    toISOString(): string;
    /** Used by the JSON.stringify method to enable the transformation of an object's data for JavaScript Object Notation (JSON) serialization. */
    toJSON(key?: any): string;
}

interface DateConstructor {
    new (): Date;
    new (value: number | string): Date;
    /**
     * Creates a new Date.
     * @param year The full year designation is required for cross-century date accuracy. If year is between 0 and 99 is used, then year is assumed to be 1900 + year.
     * @param monthIndex The month as a number between 0 and 11 (January to December).
     * @param date The date as a number between 1 and 31.
     * @param hours Must be supplied if minutes is supplied. A number from 0 to 23 (midnight to 11pm) that specifies the hour.
     * @param minutes Must be supplied if seconds is supplied. A number from 0 to 59 that specifies the minutes.
     * @param seconds Must be supplied if milliseconds is supplied. A number from 0 to 59 that specifies the seconds.
     * @param ms A number from 0 to 999 that specifies the milliseconds.
     */
    new (year: number, monthIndex: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): Date;
    (): string;
    readonly prototype: Date;
    /**
     * Parses a string containing a date, and returns the number of milliseconds between that date and midnight, January 1, 1970.
     * @param s A date string
     */
    parse(s: string): number;
    /**
     * Returns the number of milliseconds between midnight, January 1, 1970 Universal Coordinated Time (UTC) (or GMT) and the specified date.
     * @param year The full year designation is required for cross-century date accuracy. If year is between 0 and 99 is used, then year is assumed to be 1900 + year.
     * @param monthIndex The month as a number between 0 and 11 (January to December).
     * @param date The date as a number between 1 and 31.
     * @param hours Must be supplied if minutes is supplied. A number from 0 to 23 (midnight to 11pm) that specifies the hour.
     * @param minutes Must be supplied if seconds is supplied. A number from 0 to 59 that specifies the minutes.
     * @param seconds Must be supplied if milliseconds is supplied. A number from 0 to 59 that specifies the seconds.
     * @param ms A number from 0 to 999 that specifies the milliseconds.
     */
    UTC(year: number, monthIndex: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): number;
    /** Returns the number of milliseconds elapsed since midnight, January 1, 1970 Universal Coordinated Time (UTC). */
    now(): number;
}

declare var Date: DateConstructor;

interface RegExpMatchArray extends Array<string> {
    /**
     * The index of the search at which the result was found.
     */
    index?: number;
    /**
     * A copy of the search string.
     */
    input?: string;
    /**
     * The first match. This will always be present because `null` will be returned if there are no matches.
     */
    0: string;
}

interface RegExpExecArray extends Array<string> {
    /**
     * The index of the search at which the result was found.
     */
    index: number;
    /**
     * A copy of the search string.
     */
    input: string;
    /**
     * The first match. This will always be present because `null` will be returned if there are no matches.
     */
    0: string;
}

interface RegExp {
    /**
     * Executes a search on a string using a regular expression pattern, and returns an array containing the results of that search.
     * @param string The String object or string literal on which to perform the search.
     */
    exec(string: string): RegExpExecArray | null;

    /**
     * Returns a Boolean value that indicates whether or not a pattern exists in a searched string.
     * @param string String on which to perform the search.
     */
    test(string: string): boolean;

    /** Returns a copy of the text of the regular expression pattern. Read-only. The regExp argument is a Regular expression object. It can be a variable name or a literal. */
    readonly source: string;

    /** Returns a Boolean value indicating the state of the global flag (g) used with a regular expression. Default is false. Read-only. */
    readonly global: boolean;

    /** Returns a Boolean value indicating the state of the ignoreCase flag (i) used with a regular expression. Default is false. Read-only. */
    readonly ignoreCase: boolean;

    /** Returns a Boolean value indicating the state of the multiline flag (m) used with a regular expression. Default is false. Read-only. */
    readonly multiline: boolean;

    lastIndex: number;

    // Non-standard extensions
    /** @deprecated A legacy feature for browser compatibility */
    compile(pattern: string, flags?: string): this;
}

interface RegExpConstructor {
    new (pattern: RegExp | string): RegExp;
    new (pattern: string, flags?: string): RegExp;
    (pattern: RegExp | string): RegExp;
    (pattern: string, flags?: string): RegExp;
    readonly "prototype": RegExp;

    // Non-standard extensions
    /** @deprecated A legacy feature for browser compatibility */
    "$1": string;
    /** @deprecated A legacy feature for browser compatibility */
    "$2": string;
    /** @deprecated A legacy feature for browser compatibility */
    "$3": string;
    /** @deprecated A legacy feature for browser compatibility */
    "$4": string;
    /** @deprecated A legacy feature for browser compatibility */
    "$5": string;
    /** @deprecated A legacy feature for browser compatibility */
    "$6": string;
    /** @deprecated A legacy feature for browser compatibility */
    "$7": string;
    /** @deprecated A legacy feature for browser compatibility */
    "$8": string;
    /** @deprecated A legacy feature for browser compatibility */
    "$9": string;
    /** @deprecated A legacy feature for browser compatibility */
    "input": string;
    /** @deprecated A legacy feature for browser compatibility */
    "$_": string;
    /** @deprecated A legacy feature for browser compatibility */
    "lastMatch": string;
    /** @deprecated A legacy feature for browser compatibility */
    "$&": string;
    /** @deprecated A legacy feature for browser compatibility */
    "lastParen": string;
    /** @deprecated A legacy feature for browser compatibility */
    "$+": string;
    /** @deprecated A legacy feature for browser compatibility */
    "leftContext": string;
    /** @deprecated A legacy feature for browser compatibility */
    "$`": string;
    /** @deprecated A legacy feature for browser compatibility */
    "rightContext": string;
    /** @deprecated A legacy feature for browser compatibility */
    "$'": string;
}

declare var RegExp: RegExpConstructor;

interface Error {
    name: string;
    message: string;
    stack?: string;
}

interface ErrorConstructor {
    new (message?: string): Error;
    (message?: string): Error;
    readonly prototype: Error;
}

declare var Error: ErrorConstructor;

interface EvalError extends Error {
}

interface EvalErrorConstructor extends ErrorConstructor {
    new (message?: string): EvalError;
    (message?: string): EvalError;
    readonly prototype: EvalError;
}

declare var EvalError: EvalErrorConstructor;

interface RangeError extends Error {
}

interface RangeErrorConstructor extends ErrorConstructor {
    new (message?: string): RangeError;
    (message?: string): RangeError;
    readonly prototype: RangeError;
}

declare var RangeError: RangeErrorConstructor;

interface ReferenceError extends Error {
}

interface ReferenceErrorConstructor extends ErrorConstructor {
    new (message?: string): ReferenceError;
    (message?: string): ReferenceError;
    readonly prototype: ReferenceError;
}

declare var ReferenceError: ReferenceErrorConstructor;

interface SyntaxError extends Error {
}

interface SyntaxErrorConstructor extends ErrorConstructor {
    new (message?: string): SyntaxError;
    (message?: string): SyntaxError;
    readonly prototype: SyntaxError;
}

declare var SyntaxError: SyntaxErrorConstructor;

interface TypeError extends Error {
}

interface TypeErrorConstructor extends ErrorConstructor {
    new (message?: string): TypeError;
    (message?: string): TypeError;
    readonly prototype: TypeError;
}

declare var TypeError: TypeErrorConstructor;

interface URIError extends Error {
}

interface URIErrorConstructor extends ErrorConstructor {
    new (message?: string): URIError;
    (message?: string): URIError;
    readonly prototype: URIError;
}

declare var URIError: URIErrorConstructor;

interface JSON {
    /**
     * Converts a JavaScript Object Notation (JSON) string into an object.
     * @param text A valid JSON string.
     * @param reviver A function that transforms the results. This function is called for each member of the object.
     * If a member contains nested objects, the nested objects are transformed before the parent object is.
     */
    parse(text: string, reviver?: (this: any, key: string, value: any) => any): any;
    /**
     * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
     * @param value A JavaScript value, usually an object or array, to be converted.
     * @param replacer A function that transforms the results.
     * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
     */
    stringify(value: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number): string;
    /**
     * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
     * @param value A JavaScript value, usually an object or array, to be converted.
     * @param replacer An array of strings and numbers that acts as an approved list for selecting the object properties that will be stringified.
     * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
     */
    stringify(value: any, replacer?: (number | string)[] | null, space?: string | number): string;
}

/**
 * An intrinsic object that provides functions to convert JavaScript values to and from the JavaScript Object Notation (JSON) format.
 */
declare var JSON: JSON;

/////////////////////////////
/// ECMAScript Array API (specially handled by compiler)
/////////////////////////////

interface ReadonlyArray<T> {
    /**
     * Gets the length of the array. This is a number one higher than the highest element defined in an array.
     */
    readonly length: number;
    /**
     * Returns a string representation of an array.
     */
    toString(): string;
    /**
     * Returns a string representation of an array. The elements are converted to string using their toLocaleString methods.
     */
    toLocaleString(): string;
    /**
     * Combines two or more arrays.
     * @param items Additional items to add to the end of array1.
     */
    concat(...items: ConcatArray<T>[]): T[];
    /**
     * Combines two or more arrays.
     * @param items Additional items to add to the end of array1.
     */
    concat(...items: (T | ConcatArray<T>)[]): T[];
    /**
     * Adds all the elements of an array separated by the specified separator string.
     * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
     */
    join(separator?: string): string;
    /**
     * Returns a section of an array.
     * @param start The beginning of the specified portion of the array.
     * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
     */
    slice(start?: number, end?: number): T[];
    /**
     * Returns the index of the first occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
     */
    indexOf(searchElement: T, fromIndex?: number): number;
    /**
     * Returns the index of the last occurrence of a specified value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the array.
     */
    lastIndexOf(searchElement: T, fromIndex?: number): number;
    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param predicate A function that accepts up to three arguments. The every method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value false, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    every<S extends T>(predicate: (value: T, index: number, array: readonly T[]) => value is S, thisArg?: any): this is readonly S[];
    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param predicate A function that accepts up to three arguments. The every method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value false, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    every(predicate: (value: T, index: number, array: readonly T[]) => unknown, thisArg?: any): boolean;
    /**
     * Determines whether the specified callback function returns true for any element of an array.
     * @param predicate A function that accepts up to three arguments. The some method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value true, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    some(predicate: (value: T, index: number, array: readonly T[]) => unknown, thisArg?: any): boolean;
    /**
     * Performs the specified action for each element in an array.
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
     * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    forEach(callbackfn: (value: T, index: number, array: readonly T[]) => void, thisArg?: any): void;
    /**
     * Calls a defined callback function on each element of an array, and returns an array that contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    map<U>(callbackfn: (value: T, index: number, array: readonly T[]) => U, thisArg?: any): U[];
    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
     */
    filter<S extends T>(predicate: (value: T, index: number, array: readonly T[]) => value is S, thisArg?: any): S[];
    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
     */
    filter(predicate: (value: T, index: number, array: readonly T[]) => unknown, thisArg?: any): T[];
    /**
     * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
     */
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: readonly T[]) => T): T;
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: readonly T[]) => T, initialValue: T): T;
    /**
     * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
     */
    reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: readonly T[]) => U, initialValue: U): U;
    /**
     * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
     */
    reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: readonly T[]) => T): T;
    reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: readonly T[]) => T, initialValue: T): T;
    /**
     * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
     */
    reduceRight<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: readonly T[]) => U, initialValue: U): U;

    readonly [n: number]: T;
}

interface ConcatArray<T> {
    readonly length: number;
    readonly [n: number]: T;
    join(separator?: string): string;
    slice(start?: number, end?: number): T[];
}

interface Array<T> {
    /**
     * Gets or sets the length of the array. This is a number one higher than the highest index in the array.
     */
    length: number;
    /**
     * Returns a string representation of an array.
     */
    toString(): string;
    /**
     * Returns a string representation of an array. The elements are converted to string using their toLocaleString methods.
     */
    toLocaleString(): string;
    /**
     * Removes the last element from an array and returns it.
     * If the array is empty, undefined is returned and the array is not modified.
     */
    pop(): T | undefined;
    /**
     * Appends new elements to the end of an array, and returns the new length of the array.
     * @param items New elements to add to the array.
     */
    push(...items: T[]): number;
    /**
     * Combines two or more arrays.
     * This method returns a new array without modifying any existing arrays.
     * @param items Additional arrays and/or items to add to the end of the array.
     */
    concat(...items: ConcatArray<T>[]): T[];
    /**
     * Combines two or more arrays.
     * This method returns a new array without modifying any existing arrays.
     * @param items Additional arrays and/or items to add to the end of the array.
     */
    concat(...items: (T | ConcatArray<T>)[]): T[];
    /**
     * Adds all the elements of an array into a string, separated by the specified separator string.
     * @param separator A string used to separate one element of the array from the next in the resulting string. If omitted, the array elements are separated with a comma.
     */
    join(separator?: string): string;
    /**
     * Reverses the elements in an array in place.
     * This method mutates the array and returns a reference to the same array.
     */
    reverse(): T[];
    /**
     * Removes the first element from an array and returns it.
     * If the array is empty, undefined is returned and the array is not modified.
     */
    shift(): T | undefined;
    /**
     * Returns a copy of a section of an array.
     * For both start and end, a negative index can be used to indicate an offset from the end of the array.
     * For example, -2 refers to the second to last element of the array.
     * @param start The beginning index of the specified portion of the array.
     * If start is undefined, then the slice begins at index 0.
     * @param end The end index of the specified portion of the array. This is exclusive of the element at the index 'end'.
     * If end is undefined, then the slice extends to the end of the array.
     */
    slice(start?: number, end?: number): T[];
    /**
     * Sorts an array in place.
     * This method mutates the array and returns a reference to the same array.
     * @param compareFn Function used to determine the order of the elements. It is expected to return
     * a negative value if the first argument is less than the second argument, zero if they're equal, and a positive
     * value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
     * ```ts
     * [11,2,22,1].sort((a, b) => a - b)
     * ```
     */
    sort(compareFn?: (a: T, b: T) => number): this;
    /**
     * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
     * @param start The zero-based location in the array from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @returns An array containing the elements that were deleted.
     */
    splice(start: number, deleteCount?: number): T[];
    /**
     * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
     * @param start The zero-based location in the array from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @param items Elements to insert into the array in place of the deleted elements.
     * @returns An array containing the elements that were deleted.
     */
    splice(start: number, deleteCount: number, ...items: T[]): T[];
    /**
     * Inserts new elements at the start of an array, and returns the new length of the array.
     * @param items Elements to insert at the start of the array.
     */
    unshift(...items: T[]): number;
    /**
     * Returns the index of the first occurrence of a value in an array, or -1 if it is not present.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
     */
    indexOf(searchElement: T, fromIndex?: number): number;
    /**
     * Returns the index of the last occurrence of a specified value in an array, or -1 if it is not present.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin searching backward. If fromIndex is omitted, the search starts at the last index in the array.
     */
    lastIndexOf(searchElement: T, fromIndex?: number): number;
    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param predicate A function that accepts up to three arguments. The every method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value false, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    every<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): this is S[];
    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param predicate A function that accepts up to three arguments. The every method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value false, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    every(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): boolean;
    /**
     * Determines whether the specified callback function returns true for any element of an array.
     * @param predicate A function that accepts up to three arguments. The some method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value true, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    some(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): boolean;
    /**
     * Performs the specified action for each element in an array.
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
     * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void;
    /**
     * Calls a defined callback function on each element of an array, and returns an array that contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[];
    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
     */
    filter<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S[];
    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
     */
    filter(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T[];
    /**
     * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
     */
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T): T;
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T): T;
    /**
     * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
     */
    reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
    /**
     * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
     */
    reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T): T;
    reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T): T;
    /**
     * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
     */
    reduceRight<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;

    [n: number]: T;
}

interface ArrayConstructor {
    new (arrayLength?: number): any[];
    new <T>(arrayLength: number): T[];
    new <T>(...items: T[]): T[];
    (arrayLength?: number): any[];
    <T>(arrayLength: number): T[];
    <T>(...items: T[]): T[];
    isArray(arg: any): arg is any[];
    readonly prototype: any[];
}

declare var Array: ArrayConstructor;

interface TypedPropertyDescriptor<T> {
    enumerable?: boolean;
    configurable?: boolean;
    writable?: boolean;
    value?: T;
    get?: () => T;
    set?: (value: T) => void;
}

declare type PromiseConstructorLike = new <T>(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) => PromiseLike<T>;

interface PromiseLike<T> {
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseLike<TResult1 | TResult2>;
}

/**
 * Represents the completion of an asynchronous operation
 */
interface Promise<T> {
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;

    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
}

/**
 * Recursively unwraps the "awaited type" of a type. Non-promise "thenables" should resolve to `never`. This emulates the behavior of `await`.
 */
type Awaited<T> = T extends null | undefined ? T : // special case for `null | undefined` when not in `--strictNullChecks` mode
    T extends object & { then(onfulfilled: infer F, ...args: infer _): any; } ? // `await` only unwraps object types with a callable `then`. Non-object types are not unwrapped
        F extends ((value: infer V, ...args: infer _) => any) ? // if the argument to `then` is callable, extracts the first argument
            Awaited<V> : // recursively unwrap the value
        never : // the argument to `then` was not callable
    T; // non-object or non-thenable

interface ArrayLike<T> {
    readonly length: number;
    readonly [n: number]: T;
}

/**
 * Make all properties in T optional
 */
type Partial<T> = {
    [P in keyof T]?: T[P];
};

/**
 * Make all properties in T required
 */
type Required<T> = {
    [P in keyof T]-?: T[P];
};

/**
 * Make all properties in T readonly
 */
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};

/**
 * Construct a type with a set of properties K of type T
 */
type Record<K extends keyof any, T> = {
    [P in K]: T;
};

/**
 * Exclude from T those types that are assignable to U
 */
type Exclude<T, U> = T extends U ? never : T;

/**
 * Extract from T those types that are assignable to U
 */
type Extract<T, U> = T extends U ? T : never;

/**
 * Construct a type with the properties of T except for those in type K.
 */
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

/**
 * Exclude null and undefined from T
 */
type NonNullable<T> = T & {};

/**
 * Obtain the parameters of a function type in a tuple
 */
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

/**
 * Obtain the parameters of a constructor function type in a tuple
 */
type ConstructorParameters<T extends abstract new (...args: any) => any> = T extends abstract new (...args: infer P) => any ? P : never;

/**
 * Obtain the return type of a function type
 */
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

/**
 * Obtain the return type of a constructor function type
 */
type InstanceType<T extends abstract new (...args: any) => any> = T extends abstract new (...args: any) => infer R ? R : any;

/**
 * Convert string literal type to uppercase
 */
type Uppercase<S extends string> = intrinsic;

/**
 * Convert string literal type to lowercase
 */
type Lowercase<S extends string> = intrinsic;

/**
 * Convert first character of string literal type to uppercase
 */
type Capitalize<S extends string> = intrinsic;

/**
 * Convert first character of string literal type to lowercase
 */
type Uncapitalize<S extends string> = intrinsic;

/**
 * Marker for non-inference type position
 */
type NoInfer<T> = intrinsic;

/**
 * Marker for contextual 'this' type
 */
interface ThisType<T> {}

/**
 * Stores types to be used with WeakSet, WeakMap, WeakRef, and FinalizationRegistry
 */
interface WeakKeyTypes {
    object: object;
}

type WeakKey = WeakKeyTypes[keyof WeakKeyTypes];

/**
 * Represents a raw buffer of binary data, which is used to store data for the
 * different typed arrays. ArrayBuffers cannot be read from or written to directly,
 * but can be passed to a typed array or DataView Object to interpret the raw
 * buffer as needed.
 */
interface ArrayBuffer {
    /**
     * Read-only. The length of the ArrayBuffer (in bytes).
     */
    readonly byteLength: number;

    /**
     * Returns a section of an ArrayBuffer.
     */
    slice(begin: number, end?: number): ArrayBuffer;
}

/**
 * Allowed ArrayBuffer types for the buffer of an ArrayBufferView and related Typed Arrays.
 */
interface ArrayBufferTypes {
    ArrayBuffer: ArrayBuffer;
}
type ArrayBufferLike = ArrayBufferTypes[keyof ArrayBufferTypes];

interface ArrayBufferConstructor {
    readonly prototype: ArrayBuffer;
    new (byteLength: number): ArrayBuffer;
    isView(arg: any): arg is ArrayBufferView;
}
declare var ArrayBuffer: ArrayBufferConstructor;

interface ArrayBufferView {
    /**
     * The ArrayBuffer instance referenced by the array.
     */
    buffer: ArrayBufferLike;

    /**
     * The length in bytes of the array.
     */
    byteLength: number;

    /**
     * The offset in bytes of the array.
     */
    byteOffset: number;
}

interface DataView {
    readonly buffer: ArrayBuffer;
    readonly byteLength: number;
    readonly byteOffset: number;
    /**
     * Gets the Float32 value at the specified byte offset from the start of the view. There is
     * no alignment constraint; multi-byte values may be fetched from any offset.
     * @param byteOffset The place in the buffer at which the value should be retrieved.
     * @param littleEndian If false or undefined, a big-endian value should be read.
     */
    getFloat32(byteOffset: number, littleEndian?: boolean): number;

    /**
     * Gets the Float64 value at the specified byte offset from the start of the view. There is
     * no alignment constraint; multi-byte values may be fetched from any offset.
     * @param byteOffset The place in the buffer at which the value should be retrieved.
     * @param littleEndian If false or undefined, a big-endian value should be read.
     */
    getFloat64(byteOffset: number, littleEndian?: boolean): number;

    /**
     * Gets the Int8 value at the specified byte offset from the start of the view. There is
     * no alignment constraint; multi-byte values may be fetched from any offset.
     * @param byteOffset The place in the buffer at which the value should be retrieved.
     */
    getInt8(byteOffset: number): number;

    /**
     * Gets the Int16 value at the specified byte offset from the start of the view. There is
     * no alignment constraint; multi-byte values may be fetched from any offset.
     * @param byteOffset The place in the buffer at which the value should be retrieved.
     * @param littleEndian If false or undefined, a big-endian value should be read.
     */
    getInt16(byteOffset: number, littleEndian?: boolean): number;
    /**
     * Gets the Int32 value at the specified byte offset from the start of the view. There is
     * no alignment constraint; multi-byte values may be fetched from any offset.
     * @param byteOffset The place in the buffer at which the value should be retrieved.
     * @param littleEndian If false or undefined, a big-endian value should be read.
     */
    getInt32(byteOffset: number, littleEndian?: boolean): number;

    /**
     * Gets the Uint8 value at the specified byte offset from the start of the view. There is
     * no alignment constraint; multi-byte values may be fetched from any offset.
     * @param byteOffset The place in the buffer at which the value should be retrieved.
     */
    getUint8(byteOffset: number): number;

    /**
     * Gets the Uint16 value at the specified byte offset from the start of the view. There is
     * no alignment constraint; multi-byte values may be fetched from any offset.
     * @param byteOffset The place in the buffer at which the value should be retrieved.
     * @param littleEndian If false or undefined, a big-endian value should be read.
     */
    getUint16(byteOffset: number, littleEndian?: boolean): number;

    /**
     * Gets the Uint32 value at the specified byte offset from the start of the view. There is
     * no alignment constraint; multi-byte values may be fetched from any offset.
     * @param byteOffset The place in the buffer at which the value should be retrieved.
     * @param littleEndian If false or undefined, a big-endian value should be read.
     */
    getUint32(byteOffset: number, littleEndian?: boolean): number;

    /**
     * Stores an Float32 value at the specified byte offset from the start of the view.
     * @param byteOffset The place in the buffer at which the value should be set.
     * @param value The value to set.
     * @param littleEndian If false or undefined, a big-endian value should be written.
     */
    setFloat32(byteOffset: number, value: number, littleEndian?: boolean): void;

    /**
     * Stores an Float64 value at the specified byte offset from the start of the view.
     * @param byteOffset The place in the buffer at which the value should be set.
     * @param value The value to set.
     * @param littleEndian If false or undefined, a big-endian value should be written.
     */
    setFloat64(byteOffset: number, value: number, littleEndian?: boolean): void;

    /**
     * Stores an Int8 value at the specified byte offset from the start of the view.
     * @param byteOffset The place in the buffer at which the value should be set.
     * @param value The value to set.
     */
    setInt8(byteOffset: number, value: number): void;

    /**
     * Stores an Int16 value at the specified byte offset from the start of the view.
     * @param byteOffset The place in the buffer at which the value should be set.
     * @param value The value to set.
     * @param littleEndian If false or undefined, a big-endian value should be written.
     */
    setInt16(byteOffset: number, value: number, littleEndian?: boolean): void;

    /**
     * Stores an Int32 value at the specified byte offset from the start of the view.
     * @param byteOffset The place in the buffer at which the value should be set.
     * @param value The value to set.
     * @param littleEndian If false or undefined, a big-endian value should be written.
     */
    setInt32(byteOffset: number, value: number, littleEndian?: boolean): void;

    /**
     * Stores an Uint8 value at the specified byte offset from the start of the view.
     * @param byteOffset The place in the buffer at which the value should be set.
     * @param value The value to set.
     */
    setUint8(byteOffset: number, value: number): void;

    /**
     * Stores an Uint16 value at the specified byte offset from the start of the view.
     * @param byteOffset The place in the buffer at which the value should be set.
     * @param value The value to set.
     * @param littleEndian If false or undefined, a big-endian value should be written.
     */
    setUint16(byteOffset: number, value: number, littleEndian?: boolean): void;

    /**
     * Stores an Uint32 value at the specified byte offset from the start of the view.
     * @param byteOffset The place in the buffer at which the value should be set.
     * @param value The value to set.
     * @param littleEndian If false or undefined, a big-endian value should be written.
     */
    setUint32(byteOffset: number, value: number, littleEndian?: boolean): void;
}

interface DataViewConstructor {
    readonly prototype: DataView;
    new (buffer: ArrayBufferLike & { BYTES_PER_ELEMENT?: never; }, byteOffset?: number, byteLength?: number): DataView;
}
declare var DataView: DataViewConstructor;

/**
 * A typed array of 8-bit integer values. The contents are initialized to 0. If the requested
 * number of bytes could not be allocated an exception is raised.
 */
interface Int8Array {
    /**
     * The size in bytes of each element in the array.
     */
    readonly BYTES_PER_ELEMENT: number;

    /**
     * The ArrayBuffer instance referenced by the array.
     */
    readonly buffer: ArrayBufferLike;

    /**
     * The length in bytes of the array.
     */
    readonly byteLength: number;

    /**
     * The offset in bytes of the array.
     */
    readonly byteOffset: number;

    /**
     * Returns the this object after copying a section of the array identified by start and end
     * to the same array starting at position target
     * @param target If target is negative, it is treated as length+target where length is the
     * length of the array.
     * @param start If start is negative, it is treated as length+start. If end is negative, it
     * is treated as length+end.
     * @param end If not specified, length of the this object is used as its default value.
     */
    copyWithin(target: number, start: number, end?: number): this;

    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param predicate A function that accepts up to three arguments. The every method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value false, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    every(predicate: (value: number, index: number, array: Int8Array) => unknown, thisArg?: any): boolean;

    /**
     * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
     * @param value value to fill array section with
     * @param start index to start filling the array at. If start is negative, it is treated as
     * length+start where length is the length of the array.
     * @param end index to stop filling the array at. If end is negative, it is treated as
     * length+end.
     */
    fill(value: number, start?: number, end?: number): this;

    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls
     * the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    filter(predicate: (value: number, index: number, array: Int8Array) => any, thisArg?: any): Int8Array;

    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    find(predicate: (value: number, index: number, obj: Int8Array) => boolean, thisArg?: any): number | undefined;

    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    findIndex(predicate: (value: number, index: number, obj: Int8Array) => boolean, thisArg?: any): number;

    /**
     * Performs the specified action for each element in an array.
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the
     * callbackfn function one time for each element in the array.
     * @param thisArg  An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    forEach(callbackfn: (value: number, index: number, array: Int8Array) => void, thisArg?: any): void;

    /**
     * Returns the index of the first occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the
     *  search starts at index 0.
     */
    indexOf(searchElement: number, fromIndex?: number): number;

    /**
     * Adds all the elements of an array separated by the specified separator string.
     * @param separator A string used to separate one element of an array from the next in the
     * resulting String. If omitted, the array elements are separated with a comma.
     */
    join(separator?: string): string;

    /**
     * Returns the index of the last occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the
     * search starts at index 0.
     */
    lastIndexOf(searchElement: number, fromIndex?: number): number;

    /**
     * The length of the array.
     */
    readonly length: number;

    /**
     * Calls a defined callback function on each element of an array, and returns an array that
     * contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the
     * callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    map(callbackfn: (value: number, index: number, array: Int8Array) => number, thisArg?: any): Int8Array;

    /**
     * Calls the specified callback function for all the elements in an array. The return value of
     * the callback function is the accumulated result, and is provided as an argument in the next
     * call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
     * callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Int8Array) => number): number;
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Int8Array) => number, initialValue: number): number;

    /**
     * Calls the specified callback function for all the elements in an array. The return value of
     * the callback function is the accumulated result, and is provided as an argument in the next
     * call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
     * callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduce<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Int8Array) => U, initialValue: U): U;

    /**
     * Calls the specified callback function for all the elements in an array, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an
     * argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls
     * the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an
     * argument instead of an array value.
     */
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Int8Array) => number): number;
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Int8Array) => number, initialValue: number): number;

    /**
     * Calls the specified callback function for all the elements in an array, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an
     * argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls
     * the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduceRight<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Int8Array) => U, initialValue: U): U;

    /**
     * Reverses the elements in an Array.
     */
    reverse(): Int8Array;

    /**
     * Sets a value or an array of values.
     * @param array A typed or untyped array of values to set.
     * @param offset The index in the current array at which the values are to be written.
     */
    set(array: ArrayLike<number>, offset?: number): void;

    /**
     * Returns a section of an array.
     * @param start The beginning of the specified portion of the array.
     * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
     */
    slice(start?: number, end?: number): Int8Array;

    /**
     * Determines whether the specified callback function returns true for any element of an array.
     * @param predicate A function that accepts up to three arguments. The some method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value true, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    some(predicate: (value: number, index: number, array: Int8Array) => unknown, thisArg?: any): boolean;

    /**
     * Sorts an array.
     * @param compareFn Function used to determine the order of the elements. It is expected to return
     * a negative value if first argument is less than second argument, zero if they're equal and a positive
     * value otherwise. If omitted, the elements are sorted in ascending order.
     * ```ts
     * [11,2,22,1].sort((a, b) => a - b)
     * ```
     */
    sort(compareFn?: (a: number, b: number) => number): this;

    /**
     * Gets a new Int8Array view of the ArrayBuffer store for this array, referencing the elements
     * at begin, inclusive, up to end, exclusive.
     * @param begin The index of the beginning of the array.
     * @param end The index of the end of the array.
     */
    subarray(begin?: number, end?: number): Int8Array;

    /**
     * Converts a number to a string by using the current locale.
     */
    toLocaleString(): string;

    /**
     * Returns a string representation of an array.
     */
    toString(): string;

    /** Returns the primitive value of the specified object. */
    valueOf(): Int8Array;

    [index: number]: number;
}
interface Int8ArrayConstructor {
    readonly prototype: Int8Array;
    new (length: number): Int8Array;
    new (array: ArrayLike<number> | ArrayBufferLike): Int8Array;
    new (buffer: ArrayBufferLike, byteOffset?: number, length?: number): Int8Array;

    /**
     * The size in bytes of each element in the array.
     */
    readonly BYTES_PER_ELEMENT: number;

    /**
     * Returns a new array from a set of elements.
     * @param items A set of elements to include in the new array object.
     */
    of(...items: number[]): Int8Array;

    /**
     * Creates an array from an array-like or iterable object.
     * @param arrayLike An array-like or iterable object to convert to an array.
     */
    from(arrayLike: ArrayLike<number>): Int8Array;

    /**
     * Creates an array from an array-like or iterable object.
     * @param arrayLike An array-like or iterable object to convert to an array.
     * @param mapfn A mapping function to call on every element of the array.
     * @param thisArg Value of 'this' used to invoke the mapfn.
     */
    from<T>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => number, thisArg?: any): Int8Array;
}
declare var Int8Array: Int8ArrayConstructor;

/**
 * A typed array of 8-bit unsigned integer values. The contents are initialized to 0. If the
 * requested number of bytes could not be allocated an exception is raised.
 */
interface Uint8Array {
    /**
     * The size in bytes of each element in the array.
     */
    readonly BYTES_PER_ELEMENT: number;

    /**
     * The ArrayBuffer instance referenced by the array.
     */
    readonly buffer: ArrayBufferLike;

    /**
     * The length in bytes of the array.
     */
    readonly byteLength: number;

    /**
     * The offset in bytes of the array.
     */
    readonly byteOffset: number;

    /**
     * Returns the this object after copying a section of the array identified by start and end
     * to the same array starting at position target
     * @param target If target is negative, it is treated as length+target where length is the
     * length of the array.
     * @param start If start is negative, it is treated as length+start. If end is negative, it
     * is treated as length+end.
     * @param end If not specified, length of the this object is used as its default value.
     */
    copyWithin(target: number, start: number, end?: number): this;

    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param predicate A function that accepts up to three arguments. The every method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value false, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    every(predicate: (value: number, index: number, array: Uint8Array) => unknown, thisArg?: any): boolean;

    /**
     * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
     * @param value value to fill array section with
     * @param start index to start filling the array at. If start is negative, it is treated as
     * length+start where length is the length of the array.
     * @param end index to stop filling the array at. If end is negative, it is treated as
     * length+end.
     */
    fill(value: number, start?: number, end?: number): this;

    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls
     * the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    filter(predicate: (value: number, index: number, array: Uint8Array) => any, thisArg?: any): Uint8Array;

    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    find(predicate: (value: number, index: number, obj: Uint8Array) => boolean, thisArg?: any): number | undefined;

    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    findIndex(predicate: (value: number, index: number, obj: Uint8Array) => boolean, thisArg?: any): number;

    /**
     * Performs the specified action for each element in an array.
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the
     * callbackfn function one time for each element in the array.
     * @param thisArg  An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    forEach(callbackfn: (value: number, index: number, array: Uint8Array) => void, thisArg?: any): void;

    /**
     * Returns the index of the first occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the
     *  search starts at index 0.
     */
    indexOf(searchElement: number, fromIndex?: number): number;

    /**
     * Adds all the elements of an array separated by the specified separator string.
     * @param separator A string used to separate one element of an array from the next in the
     * resulting String. If omitted, the array elements are separated with a comma.
     */
    join(separator?: string): string;

    /**
     * Returns the index of the last occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the
     * search starts at index 0.
     */
    lastIndexOf(searchElement: number, fromIndex?: number): number;

    /**
     * The length of the array.
     */
    readonly length: number;

    /**
     * Calls a defined callback function on each element of an array, and returns an array that
     * contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the
     * callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    map(callbackfn: (value: number, index: number, array: Uint8Array) => number, thisArg?: any): Uint8Array;

    /**
     * Calls the specified callback function for all the elements in an array. The return value of
     * the callback function is the accumulated result, and is provided as an argument in the next
     * call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
     * callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Uint8Array) => number): number;
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Uint8Array) => number, initialValue: number): number;

    /**
     * Calls the specified callback function for all the elements in an array. The return value of
     * the callback function is the accumulated result, and is provided as an argument in the next
     * call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
     * callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduce<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Uint8Array) => U, initialValue: U): U;

    /**
     * Calls the specified callback function for all the elements in an array, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an
     * argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls
     * the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an
     * argument instead of an array value.
     */
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Uint8Array) => number): number;
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Uint8Array) => number, initialValue: number): number;

    /**
     * Calls the specified callback function for all the elements in an array, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an
     * argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls
     * the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduceRight<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Uint8Array) => U, initialValue: U): U;

    /**
     * Reverses the elements in an Array.
     */
    reverse(): Uint8Array;

    /**
     * Sets a value or an array of values.
     * @param array A typed or untyped array of values to set.
     * @param offset The index in the current array at which the values are to be written.
     */
    set(array: ArrayLike<number>, offset?: number): void;

    /**
     * Returns a section of an array.
     * @param start The beginning of the specified portion of the array.
     * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
     */
    slice(start?: number, end?: number): Uint8Array;

    /**
     * Determines whether the specified callback function returns true for any element of an array.
     * @param predicate A function that accepts up to three arguments. The some method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value true, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    some(predicate: (value: number, index: number, array: Uint8Array) => unknown, thisArg?: any): boolean;

    /**
     * Sorts an array.
     * @param compareFn Function used to determine the order of the elements. It is expected to return
     * a negative value if first argument is less than second argument, zero if they're equal and a positive
     * value otherwise. If omitted, the elements are sorted in ascending order.
     * ```ts
     * [11,2,22,1].sort((a, b) => a - b)
     * ```
     */
    sort(compareFn?: (a: number, b: number) => number): this;

    /**
     * Gets a new Uint8Array view of the ArrayBuffer store for this array, referencing the elements
     * at begin, inclusive, up to end, exclusive.
     * @param begin The index of the beginning of the array.
     * @param end The index of the end of the array.
     */
    subarray(begin?: number, end?: number): Uint8Array;

    /**
     * Converts a number to a string by using the current locale.
     */
    toLocaleString(): string;

    /**
     * Returns a string representation of an array.
     */
    toString(): string;

    /** Returns the primitive value of the specified object. */
    valueOf(): Uint8Array;

    [index: number]: number;
}

interface Uint8ArrayConstructor {
    readonly prototype: Uint8Array;
    new (length: number): Uint8Array;
    new (array: ArrayLike<number> | ArrayBufferLike): Uint8Array;
    new (buffer: ArrayBufferLike, byteOffset?: number, length?: number): Uint8Array;

    /**
     * The size in bytes of each element in the array.
     */
    readonly BYTES_PER_ELEMENT: number;

    /**
     * Returns a new array from a set of elements.
     * @param items A set of elements to include in the new array object.
     */
    of(...items: number[]): Uint8Array;

    /**
     * Creates an array from an array-like or iterable object.
     * @param arrayLike An array-like or iterable object to convert to an array.
     */
    from(arrayLike: ArrayLike<number>): Uint8Array;

    /**
     * Creates an array from an array-like or iterable object.
     * @param arrayLike An array-like or iterable object to convert to an array.
     * @param mapfn A mapping function to call on every element of the array.
     * @param thisArg Value of 'this' used to invoke the mapfn.
     */
    from<T>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => number, thisArg?: any): Uint8Array;
}
declare var Uint8Array: Uint8ArrayConstructor;

/**
 * A typed array of 8-bit unsigned integer (clamped) values. The contents are initialized to 0.
 * If the requested number of bytes could not be allocated an exception is raised.
 */
interface Uint8ClampedArray {
    /**
     * The size in bytes of each element in the array.
     */
    readonly BYTES_PER_ELEMENT: number;

    /**
     * The ArrayBuffer instance referenced by the array.
     */
    readonly buffer: ArrayBufferLike;

    /**
     * The length in bytes of the array.
     */
    readonly byteLength: number;

    /**
     * The offset in bytes of the array.
     */
    readonly byteOffset: number;

    /**
     * Returns the this object after copying a section of the array identified by start and end
     * to the same array starting at position target
     * @param target If target is negative, it is treated as length+target where length is the
     * length of the array.
     * @param start If start is negative, it is treated as length+start. If end is negative, it
     * is treated as length+end.
     * @param end If not specified, length of the this object is used as its default value.
     */
    copyWithin(target: number, start: number, end?: number): this;

    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param predicate A function that accepts up to three arguments. The every method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value false, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    every(predicate: (value: number, index: number, array: Uint8ClampedArray) => unknown, thisArg?: any): boolean;

    /**
     * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
     * @param value value to fill array section with
     * @param start index to start filling the array at. If start is negative, it is treated as
     * length+start where length is the length of the array.
     * @param end index to stop filling the array at. If end is negative, it is treated as
     * length+end.
     */
    fill(value: number, start?: number, end?: number): this;

    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls
     * the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    filter(predicate: (value: number, index: number, array: Uint8ClampedArray) => any, thisArg?: any): Uint8ClampedArray;

    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    find(predicate: (value: number, index: number, obj: Uint8ClampedArray) => boolean, thisArg?: any): number | undefined;

    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    findIndex(predicate: (value: number, index: number, obj: Uint8ClampedArray) => boolean, thisArg?: any): number;

    /**
     * Performs the specified action for each element in an array.
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the
     * callbackfn function one time for each element in the array.
     * @param thisArg  An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    forEach(callbackfn: (value: number, index: number, array: Uint8ClampedArray) => void, thisArg?: any): void;

    /**
     * Returns the index of the first occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the
     *  search starts at index 0.
     */
    indexOf(searchElement: number, fromIndex?: number): number;

    /**
     * Adds all the elements of an array separated by the specified separator string.
     * @param separator A string used to separate one element of an array from the next in the
     * resulting String. If omitted, the array elements are separated with a comma.
     */
    join(separator?: string): string;

    /**
     * Returns the index of the last occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the
     * search starts at index 0.
     */
    lastIndexOf(searchElement: number, fromIndex?: number): number;

    /**
     * The length of the array.
     */
    readonly length: number;

    /**
     * Calls a defined callback function on each element of an array, and returns an array that
     * contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the
     * callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    map(callbackfn: (value: number, index: number, array: Uint8ClampedArray) => number, thisArg?: any): Uint8ClampedArray;

    /**
     * Calls the specified callback function for all the elements in an array. The return value of
     * the callback function is the accumulated result, and is provided as an argument in the next
     * call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
     * callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Uint8ClampedArray) => number): number;
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Uint8ClampedArray) => number, initialValue: number): number;

    /**
     * Calls the specified callback function for all the elements in an array. The return value of
     * the callback function is the accumulated result, and is provided as an argument in the next
     * call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
     * callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduce<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Uint8ClampedArray) => U, initialValue: U): U;

    /**
     * Calls the specified callback function for all the elements in an array, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an
     * argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls
     * the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an
     * argument instead of an array value.
     */
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Uint8ClampedArray) => number): number;
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Uint8ClampedArray) => number, initialValue: number): number;

    /**
     * Calls the specified callback function for all the elements in an array, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an
     * argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls
     * the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduceRight<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Uint8ClampedArray) => U, initialValue: U): U;

    /**
     * Reverses the elements in an Array.
     */
    reverse(): Uint8ClampedArray;

    /**
     * Sets a value or an array of values.
     * @param array A typed or untyped array of values to set.
     * @param offset The index in the current array at which the values are to be written.
     */
    set(array: ArrayLike<number>, offset?: number): void;

    /**
     * Returns a section of an array.
     * @param start The beginning of the specified portion of the array.
     * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
     */
    slice(start?: number, end?: number): Uint8ClampedArray;

    /**
     * Determines whether the specified callback function returns true for any element of an array.
     * @param predicate A function that accepts up to three arguments. The some method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value true, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    some(predicate: (value: number, index: number, array: Uint8ClampedArray) => unknown, thisArg?: any): boolean;

    /**
     * Sorts an array.
     * @param compareFn Function used to determine the order of the elements. It is expected to return
     * a negative value if first argument is less than second argument, zero if they're equal and a positive
     * value otherwise. If omitted, the elements are sorted in ascending order.
     * ```ts
     * [11,2,22,1].sort((a, b) => a - b)
     * ```
     */
    sort(compareFn?: (a: number, b: number) => number): this;

    /**
     * Gets a new Uint8ClampedArray view of the ArrayBuffer store for this array, referencing the elements
     * at begin, inclusive, up to end, exclusive.
     * @param begin The index of the beginning of the array.
     * @param end The index of the end of the array.
     */
    subarray(begin?: number, end?: number): Uint8ClampedArray;

    /**
     * Converts a number to a string by using the current locale.
     */
    toLocaleString(): string;

    /**
     * Returns a string representation of an array.
     */
    toString(): string;

    /** Returns the primitive value of the specified object. */
    valueOf(): Uint8ClampedArray;

    [index: number]: number;
}

interface Uint8ClampedArrayConstructor {
    readonly prototype: Uint8ClampedArray;
    new (length: number): Uint8ClampedArray;
    new (array: ArrayLike<number> | ArrayBufferLike): Uint8ClampedArray;
    new (buffer: ArrayBufferLike, byteOffset?: number, length?: number): Uint8ClampedArray;

    /**
     * The size in bytes of each element in the array.
     */
    readonly BYTES_PER_ELEMENT: number;

    /**
     * Returns a new array from a set of elements.
     * @param items A set of elements to include in the new array object.
     */
    of(...items: number[]): Uint8ClampedArray;

    /**
     * Creates an array from an array-like or iterable object.
     * @param arrayLike An array-like or iterable object to convert to an array.
     */
    from(arrayLike: ArrayLike<number>): Uint8ClampedArray;

    /**
     * Creates an array from an array-like or iterable object.
     * @param arrayLike An array-like or iterable object to convert to an array.
     * @param mapfn A mapping function to call on every element of the array.
     * @param thisArg Value of 'this' used to invoke the mapfn.
     */
    from<T>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => number, thisArg?: any): Uint8ClampedArray;
}
declare var Uint8ClampedArray: Uint8ClampedArrayConstructor;

/**
 * A typed array of 16-bit signed integer values. The contents are initialized to 0. If the
 * requested number of bytes could not be allocated an exception is raised.
 */
interface Int16Array {
    /**
     * The size in bytes of each element in the array.
     */
    readonly BYTES_PER_ELEMENT: number;

    /**
     * The ArrayBuffer instance referenced by the array.
     */
    readonly buffer: ArrayBufferLike;

    /**
     * The length in bytes of the array.
     */
    readonly byteLength: number;

    /**
     * The offset in bytes of the array.
     */
    readonly byteOffset: number;

    /**
     * Returns the this object after copying a section of the array identified by start and end
     * to the same array starting at position target
     * @param target If target is negative, it is treated as length+target where length is the
     * length of the array.
     * @param start If start is negative, it is treated as length+start. If end is negative, it
     * is treated as length+end.
     * @param end If not specified, length of the this object is used as its default value.
     */
    copyWithin(target: number, start: number, end?: number): this;

    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param predicate A function that accepts up to three arguments. The every method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value false, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    every(predicate: (value: number, index: number, array: Int16Array) => unknown, thisArg?: any): boolean;

    /**
     * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
     * @param value value to fill array section with
     * @param start index to start filling the array at. If start is negative, it is treated as
     * length+start where length is the length of the array.
     * @param end index to stop filling the array at. If end is negative, it is treated as
     * length+end.
     */
    fill(value: number, start?: number, end?: number): this;

    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls
     * the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    filter(predicate: (value: number, index: number, array: Int16Array) => any, thisArg?: any): Int16Array;

    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    find(predicate: (value: number, index: number, obj: Int16Array) => boolean, thisArg?: any): number | undefined;

    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    findIndex(predicate: (value: number, index: number, obj: Int16Array) => boolean, thisArg?: any): number;

    /**
     * Performs the specified action for each element in an array.
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the
     * callbackfn function one time for each element in the array.
     * @param thisArg  An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    forEach(callbackfn: (value: number, index: number, array: Int16Array) => void, thisArg?: any): void;
    /**
     * Returns the index of the first occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the
     *  search starts at index 0.
     */
    indexOf(searchElement: number, fromIndex?: number): number;

    /**
     * Adds all the elements of an array separated by the specified separator string.
     * @param separator A string used to separate one element of an array from the next in the
     * resulting String. If omitted, the array elements are separated with a comma.
     */
    join(separator?: string): string;

    /**
     * Returns the index of the last occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the
     * search starts at index 0.
     */
    lastIndexOf(searchElement: number, fromIndex?: number): number;

    /**
     * The length of the array.
     */
    readonly length: number;

    /**
     * Calls a defined callback function on each element of an array, and returns an array that
     * contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the
     * callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    map(callbackfn: (value: number, index: number, array: Int16Array) => number, thisArg?: any): Int16Array;

    /**
     * Calls the specified callback function for all the elements in an array. The return value of
     * the callback function is the accumulated result, and is provided as an argument in the next
     * call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
     * callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Int16Array) => number): number;
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Int16Array) => number, initialValue: number): number;

    /**
     * Calls the specified callback function for all the elements in an array. The return value of
     * the callback function is the accumulated result, and is provided as an argument in the next
     * call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
     * callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduce<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Int16Array) => U, initialValue: U): U;

    /**
     * Calls the specified callback function for all the elements in an array, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an
     * argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls
     * the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an
     * argument instead of an array value.
     */
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Int16Array) => number): number;
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Int16Array) => number, initialValue: number): number;

    /**
     * Calls the specified callback function for all the elements in an array, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an
     * argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls
     * the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduceRight<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Int16Array) => U, initialValue: U): U;

    /**
     * Reverses the elements in an Array.
     */
    reverse(): Int16Array;

    /**
     * Sets a value or an array of values.
     * @param array A typed or untyped array of values to set.
     * @param offset The index in the current array at which the values are to be written.
     */
    set(array: ArrayLike<number>, offset?: number): void;

    /**
     * Returns a section of an array.
     * @param start The beginning of the specified portion of the array.
     * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
     */
    slice(start?: number, end?: number): Int16Array;

    /**
     * Determines whether the specified callback function returns true for any element of an array.
     * @param predicate A function that accepts up to three arguments. The some method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value true, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    some(predicate: (value: number, index: number, array: Int16Array) => unknown, thisArg?: any): boolean;

    /**
     * Sorts an array.
     * @param compareFn Function used to determine the order of the elements. It is expected to return
     * a negative value if first argument is less than second argument, zero if they're equal and a positive
     * value otherwise. If omitted, the elements are sorted in ascending order.
     * ```ts
     * [11,2,22,1].sort((a, b) => a - b)
     * ```
     */
    sort(compareFn?: (a: number, b: number) => number): this;

    /**
     * Gets a new Int16Array view of the ArrayBuffer store for this array, referencing the elements
     * at begin, inclusive, up to end, exclusive.
     * @param begin The index of the beginning of the array.
     * @param end The index of the end of the array.
     */
    subarray(begin?: number, end?: number): Int16Array;

    /**
     * Converts a number to a string by using the current locale.
     */
    toLocaleString(): string;

    /**
     * Returns a string representation of an array.
     */
    toString(): string;

    /** Returns the primitive value of the specified object. */
    valueOf(): Int16Array;

    [index: number]: number;
}

interface Int16ArrayConstructor {
    readonly prototype: Int16Array;
    new (length: number): Int16Array;
    new (array: ArrayLike<number> | ArrayBufferLike): Int16Array;
    new (buffer: ArrayBufferLike, byteOffset?: number, length?: number): Int16Array;

    /**
     * The size in bytes of each element in the array.
     */
    readonly BYTES_PER_ELEMENT: number;

    /**
     * Returns a new array from a set of elements.
     * @param items A set of elements to include in the new array object.
     */
    of(...items: number[]): Int16Array;

    /**
     * Creates an array from an array-like or iterable object.
     * @param arrayLike An array-like or iterable object to convert to an array.
     */
    from(arrayLike: ArrayLike<number>): Int16Array;

    /**
     * Creates an array from an array-like or iterable object.
     * @param arrayLike An array-like or iterable object to convert to an array.
     * @param mapfn A mapping function to call on every element of the array.
     * @param thisArg Value of 'this' used to invoke the mapfn.
     */
    from<T>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => number, thisArg?: any): Int16Array;
}
declare var Int16Array: Int16ArrayConstructor;

/**
 * A typed array of 16-bit unsigned integer values. The contents are initialized to 0. If the
 * requested number of bytes could not be allocated an exception is raised.
 */
interface Uint16Array {
    /**
     * The size in bytes of each element in the array.
     */
    readonly BYTES_PER_ELEMENT: number;

    /**
     * The ArrayBuffer instance referenced by the array.
     */
    readonly buffer: ArrayBufferLike;

    /**
     * The length in bytes of the array.
     */
    readonly byteLength: number;

    /**
     * The offset in bytes of the array.
     */
    readonly byteOffset: number;

    /**
     * Returns the this object after copying a section of the array identified by start and end
     * to the same array starting at position target
     * @param target If target is negative, it is treated as length+target where length is the
     * length of the array.
     * @param start If start is negative, it is treated as length+start. If end is negative, it
     * is treated as length+end.
     * @param end If not specified, length of the this object is used as its default value.
     */
    copyWithin(target: number, start: number, end?: number): this;

    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param predicate A function that accepts up to three arguments. The every method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value false, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    every(predicate: (value: number, index: number, array: Uint16Array) => unknown, thisArg?: any): boolean;

    /**
     * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
     * @param value value to fill array section with
     * @param start index to start filling the array at. If start is negative, it is treated as
     * length+start where length is the length of the array.
     * @param end index to stop filling the array at. If end is negative, it is treated as
     * length+end.
     */
    fill(value: number, start?: number, end?: number): this;

    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls
     * the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    filter(predicate: (value: number, index: number, array: Uint16Array) => any, thisArg?: any): Uint16Array;

    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    find(predicate: (value: number, index: number, obj: Uint16Array) => boolean, thisArg?: any): number | undefined;

    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    findIndex(predicate: (value: number, index: number, obj: Uint16Array) => boolean, thisArg?: any): number;

    /**
     * Performs the specified action for each element in an array.
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the
     * callbackfn function one time for each element in the array.
     * @param thisArg  An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    forEach(callbackfn: (value: number, index: number, array: Uint16Array) => void, thisArg?: any): void;

    /**
     * Returns the index of the first occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the
     *  search starts at index 0.
     */
    indexOf(searchElement: number, fromIndex?: number): number;

    /**
     * Adds all the elements of an array separated by the specified separator string.
     * @param separator A string used to separate one element of an array from the next in the
     * resulting String. If omitted, the array elements are separated with a comma.
     */
    join(separator?: string): string;

    /**
     * Returns the index of the last occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the
     * search starts at index 0.
     */
    lastIndexOf(searchElement: number, fromIndex?: number): number;

    /**
     * The length of the array.
     */
    readonly length: number;

    /**
     * Calls a defined callback function on each element of an array, and returns an array that
     * contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the
     * callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    map(callbackfn: (value: number, index: number, array: Uint16Array) => number, thisArg?: any): Uint16Array;

    /**
     * Calls the specified callback function for all the elements in an array. The return value of
     * the callback function is the accumulated result, and is provided as an argument in the next
     * call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
     * callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Uint16Array) => number): number;
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Uint16Array) => number, initialValue: number): number;

    /**
     * Calls the specified callback function for all the elements in an array. The return value of
     * the callback function is the accumulated result, and is provided as an argument in the next
     * call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
     * callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduce<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Uint16Array) => U, initialValue: U): U;

    /**
     * Calls the specified callback function for all the elements in an array, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an
     * argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls
     * the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an
     * argument instead of an array value.
     */
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Uint16Array) => number): number;
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Uint16Array) => number, initialValue: number): number;

    /**
     * Calls the specified callback function for all the elements in an array, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an
     * argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls
     * the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduceRight<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Uint16Array) => U, initialValue: U): U;

    /**
     * Reverses the elements in an Array.
     */
    reverse(): Uint16Array;

    /**
     * Sets a value or an array of values.
     * @param array A typed or untyped array of values to set.
     * @param offset The index in the current array at which the values are to be written.
     */
    set(array: ArrayLike<number>, offset?: number): void;

    /**
     * Returns a section of an array.
     * @param start The beginning of the specified portion of the array.
     * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
     */
    slice(start?: number, end?: number): Uint16Array;

    /**
     * Determines whether the specified callback function returns true for any element of an array.
     * @param predicate A function that accepts up to three arguments. The some method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value true, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    some(predicate: (value: number, index: number, array: Uint16Array) => unknown, thisArg?: any): boolean;

    /**
     * Sorts an array.
     * @param compareFn Function used to determine the order of the elements. It is expected to return
     * a negative value if first argument is less than second argument, zero if they're equal and a positive
     * value otherwise. If omitted, the elements are sorted in ascending order.
     * ```ts
     * [11,2,22,1].sort((a, b) => a - b)
     * ```
     */
    sort(compareFn?: (a: number, b: number) => number): this;

    /**
     * Gets a new Uint16Array view of the ArrayBuffer store for this array, referencing the elements
     * at begin, inclusive, up to end, exclusive.
     * @param begin The index of the beginning of the array.
     * @param end The index of the end of the array.
     */
    subarray(begin?: number, end?: number): Uint16Array;

    /**
     * Converts a number to a string by using the current locale.
     */
    toLocaleString(): string;

    /**
     * Returns a string representation of an array.
     */
    toString(): string;

    /** Returns the primitive value of the specified object. */
    valueOf(): Uint16Array;

    [index: number]: number;
}

interface Uint16ArrayConstructor {
    readonly prototype: Uint16Array;
    new (length: number): Uint16Array;
    new (array: ArrayLike<number> | ArrayBufferLike): Uint16Array;
    new (buffer: ArrayBufferLike, byteOffset?: number, length?: number): Uint16Array;

    /**
     * The size in bytes of each element in the array.
     */
    readonly BYTES_PER_ELEMENT: number;

    /**
     * Returns a new array from a set of elements.
     * @param items A set of elements to include in the new array object.
     */
    of(...items: number[]): Uint16Array;

    /**
     * Creates an array from an array-like or iterable object.
     * @param arrayLike An array-like or iterable object to convert to an array.
     */
    from(arrayLike: ArrayLike<number>): Uint16Array;

    /**
     * Creates an array from an array-like or iterable object.
     * @param arrayLike An array-like or iterable object to convert to an array.
     * @param mapfn A mapping function to call on every element of the array.
     * @param thisArg Value of 'this' used to invoke the mapfn.
     */
    from<T>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => number, thisArg?: any): Uint16Array;
}
declare var Uint16Array: Uint16ArrayConstructor;
/**
 * A typed array of 32-bit signed integer values. The contents are initialized to 0. If the
 * requested number of bytes could not be allocated an exception is raised.
 */
interface Int32Array {
    /**
     * The size in bytes of each element in the array.
     */
    readonly BYTES_PER_ELEMENT: number;

    /**
     * The ArrayBuffer instance referenced by the array.
     */
    readonly buffer: ArrayBufferLike;

    /**
     * The length in bytes of the array.
     */
    readonly byteLength: number;

    /**
     * The offset in bytes of the array.
     */
    readonly byteOffset: number;

    /**
     * Returns the this object after copying a section of the array identified by start and end
     * to the same array starting at position target
     * @param target If target is negative, it is treated as length+target where length is the
     * length of the array.
     * @param start If start is negative, it is treated as length+start. If end is negative, it
     * is treated as length+end.
     * @param end If not specified, length of the this object is used as its default value.
     */
    copyWithin(target: number, start: number, end?: number): this;

    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param predicate A function that accepts up to three arguments. The every method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value false, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    every(predicate: (value: number, index: number, array: Int32Array) => unknown, thisArg?: any): boolean;

    /**
     * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
     * @param value value to fill array section with
     * @param start index to start filling the array at. If start is negative, it is treated as
     * length+start where length is the length of the array.
     * @param end index to stop filling the array at. If end is negative, it is treated as
     * length+end.
     */
    fill(value: number, start?: number, end?: number): this;

    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls
     * the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    filter(predicate: (value: number, index: number, array: Int32Array) => any, thisArg?: any): Int32Array;

    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    find(predicate: (value: number, index: number, obj: Int32Array) => boolean, thisArg?: any): number | undefined;

    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    findIndex(predicate: (value: number, index: number, obj: Int32Array) => boolean, thisArg?: any): number;

    /**
     * Performs the specified action for each element in an array.
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the
     * callbackfn function one time for each element in the array.
     * @param thisArg  An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    forEach(callbackfn: (value: number, index: number, array: Int32Array) => void, thisArg?: any): void;

    /**
     * Returns the index of the first occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the
     *  search starts at index 0.
     */
    indexOf(searchElement: number, fromIndex?: number): number;

    /**
     * Adds all the elements of an array separated by the specified separator string.
     * @param separator A string used to separate one element of an array from the next in the
     * resulting String. If omitted, the array elements are separated with a comma.
     */
    join(separator?: string): string;

    /**
     * Returns the index of the last occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the
     * search starts at index 0.
     */
    lastIndexOf(searchElement: number, fromIndex?: number): number;

    /**
     * The length of the array.
     */
    readonly length: number;

    /**
     * Calls a defined callback function on each element of an array, and returns an array that
     * contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the
     * callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    map(callbackfn: (value: number, index: number, array: Int32Array) => number, thisArg?: any): Int32Array;

    /**
     * Calls the specified callback function for all the elements in an array. The return value of
     * the callback function is the accumulated result, and is provided as an argument in the next
     * call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
     * callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Int32Array) => number): number;
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Int32Array) => number, initialValue: number): number;

    /**
     * Calls the specified callback function for all the elements in an array. The return value of
     * the callback function is the accumulated result, and is provided as an argument in the next
     * call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
     * callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduce<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Int32Array) => U, initialValue: U): U;

    /**
     * Calls the specified callback function for all the elements in an array, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an
     * argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls
     * the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an
     * argument instead of an array value.
     */
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Int32Array) => number): number;
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Int32Array) => number, initialValue: number): number;

    /**
     * Calls the specified callback function for all the elements in an array, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an
     * argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls
     * the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduceRight<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Int32Array) => U, initialValue: U): U;

    /**
     * Reverses the elements in an Array.
     */
    reverse(): Int32Array;

    /**
     * Sets a value or an array of values.
     * @param array A typed or untyped array of values to set.
     * @param offset The index in the current array at which the values are to be written.
     */
    set(array: ArrayLike<number>, offset?: number): void;

    /**
     * Returns a section of an array.
     * @param start The beginning of the specified portion of the array.
     * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
     */
    slice(start?: number, end?: number): Int32Array;

    /**
     * Determines whether the specified callback function returns true for any element of an array.
     * @param predicate A function that accepts up to three arguments. The some method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value true, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    some(predicate: (value: number, index: number, array: Int32Array) => unknown, thisArg?: any): boolean;

    /**
     * Sorts an array.
     * @param compareFn Function used to determine the order of the elements. It is expected to return
     * a negative value if first argument is less than second argument, zero if they're equal and a positive
     * value otherwise. If omitted, the elements are sorted in ascending order.
     * ```ts
     * [11,2,22,1].sort((a, b) => a - b)
     * ```
     */
    sort(compareFn?: (a: number, b: number) => number): this;

    /**
     * Gets a new Int32Array view of the ArrayBuffer store for this array, referencing the elements
     * at begin, inclusive, up to end, exclusive.
     * @param begin The index of the beginning of the array.
     * @param end The index of the end of the array.
     */
    subarray(begin?: number, end?: number): Int32Array;

    /**
     * Converts a number to a string by using the current locale.
     */
    toLocaleString(): string;

    /**
     * Returns a string representation of an array.
     */
    toString(): string;

    /** Returns the primitive value of the specified object. */
    valueOf(): Int32Array;

    [index: number]: number;
}

interface Int32ArrayConstructor {
    readonly prototype: Int32Array;
    new (length: number): Int32Array;
    new (array: ArrayLike<number> | ArrayBufferLike): Int32Array;
    new (buffer: ArrayBufferLike, byteOffset?: number, length?: number): Int32Array;

    /**
     * The size in bytes of each element in the array.
     */
    readonly BYTES_PER_ELEMENT: number;

    /**
     * Returns a new array from a set of elements.
     * @param items A set of elements to include in the new array object.
     */
    of(...items: number[]): Int32Array;

    /**
     * Creates an array from an array-like or iterable object.
     * @param arrayLike An array-like or iterable object to convert to an array.
     */
    from(arrayLike: ArrayLike<number>): Int32Array;

    /**
     * Creates an array from an array-like or iterable object.
     * @param arrayLike An array-like or iterable object to convert to an array.
     * @param mapfn A mapping function to call on every element of the array.
     * @param thisArg Value of 'this' used to invoke the mapfn.
     */
    from<T>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => number, thisArg?: any): Int32Array;
}
declare var Int32Array: Int32ArrayConstructor;

/**
 * A typed array of 32-bit unsigned integer values. The contents are initialized to 0. If the
 * requested number of bytes could not be allocated an exception is raised.
 */
interface Uint32Array {
    /**
     * The size in bytes of each element in the array.
     */
    readonly BYTES_PER_ELEMENT: number;

    /**
     * The ArrayBuffer instance referenced by the array.
     */
    readonly buffer: ArrayBufferLike;

    /**
     * The length in bytes of the array.
     */
    readonly byteLength: number;

    /**
     * The offset in bytes of the array.
     */
    readonly byteOffset: number;

    /**
     * Returns the this object after copying a section of the array identified by start and end
     * to the same array starting at position target
     * @param target If target is negative, it is treated as length+target where length is the
     * length of the array.
     * @param start If start is negative, it is treated as length+start. If end is negative, it
     * is treated as length+end.
     * @param end If not specified, length of the this object is used as its default value.
     */
    copyWithin(target: number, start: number, end?: number): this;

    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param predicate A function that accepts up to three arguments. The every method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value false, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    every(predicate: (value: number, index: number, array: Uint32Array) => unknown, thisArg?: any): boolean;

    /**
     * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
     * @param value value to fill array section with
     * @param start index to start filling the array at. If start is negative, it is treated as
     * length+start where length is the length of the array.
     * @param end index to stop filling the array at. If end is negative, it is treated as
     * length+end.
     */
    fill(value: number, start?: number, end?: number): this;

    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls
     * the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    filter(predicate: (value: number, index: number, array: Uint32Array) => any, thisArg?: any): Uint32Array;

    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    find(predicate: (value: number, index: number, obj: Uint32Array) => boolean, thisArg?: any): number | undefined;

    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    findIndex(predicate: (value: number, index: number, obj: Uint32Array) => boolean, thisArg?: any): number;

    /**
     * Performs the specified action for each element in an array.
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the
     * callbackfn function one time for each element in the array.
     * @param thisArg  An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    forEach(callbackfn: (value: number, index: number, array: Uint32Array) => void, thisArg?: any): void;
    /**
     * Returns the index of the first occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the
     *  search starts at index 0.
     */
    indexOf(searchElement: number, fromIndex?: number): number;

    /**
     * Adds all the elements of an array separated by the specified separator string.
     * @param separator A string used to separate one element of an array from the next in the
     * resulting String. If omitted, the array elements are separated with a comma.
     */
    join(separator?: string): string;

    /**
     * Returns the index of the last occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the
     * search starts at index 0.
     */
    lastIndexOf(searchElement: number, fromIndex?: number): number;

    /**
     * The length of the array.
     */
    readonly length: number;

    /**
     * Calls a defined callback function on each element of an array, and returns an array that
     * contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the
     * callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    map(callbackfn: (value: number, index: number, array: Uint32Array) => number, thisArg?: any): Uint32Array;

    /**
     * Calls the specified callback function for all the elements in an array. The return value of
     * the callback function is the accumulated result, and is provided as an argument in the next
     * call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
     * callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Uint32Array) => number): number;
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Uint32Array) => number, initialValue: number): number;

    /**
     * Calls the specified callback function for all the elements in an array. The return value of
     * the callback function is the accumulated result, and is provided as an argument in the next
     * call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
     * callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduce<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Uint32Array) => U, initialValue: U): U;

    /**
     * Calls the specified callback function for all the elements in an array, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an
     * argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls
     * the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an
     * argument instead of an array value.
     */
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Uint32Array) => number): number;
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Uint32Array) => number, initialValue: number): number;

    /**
     * Calls the specified callback function for all the elements in an array, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an
     * argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls
     * the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduceRight<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Uint32Array) => U, initialValue: U): U;

    /**
     * Reverses the elements in an Array.
     */
    reverse(): Uint32Array;

    /**
     * Sets a value or an array of values.
     * @param array A typed or untyped array of values to set.
     * @param offset The index in the current array at which the values are to be written.
     */
    set(array: ArrayLike<number>, offset?: number): void;

    /**
     * Returns a section of an array.
     * @param start The beginning of the specified portion of the array.
     * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
     */
    slice(start?: number, end?: number): Uint32Array;

    /**
     * Determines whether the specified callback function returns true for any element of an array.
     * @param predicate A function that accepts up to three arguments. The some method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value true, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    some(predicate: (value: number, index: number, array: Uint32Array) => unknown, thisArg?: any): boolean;

    /**
     * Sorts an array.
     * @param compareFn Function used to determine the order of the elements. It is expected to return
     * a negative value if first argument is less than second argument, zero if they're equal and a positive
     * value otherwise. If omitted, the elements are sorted in ascending order.
     * ```ts
     * [11,2,22,1].sort((a, b) => a - b)
     * ```
     */
    sort(compareFn?: (a: number, b: number) => number): this;

    /**
     * Gets a new Uint32Array view of the ArrayBuffer store for this array, referencing the elements
     * at begin, inclusive, up to end, exclusive.
     * @param begin The index of the beginning of the array.
     * @param end The index of the end of the array.
     */
    subarray(begin?: number, end?: number): Uint32Array;

    /**
     * Converts a number to a string by using the current locale.
     */
    toLocaleString(): string;

    /**
     * Returns a string representation of an array.
     */
    toString(): string;

    /** Returns the primitive value of the specified object. */
    valueOf(): Uint32Array;

    [index: number]: number;
}

interface Uint32ArrayConstructor {
    readonly prototype: Uint32Array;
    new (length: number): Uint32Array;
    new (array: ArrayLike<number> | ArrayBufferLike): Uint32Array;
    new (buffer: ArrayBufferLike, byteOffset?: number, length?: number): Uint32Array;

    /**
     * The size in bytes of each element in the array.
     */
    readonly BYTES_PER_ELEMENT: number;

    /**
     * Returns a new array from a set of elements.
     * @param items A set of elements to include in the new array object.
     */
    of(...items: number[]): Uint32Array;

    /**
     * Creates an array from an array-like or iterable object.
     * @param arrayLike An array-like or iterable object to convert to an array.
     */
    from(arrayLike: ArrayLike<number>): Uint32Array;

    /**
     * Creates an array from an array-like or iterable object.
     * @param arrayLike An array-like or iterable object to convert to an array.
     * @param mapfn A mapping function to call on every element of the array.
     * @param thisArg Value of 'this' used to invoke the mapfn.
     */
    from<T>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => number, thisArg?: any): Uint32Array;
}
declare var Uint32Array: Uint32ArrayConstructor;

/**
 * A typed array of 32-bit float values. The contents are initialized to 0. If the requested number
 * of bytes could not be allocated an exception is raised.
 */
interface Float32Array {
    /**
     * The size in bytes of each element in the array.
     */
    readonly BYTES_PER_ELEMENT: number;

    /**
     * The ArrayBuffer instance referenced by the array.
     */
    readonly buffer: ArrayBufferLike;

    /**
     * The length in bytes of the array.
     */
    readonly byteLength: number;

    /**
     * The offset in bytes of the array.
     */
    readonly byteOffset: number;

    /**
     * Returns the this object after copying a section of the array identified by start and end
     * to the same array starting at position target
     * @param target If target is negative, it is treated as length+target where length is the
     * length of the array.
     * @param start If start is negative, it is treated as length+start. If end is negative, it
     * is treated as length+end.
     * @param end If not specified, length of the this object is used as its default value.
     */
    copyWithin(target: number, start: number, end?: number): this;

    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param predicate A function that accepts up to three arguments. The every method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value false, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    every(predicate: (value: number, index: number, array: Float32Array) => unknown, thisArg?: any): boolean;

    /**
     * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
     * @param value value to fill array section with
     * @param start index to start filling the array at. If start is negative, it is treated as
     * length+start where length is the length of the array.
     * @param end index to stop filling the array at. If end is negative, it is treated as
     * length+end.
     */
    fill(value: number, start?: number, end?: number): this;

    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls
     * the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    filter(predicate: (value: number, index: number, array: Float32Array) => any, thisArg?: any): Float32Array;

    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    find(predicate: (value: number, index: number, obj: Float32Array) => boolean, thisArg?: any): number | undefined;

    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    findIndex(predicate: (value: number, index: number, obj: Float32Array) => boolean, thisArg?: any): number;

    /**
     * Performs the specified action for each element in an array.
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the
     * callbackfn function one time for each element in the array.
     * @param thisArg  An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    forEach(callbackfn: (value: number, index: number, array: Float32Array) => void, thisArg?: any): void;

    /**
     * Returns the index of the first occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the
     *  search starts at index 0.
     */
    indexOf(searchElement: number, fromIndex?: number): number;

    /**
     * Adds all the elements of an array separated by the specified separator string.
     * @param separator A string used to separate one element of an array from the next in the
     * resulting String. If omitted, the array elements are separated with a comma.
     */
    join(separator?: string): string;

    /**
     * Returns the index of the last occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the
     * search starts at index 0.
     */
    lastIndexOf(searchElement: number, fromIndex?: number): number;

    /**
     * The length of the array.
     */
    readonly length: number;

    /**
     * Calls a defined callback function on each element of an array, and returns an array that
     * contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the
     * callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    map(callbackfn: (value: number, index: number, array: Float32Array) => number, thisArg?: any): Float32Array;

    /**
     * Calls the specified callback function for all the elements in an array. The return value of
     * the callback function is the accumulated result, and is provided as an argument in the next
     * call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
     * callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Float32Array) => number): number;
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Float32Array) => number, initialValue: number): number;

    /**
     * Calls the specified callback function for all the elements in an array. The return value of
     * the callback function is the accumulated result, and is provided as an argument in the next
     * call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
     * callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduce<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Float32Array) => U, initialValue: U): U;

    /**
     * Calls the specified callback function for all the elements in an array, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an
     * argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls
     * the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an
     * argument instead of an array value.
     */
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Float32Array) => number): number;
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Float32Array) => number, initialValue: number): number;

    /**
     * Calls the specified callback function for all the elements in an array, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an
     * argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls
     * the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduceRight<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Float32Array) => U, initialValue: U): U;

    /**
     * Reverses the elements in an Array.
     */
    reverse(): Float32Array;

    /**
     * Sets a value or an array of values.
     * @param array A typed or untyped array of values to set.
     * @param offset The index in the current array at which the values are to be written.
     */
    set(array: ArrayLike<number>, offset?: number): void;

    /**
     * Returns a section of an array.
     * @param start The beginning of the specified portion of the array.
     * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
     */
    slice(start?: number, end?: number): Float32Array;

    /**
     * Determines whether the specified callback function returns true for any element of an array.
     * @param predicate A function that accepts up to three arguments. The some method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value true, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    some(predicate: (value: number, index: number, array: Float32Array) => unknown, thisArg?: any): boolean;

    /**
     * Sorts an array.
     * @param compareFn Function used to determine the order of the elements. It is expected to return
     * a negative value if first argument is less than second argument, zero if they're equal and a positive
     * value otherwise. If omitted, the elements are sorted in ascending order.
     * ```ts
     * [11,2,22,1].sort((a, b) => a - b)
     * ```
     */
    sort(compareFn?: (a: number, b: number) => number): this;

    /**
     * Gets a new Float32Array view of the ArrayBuffer store for this array, referencing the elements
     * at begin, inclusive, up to end, exclusive.
     * @param begin The index of the beginning of the array.
     * @param end The index of the end of the array.
     */
    subarray(begin?: number, end?: number): Float32Array;

    /**
     * Converts a number to a string by using the current locale.
     */
    toLocaleString(): string;

    /**
     * Returns a string representation of an array.
     */
    toString(): string;

    /** Returns the primitive value of the specified object. */
    valueOf(): Float32Array;

    [index: number]: number;
}

interface Float32ArrayConstructor {
    readonly prototype: Float32Array;
    new (length: number): Float32Array;
    new (array: ArrayLike<number> | ArrayBufferLike): Float32Array;
    new (buffer: ArrayBufferLike, byteOffset?: number, length?: number): Float32Array;

    /**
     * The size in bytes of each element in the array.
     */
    readonly BYTES_PER_ELEMENT: number;

    /**
     * Returns a new array from a set of elements.
     * @param items A set of elements to include in the new array object.
     */
    of(...items: number[]): Float32Array;

    /**
     * Creates an array from an array-like or iterable object.
     * @param arrayLike An array-like or iterable object to convert to an array.
     */
    from(arrayLike: ArrayLike<number>): Float32Array;

    /**
     * Creates an array from an array-like or iterable object.
     * @param arrayLike An array-like or iterable object to convert to an array.
     * @param mapfn A mapping function to call on every element of the array.
     * @param thisArg Value of 'this' used to invoke the mapfn.
     */
    from<T>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => number, thisArg?: any): Float32Array;
}
declare var Float32Array: Float32ArrayConstructor;

/**
 * A typed array of 64-bit float values. The contents are initialized to 0. If the requested
 * number of bytes could not be allocated an exception is raised.
 */
interface Float64Array {
    /**
     * The size in bytes of each element in the array.
     */
    readonly BYTES_PER_ELEMENT: number;

    /**
     * The ArrayBuffer instance referenced by the array.
     */
    readonly buffer: ArrayBufferLike;

    /**
     * The length in bytes of the array.
     */
    readonly byteLength: number;

    /**
     * The offset in bytes of the array.
     */
    readonly byteOffset: number;

    /**
     * Returns the this object after copying a section of the array identified by start and end
     * to the same array starting at position target
     * @param target If target is negative, it is treated as length+target where length is the
     * length of the array.
     * @param start If start is negative, it is treated as length+start. If end is negative, it
     * is treated as length+end.
     * @param end If not specified, length of the this object is used as its default value.
     */
    copyWithin(target: number, start: number, end?: number): this;

    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param predicate A function that accepts up to three arguments. The every method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value false, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    every(predicate: (value: number, index: number, array: Float64Array) => unknown, thisArg?: any): boolean;

    /**
     * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
     * @param value value to fill array section with
     * @param start index to start filling the array at. If start is negative, it is treated as
     * length+start where length is the length of the array.
     * @param end index to stop filling the array at. If end is negative, it is treated as
     * length+end.
     */
    fill(value: number, start?: number, end?: number): this;

    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls
     * the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    filter(predicate: (value: number, index: number, array: Float64Array) => any, thisArg?: any): Float64Array;

    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    find(predicate: (value: number, index: number, obj: Float64Array) => boolean, thisArg?: any): number | undefined;

    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    findIndex(predicate: (value: number, index: number, obj: Float64Array) => boolean, thisArg?: any): number;

    /**
     * Performs the specified action for each element in an array.
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the
     * callbackfn function one time for each element in the array.
     * @param thisArg  An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    forEach(callbackfn: (value: number, index: number, array: Float64Array) => void, thisArg?: any): void;

    /**
     * Returns the index of the first occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the
     *  search starts at index 0.
     */
    indexOf(searchElement: number, fromIndex?: number): number;

    /**
     * Adds all the elements of an array separated by the specified separator string.
     * @param separator A string used to separate one element of an array from the next in the
     * resulting String. If omitted, the array elements are separated with a comma.
     */
    join(separator?: string): string;

    /**
     * Returns the index of the last occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the
     * search starts at index 0.
     */
    lastIndexOf(searchElement: number, fromIndex?: number): number;

    /**
     * The length of the array.
     */
    readonly length: number;

    /**
     * Calls a defined callback function on each element of an array, and returns an array that
     * contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the
     * callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    map(callbackfn: (value: number, index: number, array: Float64Array) => number, thisArg?: any): Float64Array;

    /**
     * Calls the specified callback function for all the elements in an array. The return value of
     * the callback function is the accumulated result, and is provided as an argument in the next
     * call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
     * callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Float64Array) => number): number;
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Float64Array) => number, initialValue: number): number;

    /**
     * Calls the specified callback function for all the elements in an array. The return value of
     * the callback function is the accumulated result, and is provided as an argument in the next
     * call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
     * callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduce<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Float64Array) => U, initialValue: U): U;

    /**
     * Calls the specified callback function for all the elements in an array, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an
     * argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls
     * the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an
     * argument instead of an array value.
     */
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Float64Array) => number): number;
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Float64Array) => number, initialValue: number): number;

    /**
     * Calls the specified callback function for all the elements in an array, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an
     * argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls
     * the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduceRight<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Float64Array) => U, initialValue: U): U;

    /**
     * Reverses the elements in an Array.
     */
    reverse(): Float64Array;

    /**
     * Sets a value or an array of values.
     * @param array A typed or untyped array of values to set.
     * @param offset The index in the current array at which the values are to be written.
     */
    set(array: ArrayLike<number>, offset?: number): void;

    /**
     * Returns a section of an array.
     * @param start The beginning of the specified portion of the array.
     * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
     */
    slice(start?: number, end?: number): Float64Array;

    /**
     * Determines whether the specified callback function returns true for any element of an array.
     * @param predicate A function that accepts up to three arguments. The some method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value true, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    some(predicate: (value: number, index: number, array: Float64Array) => unknown, thisArg?: any): boolean;

    /**
     * Sorts an array.
     * @param compareFn Function used to determine the order of the elements. It is expected to return
     * a negative value if first argument is less than second argument, zero if they're equal and a positive
     * value otherwise. If omitted, the elements are sorted in ascending order.
     * ```ts
     * [11,2,22,1].sort((a, b) => a - b)
     * ```
     */
    sort(compareFn?: (a: number, b: number) => number): this;

    /**
     * Gets a new Float64Array view of the ArrayBuffer store for this array, referencing the elements
     * at begin, inclusive, up to end, exclusive.
     * @param begin The index of the beginning of the array.
     * @param end The index of the end of the array.
     */
    subarray(begin?: number, end?: number): Float64Array;

    /**
     * Converts a number to a string by using the current locale.
     */
    toLocaleString(): string;

    /**
     * Returns a string representation of an array.
     */
    toString(): string;

    /** Returns the primitive value of the specified object. */
    valueOf(): Float64Array;

    [index: number]: number;
}

interface Float64ArrayConstructor {
    readonly prototype: Float64Array;
    new (length: number): Float64Array;
    new (array: ArrayLike<number> | ArrayBufferLike): Float64Array;
    new (buffer: ArrayBufferLike, byteOffset?: number, length?: number): Float64Array;

    /**
     * The size in bytes of each element in the array.
     */
    readonly BYTES_PER_ELEMENT: number;

    /**
     * Returns a new array from a set of elements.
     * @param items A set of elements to include in the new array object.
     */
    of(...items: number[]): Float64Array;

    /**
     * Creates an array from an array-like or iterable object.
     * @param arrayLike An array-like or iterable object to convert to an array.
     */
    from(arrayLike: ArrayLike<number>): Float64Array;

    /**
     * Creates an array from an array-like or iterable object.
     * @param arrayLike An array-like or iterable object to convert to an array.
     * @param mapfn A mapping function to call on every element of the array.
     * @param thisArg Value of 'this' used to invoke the mapfn.
     */
    from<T>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => number, thisArg?: any): Float64Array;
}
declare var Float64Array: Float64ArrayConstructor;

/////////////////////////////
/// ECMAScript Internationalization API
/////////////////////////////

declare namespace Intl {
    interface CollatorOptions {
        usage?: "sort" | "search" | undefined;
        localeMatcher?: "lookup" | "best fit" | undefined;
        numeric?: boolean | undefined;
        caseFirst?: "upper" | "lower" | "false" | undefined;
        sensitivity?: "base" | "accent" | "case" | "variant" | undefined;
        collation?: "big5han" | "compat" | "dict" | "direct" | "ducet" | "emoji" | "eor" | "gb2312" | "phonebk" | "phonetic" | "pinyin" | "reformed" | "searchjl" | "stroke" | "trad" | "unihan" | "zhuyin" | undefined;
        ignorePunctuation?: boolean | undefined;
    }

    interface ResolvedCollatorOptions {
        locale: string;
        usage: string;
        sensitivity: string;
        ignorePunctuation: boolean;
        collation: string;
        caseFirst: string;
        numeric: boolean;
    }

    interface Collator {
        compare(x: string, y: string): number;
        resolvedOptions(): ResolvedCollatorOptions;
    }

    interface CollatorConstructor {
        new (locales?: string | string[], options?: CollatorOptions): Collator;
        (locales?: string | string[], options?: CollatorOptions): Collator;
        supportedLocalesOf(locales: string | string[], options?: CollatorOptions): string[];
    }

    var Collator: CollatorConstructor;

    interface NumberFormatOptionsStyleRegistry {
        decimal: never;
        percent: never;
        currency: never;
    }

    type NumberFormatOptionsStyle = keyof NumberFormatOptionsStyleRegistry;

    interface NumberFormatOptionsCurrencyDisplayRegistry {
        code: never;
        symbol: never;
        name: never;
    }

    type NumberFormatOptionsCurrencyDisplay = keyof NumberFormatOptionsCurrencyDisplayRegistry;

    interface NumberFormatOptionsUseGroupingRegistry {}

    type NumberFormatOptionsUseGrouping = {} extends NumberFormatOptionsUseGroupingRegistry ? boolean : keyof NumberFormatOptionsUseGroupingRegistry | "true" | "false" | boolean;
    type ResolvedNumberFormatOptionsUseGrouping = {} extends NumberFormatOptionsUseGroupingRegistry ? boolean : keyof NumberFormatOptionsUseGroupingRegistry | false;

    interface NumberFormatOptions {
        localeMatcher?: "lookup" | "best fit" | undefined;
        style?: NumberFormatOptionsStyle | undefined;
        currency?: string | undefined;
        currencyDisplay?: NumberFormatOptionsCurrencyDisplay | undefined;
        useGrouping?: NumberFormatOptionsUseGrouping | undefined;
        minimumIntegerDigits?: number | undefined;
        minimumFractionDigits?: number | undefined;
        maximumFractionDigits?: number | undefined;
        minimumSignificantDigits?: number | undefined;
        maximumSignificantDigits?: number | undefined;
    }

    interface ResolvedNumberFormatOptions {
        locale: string;
        numberingSystem: string;
        style: NumberFormatOptionsStyle;
        currency?: string;
        currencyDisplay?: NumberFormatOptionsCurrencyDisplay;
        minimumIntegerDigits: number;
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
        minimumSignificantDigits?: number;
        maximumSignificantDigits?: number;
        useGrouping: ResolvedNumberFormatOptionsUseGrouping;
    }

    interface NumberFormat {
        format(value: number): string;
        resolvedOptions(): ResolvedNumberFormatOptions;
    }

    interface NumberFormatConstructor {
        new (locales?: string | string[], options?: NumberFormatOptions): NumberFormat;
        (locales?: string | string[], options?: NumberFormatOptions): NumberFormat;
        supportedLocalesOf(locales: string | string[], options?: NumberFormatOptions): string[];
        readonly prototype: NumberFormat;
    }

    var NumberFormat: NumberFormatConstructor;

    interface DateTimeFormatOptions {
        localeMatcher?: "best fit" | "lookup" | undefined;
        weekday?: "long" | "short" | "narrow" | undefined;
        era?: "long" | "short" | "narrow" | undefined;
        year?: "numeric" | "2-digit" | undefined;
        month?: "numeric" | "2-digit" | "long" | "short" | "narrow" | undefined;
        day?: "numeric" | "2-digit" | undefined;
        hour?: "numeric" | "2-digit" | undefined;
        minute?: "numeric" | "2-digit" | undefined;
        second?: "numeric" | "2-digit" | undefined;
        timeZoneName?: "short" | "long" | "shortOffset" | "longOffset" | "shortGeneric" | "longGeneric" | undefined;
        formatMatcher?: "best fit" | "basic" | undefined;
        hour12?: boolean | undefined;
        timeZone?: string | undefined;
    }

    interface ResolvedDateTimeFormatOptions {
        locale: string;
        calendar: string;
        numberingSystem: string;
        timeZone: string;
        hour12?: boolean;
        weekday?: string;
        era?: string;
        year?: string;
        month?: string;
        day?: string;
        hour?: string;
        minute?: string;
        second?: string;
        timeZoneName?: string;
    }

    interface DateTimeFormat {
        format(date?: Date | number): string;
        resolvedOptions(): ResolvedDateTimeFormatOptions;
    }

    interface DateTimeFormatConstructor {
        new (locales?: string | string[], options?: DateTimeFormatOptions): DateTimeFormat;
        (locales?: string | string[], options?: DateTimeFormatOptions): DateTimeFormat;
        supportedLocalesOf(locales: string | string[], options?: DateTimeFormatOptions): string[];
        readonly prototype: DateTimeFormat;
    }

    var DateTimeFormat: DateTimeFormatConstructor;
}

interface String {
    /**
     * Determines whether two strings are equivalent in the current or specified locale.
     * @param that String to compare to target string
     * @param locales A locale string or array of locale strings that contain one or more language or locale tags. If you include more than one locale string, list them in descending order of priority so that the first entry is the preferred locale. If you omit this parameter, the default locale of the JavaScript runtime is used. This parameter must conform to BCP 47 standards; see the Intl.Collator object for details.
     * @param options An object that contains one or more properties that specify comparison options. see the Intl.Collator object for details.
     */
    localeCompare(that: string, locales?: string | string[], options?: Intl.CollatorOptions): number;
}

interface Number {
    /**
     * Converts a number to a string by using the current or specified locale.
     * @param locales A locale string or array of locale strings that contain one or more language or locale tags. If you include more than one locale string, list them in descending order of priority so that the first entry is the preferred locale. If you omit this parameter, the default locale of the JavaScript runtime is used.
     * @param options An object that contains one or more properties that specify comparison options.
     */
    toLocaleString(locales?: string | string[], options?: Intl.NumberFormatOptions): string;
}

interface Date {
    /**
     * Converts a date and time to a string by using the current or specified locale.
     * @param locales A locale string or array of locale strings that contain one or more language or locale tags. If you include more than one locale string, list them in descending order of priority so that the first entry is the preferred locale. If you omit this parameter, the default locale of the JavaScript runtime is used.
     * @param options An object that contains one or more properties that specify comparison options.
     */
    toLocaleString(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string;
    /**
     * Converts a date to a string by using the current or specified locale.
     * @param locales A locale string or array of locale strings that contain one or more language or locale tags. If you include more than one locale string, list them in descending order of priority so that the first entry is the preferred locale. If you omit this parameter, the default locale of the JavaScript runtime is used.
     * @param options An object that contains one or more properties that specify comparison options.
     */
    toLocaleDateString(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string;

    /**
     * Converts a time to a string by using the current or specified locale.
     * @param locales A locale string or array of locale strings that contain one or more language or locale tags. If you include more than one locale string, list them in descending order of priority so that the first entry is the preferred locale. If you omit this parameter, the default locale of the JavaScript runtime is used.
     * @param options An object that contains one or more properties that specify comparison options.
     */
    toLocaleTimeString(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string;
}
interface Array<T> {
  /**
   * Returns the value of the first element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate find calls predicate once for each element of the array, in ascending
   * order, until it finds one where predicate returns true. If such an element is found, find
   * immediately returns that element value. Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  find<S extends T>(predicate: (value: T, index: number, obj: T[]) => value is S, thisArg?: any): S | undefined;
  find(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): T | undefined;

  /**
   * Returns the index of the first element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate find calls predicate once for each element of the array, in ascending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number;

  /**
   * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
   * @param value value to fill array section with
   * @param start index to start filling the array at. If start is negative, it is treated as
   * length+start where length is the length of the array.
   * @param end index to stop filling the array at. If end is negative, it is treated as
   * length+end.
   */
  fill(value: T, start?: number, end?: number): this;

  /**
   * Returns the this object after copying a section of the array identified by start and end
   * to the same array starting at position target
   * @param target If target is negative, it is treated as length+target where length is the
   * length of the array.
   * @param start If start is negative, it is treated as length+start. If end is negative, it
   * is treated as length+end.
   * @param end If not specified, length of the this object is used as its default value.
   */
  copyWithin(target: number, start: number, end?: number): this;

  toLocaleString(locales: string | string[], options?: Intl.NumberFormatOptions & Intl.DateTimeFormatOptions): string;
}

interface ArrayConstructor {
  /**
   * Creates an array from an array-like object.
   * @param arrayLike An array-like object to convert to an array.
   */
  from<T>(arrayLike: ArrayLike<T>): T[];

  /**
   * Creates an array from an iterable object.
   * @param arrayLike An array-like object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];

  /**
   * Returns a new array from a set of elements.
   * @param items A set of elements to include in the new array object.
   */
  of<T>(...items: T[]): T[];
}

interface DateConstructor {
  new (value: number | string | Date): Date;
}

interface Function {
  /**
   * Returns the name of the function. Function names are read-only and can not be changed.
   */
  readonly name: string;
}

interface Math {
  /**
   * Returns the number of leading zero bits in the 32-bit binary representation of a number.
   * @param x A numeric expression.
   */
  clz32(x: number): number;

  /**
   * Returns the result of 32-bit multiplication of two numbers.
   * @param x First number
   * @param y Second number
   */
  imul(x: number, y: number): number;

  /**
   * Returns the sign of the x, indicating whether x is positive, negative or zero.
   * @param x The numeric expression to test
   */
  sign(x: number): number;

  /**
   * Returns the base 10 logarithm of a number.
   * @param x A numeric expression.
   */
  log10(x: number): number;

  /**
   * Returns the base 2 logarithm of a number.
   * @param x A numeric expression.
   */
  log2(x: number): number;

  /**
   * Returns the natural logarithm of 1 + x.
   * @param x A numeric expression.
   */
  log1p(x: number): number;

  /**
   * Returns the result of (e^x - 1), which is an implementation-dependent approximation to
   * subtracting 1 from the exponential function of x (e raised to the power of x, where e
   * is the base of the natural logarithms).
   * @param x A numeric expression.
   */
  expm1(x: number): number;

  /**
   * Returns the hyperbolic cosine of a number.
   * @param x A numeric expression that contains an angle measured in radians.
   */
  cosh(x: number): number;

  /**
   * Returns the hyperbolic sine of a number.
   * @param x A numeric expression that contains an angle measured in radians.
   */
  sinh(x: number): number;

  /**
   * Returns the hyperbolic tangent of a number.
   * @param x A numeric expression that contains an angle measured in radians.
   */
  tanh(x: number): number;

  /**
   * Returns the inverse hyperbolic cosine of a number.
   * @param x A numeric expression that contains an angle measured in radians.
   */
  acosh(x: number): number;

  /**
   * Returns the inverse hyperbolic sine of a number.
   * @param x A numeric expression that contains an angle measured in radians.
   */
  asinh(x: number): number;

  /**
   * Returns the inverse hyperbolic tangent of a number.
   * @param x A numeric expression that contains an angle measured in radians.
   */
  atanh(x: number): number;

  /**
   * Returns the square root of the sum of squares of its arguments.
   * @param values Values to compute the square root for.
   *     If no arguments are passed, the result is +0.
   *     If there is only one argument, the result is the absolute value.
   *     If any argument is +Infinity or -Infinity, the result is +Infinity.
   *     If any argument is NaN, the result is NaN.
   *     If all arguments are either +0 or −0, the result is +0.
   */
  hypot(...values: number[]): number;

  /**
   * Returns the integral part of the a numeric expression, x, removing any fractional digits.
   * If x is already an integer, the result is x.
   * @param x A numeric expression.
   */
  trunc(x: number): number;

  /**
   * Returns the nearest single precision float representation of a number.
   * @param x A numeric expression.
   */
  fround(x: number): number;

  /**
   * Returns an implementation-dependent approximation to the cube root of number.
   * @param x A numeric expression.
   */
  cbrt(x: number): number;
}

interface NumberConstructor {
  /**
   * The value of Number.EPSILON is the difference between 1 and the smallest value greater than 1
   * that is representable as a Number value, which is approximately:
   * 2.2204460492503130808472633361816 x 10‍−‍16.
   */
  readonly EPSILON: number;

  /**
   * Returns true if passed value is finite.
   * Unlike the global isFinite, Number.isFinite doesn't forcibly convert the parameter to a
   * number. Only finite values of the type number, result in true.
   * @param number A numeric value.
   */
  isFinite(number: unknown): boolean;

  /**
   * Returns true if the value passed is an integer, false otherwise.
   * @param number A numeric value.
   */
  isInteger(number: unknown): boolean;

  /**
   * Returns a Boolean value that indicates whether a value is the reserved value NaN (not a
   * number). Unlike the global isNaN(), Number.isNaN() doesn't forcefully convert the parameter
   * to a number. Only values of the type number, that are also NaN, result in true.
   * @param number A numeric value.
   */
  isNaN(number: unknown): boolean;

  /**
   * Returns true if the value passed is a safe integer.
   * @param number A numeric value.
   */
  isSafeInteger(number: unknown): boolean;

  /**
   * The value of the largest integer n such that n and n + 1 are both exactly representable as
   * a Number value.
   * The value of Number.MAX_SAFE_INTEGER is 9007199254740991 2^53 − 1.
   */
  readonly MAX_SAFE_INTEGER: number;

  /**
   * The value of the smallest integer n such that n and n − 1 are both exactly representable as
   * a Number value.
   * The value of Number.MIN_SAFE_INTEGER is −9007199254740991 (−(2^53 − 1)).
   */
  readonly MIN_SAFE_INTEGER: number;

  /**
   * Converts a string to a floating-point number.
   * @param string A string that contains a floating-point number.
   */
  parseFloat(string: string): number;

  /**
   * Converts A string to an integer.
   * @param string A string to convert into a number.
   * @param radix A value between 2 and 36 that specifies the base of the number in `string`.
   * If this argument is not supplied, strings with a prefix of '0x' are considered hexadecimal.
   * All other strings are considered decimal.
   */
  parseInt(string: string, radix?: number): number;
}

interface ObjectConstructor {
  /**
   * Copy the values of all of the enumerable own properties from one or more source objects to a
   * target object. Returns the target object.
   * @param target The target object to copy to.
   * @param source The source object from which to copy properties.
   */
  assign<T extends {}, U>(target: T, source: U): T & U;

  /**
   * Copy the values of all of the enumerable own properties from one or more source objects to a
   * target object. Returns the target object.
   * @param target The target object to copy to.
   * @param source1 The first source object from which to copy properties.
   * @param source2 The second source object from which to copy properties.
   */
  assign<T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V;

  /**
   * Copy the values of all of the enumerable own properties from one or more source objects to a
   * target object. Returns the target object.
   * @param target The target object to copy to.
   * @param source1 The first source object from which to copy properties.
   * @param source2 The second source object from which to copy properties.
   * @param source3 The third source object from which to copy properties.
   */
  assign<T extends {}, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;

  /**
   * Copy the values of all of the enumerable own properties from one or more source objects to a
   * target object. Returns the target object.
   * @param target The target object to copy to.
   * @param sources One or more source objects from which to copy properties
   */
  assign(target: object, ...sources: any[]): any;

  /**
   * Returns an array of all symbol properties found directly on object o.
   * @param o Object to retrieve the symbols from.
   */
  getOwnPropertySymbols(o: any): symbol[];

  /**
   * Returns the names of the enumerable string properties and methods of an object.
   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
   */
  keys(o: {}): string[];

  /**
   * Returns true if the values are the same value, false otherwise.
   * @param value1 The first value.
   * @param value2 The second value.
   */
  is(value1: any, value2: any): boolean;

  /**
   * Sets the prototype of a specified object o to object proto or null. Returns the object o.
   * @param o The object to change its prototype.
   * @param proto The value of the new prototype or null.
   */
  setPrototypeOf(o: any, proto: object | null): any;
}

interface ReadonlyArray<T> {
  /**
   * Returns the value of the first element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate find calls predicate once for each element of the array, in ascending
   * order, until it finds one where predicate returns true. If such an element is found, find
   * immediately returns that element value. Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  find<S extends T>(predicate: (value: T, index: number, obj: readonly T[]) => value is S, thisArg?: any): S | undefined;
  find(predicate: (value: T, index: number, obj: readonly T[]) => unknown, thisArg?: any): T | undefined;

  /**
   * Returns the index of the first element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate find calls predicate once for each element of the array, in ascending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findIndex(predicate: (value: T, index: number, obj: readonly T[]) => unknown, thisArg?: any): number;

  toLocaleString(locales: string | string[], options?: Intl.NumberFormatOptions & Intl.DateTimeFormatOptions): string;
}

interface RegExp {
  /**
   * Returns a string indicating the flags of the regular expression in question. This field is read-only.
   * The characters in this string are sequenced and concatenated in the following order:
   *
   *    - "g" for global
   *    - "i" for ignoreCase
   *    - "m" for multiline
   *    - "u" for unicode
   *    - "y" for sticky
   *
   * If no flags are set, the value is the empty string.
   */
  readonly flags: string;

  /**
   * Returns a Boolean value indicating the state of the sticky flag (y) used with a regular
   * expression. Default is false. Read-only.
   */
  readonly sticky: boolean;

  /**
   * Returns a Boolean value indicating the state of the Unicode flag (u) used with a regular
   * expression. Default is false. Read-only.
   */
  readonly unicode: boolean;
}

interface RegExpConstructor {
  new (pattern: RegExp | string, flags?: string): RegExp;
  (pattern: RegExp | string, flags?: string): RegExp;
}

interface String {
  /**
   * Returns a nonnegative integer Number less than 1114112 (0x110000) that is the code point
   * value of the UTF-16 encoded code point starting at the string element at position pos in
   * the String resulting from converting this object to a String.
   * If there is no element at that position, the result is undefined.
   * If a valid UTF-16 surrogate pair does not begin at pos, the result is the code unit at pos.
   */
  codePointAt(pos: number): number | undefined;

  /**
   * Returns true if searchString appears as a substring of the result of converting this
   * object to a String, at one or more positions that are
   * greater than or equal to position; otherwise, returns false.
   * @param searchString search string
   * @param position If position is undefined, 0 is assumed, so as to search all of the String.
   */
  includes(searchString: string, position?: number): boolean;

  /**
   * Returns true if the sequence of elements of searchString converted to a String is the
   * same as the corresponding elements of this object (converted to a String) starting at
   * endPosition – length(this). Otherwise returns false.
   */
  endsWith(searchString: string, endPosition?: number): boolean;

  /**
   * Returns the String value result of normalizing the string into the normalization form
   * named by form as specified in Unicode Standard Annex #15, Unicode Normalization Forms.
   * @param form Applicable values: "NFC", "NFD", "NFKC", or "NFKD", If not specified default
   * is "NFC"
   */
  normalize(form: "NFC" | "NFD" | "NFKC" | "NFKD"): string;

  /**
   * Returns the String value result of normalizing the string into the normalization form
   * named by form as specified in Unicode Standard Annex #15, Unicode Normalization Forms.
   * @param form Applicable values: "NFC", "NFD", "NFKC", or "NFKD", If not specified default
   * is "NFC"
   */
  normalize(form?: string): string;

  /**
   * Returns a String value that is made from count copies appended together. If count is 0,
   * the empty string is returned.
   * @param count number of copies to append
   */
  repeat(count: number): string;

  /**
   * Returns true if the sequence of elements of searchString converted to a String is the
   * same as the corresponding elements of this object (converted to a String) starting at
   * position. Otherwise returns false.
   */
  startsWith(searchString: string, position?: number): boolean;

  /**
   * Returns an `<a>` HTML anchor element and sets the name attribute to the text value
   * @deprecated A legacy feature for browser compatibility
   * @param name
   */
  anchor(name: string): string;

  /**
   * Returns a `<big>` HTML element
   * @deprecated A legacy feature for browser compatibility
   */
  big(): string;

  /**
   * Returns a `<blink>` HTML element
   * @deprecated A legacy feature for browser compatibility
   */
  blink(): string;

  /**
   * Returns a `<b>` HTML element
   * @deprecated A legacy feature for browser compatibility
   */
  bold(): string;

  /**
   * Returns a `<tt>` HTML element
   * @deprecated A legacy feature for browser compatibility
   */
  fixed(): string;

  /**
   * Returns a `<font>` HTML element and sets the color attribute value
   * @deprecated A legacy feature for browser compatibility
   */
  fontcolor(color: string): string;

  /**
   * Returns a `<font>` HTML element and sets the size attribute value
   * @deprecated A legacy feature for browser compatibility
   */
  fontsize(size: number): string;

  /**
   * Returns a `<font>` HTML element and sets the size attribute value
   * @deprecated A legacy feature for browser compatibility
   */
  fontsize(size: string): string;

  /**
   * Returns an `<i>` HTML element
   * @deprecated A legacy feature for browser compatibility
   */
  italics(): string;

  /**
   * Returns an `<a>` HTML element and sets the href attribute value
   * @deprecated A legacy feature for browser compatibility
   */
  link(url: string): string;

  /**
   * Returns a `<small>` HTML element
   * @deprecated A legacy feature for browser compatibility
   */
  small(): string;

  /**
   * Returns a `<strike>` HTML element
   * @deprecated A legacy feature for browser compatibility
   */
  strike(): string;

  /**
   * Returns a `<sub>` HTML element
   * @deprecated A legacy feature for browser compatibility
   */
  sub(): string;

  /**
   * Returns a `<sup>` HTML element
   * @deprecated A legacy feature for browser compatibility
   */
  sup(): string;
}

interface StringConstructor {
  /**
   * Return the String value whose elements are, in order, the elements in the List elements.
   * If length is 0, the empty string is returned.
   */
  fromCodePoint(...codePoints: number[]): string;

  /**
   * String.raw is usually used as a tag function of a Tagged Template String. When called as
   * such, the first argument will be a well formed template call site object and the rest
   * parameter will contain the substitution values. It can also be called directly, for example,
   * to interleave strings and values from your own tag function, and in this case the only thing
   * it needs from the first argument is the raw property.
   * @param template A well-formed template string call site representation.
   * @param substitutions A set of substitution values.
   */
  raw(template: { raw: readonly string[] | ArrayLike<string>; }, ...substitutions: any[]): string;
}

interface Int8Array {
  toLocaleString(locales: string | string[], options?: Intl.NumberFormatOptions): string;
}

interface Uint8Array {
  toLocaleString(locales: string | string[], options?: Intl.NumberFormatOptions): string;
}

interface Uint8ClampedArray {
  toLocaleString(locales: string | string[], options?: Intl.NumberFormatOptions): string;
}

interface Int16Array {
  toLocaleString(locales: string | string[], options?: Intl.NumberFormatOptions): string;
}

interface Uint16Array {
  toLocaleString(locales: string | string[], options?: Intl.NumberFormatOptions): string;
}

interface Int32Array {
  toLocaleString(locales: string | string[], options?: Intl.NumberFormatOptions): string;
}

interface Uint32Array {
  toLocaleString(locales: string | string[], options?: Intl.NumberFormatOptions): string;
}

interface Float32Array {
  toLocaleString(locales: string | string[], options?: Intl.NumberFormatOptions): string;
}

interface Float64Array {
  toLocaleString(locales: string | string[], options?: Intl.NumberFormatOptions): string;
}
interface Map<K, V> {
  clear(): void;
  /**
   * @returns true if an element in the Map existed and has been removed, or false if the element does not exist.
   */
  delete(key: K): boolean;
  /**
   * Executes a provided function once per each key/value pair in the Map, in insertion order.
   */
  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
  /**
   * Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.
   * @returns Returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.
   */
  get(key: K): V | undefined;
  /**
   * @returns boolean indicating whether an element with the specified key exists or not.
   */
  has(key: K): boolean;
  /**
   * Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.
   */
  set(key: K, value: V): this;
  /**
   * @returns the number of elements in the Map.
   */
  readonly size: number;
}

interface MapConstructor {
  new (): Map<any, any>;
  new <K, V>(entries?: readonly (readonly [K, V])[] | null): Map<K, V>;
  readonly prototype: Map<any, any>;
}
declare var Map: MapConstructor;

interface ReadonlyMap<K, V> {
  forEach(callbackfn: (value: V, key: K, map: ReadonlyMap<K, V>) => void, thisArg?: any): void;
  get(key: K): V | undefined;
  has(key: K): boolean;
  readonly size: number;
}

interface WeakMap<K extends WeakKey, V> {
  /**
   * Removes the specified element from the WeakMap.
   * @returns true if the element was successfully removed, or false if it was not present.
   */
  delete(key: K): boolean;
  /**
   * @returns a specified element.
   */
  get(key: K): V | undefined;
  /**
   * @returns a boolean indicating whether an element with the specified key exists or not.
   */
  has(key: K): boolean;
  /**
   * Adds a new element with a specified key and value.
   * @param key Must be an object or symbol.
   */
  set(key: K, value: V): this;
}

interface WeakMapConstructor {
  new <K extends WeakKey = WeakKey, V = any>(entries?: readonly (readonly [K, V])[] | null): WeakMap<K, V>;
  readonly prototype: WeakMap<WeakKey, any>;
}
declare var WeakMap: WeakMapConstructor;

interface Set<T> {
  /**
   * Appends a new element with a specified value to the end of the Set.
   */
  add(value: T): this;

  clear(): void;
  /**
   * Removes a specified value from the Set.
   * @returns Returns true if an element in the Set existed and has been removed, or false if the element does not exist.
   */
  delete(value: T): boolean;
  /**
   * Executes a provided function once per each value in the Set object, in insertion order.
   */
  forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void;
  /**
   * @returns a boolean indicating whether an element with the specified value exists in the Set or not.
   */
  has(value: T): boolean;
  /**
   * @returns the number of (unique) elements in Set.
   */
  readonly size: number;
}

interface SetConstructor {
  new <T = any>(values?: readonly T[] | null): Set<T>;
  readonly prototype: Set<any>;
}
declare var Set: SetConstructor;

interface ReadonlySet<T> {
  forEach(callbackfn: (value: T, value2: T, set: ReadonlySet<T>) => void, thisArg?: any): void;
  has(value: T): boolean;
  readonly size: number;
}

interface WeakSet<T extends WeakKey> {
  /**
   * Appends a new value to the end of the WeakSet.
   */
  add(value: T): this;
  /**
   * Removes the specified element from the WeakSet.
   * @returns Returns true if the element existed and has been removed, or false if the element does not exist.
   */
  delete(value: T): boolean;
  /**
   * @returns a boolean indicating whether a value exists in the WeakSet or not.
   */
  has(value: T): boolean;
}

interface WeakSetConstructor {
  new <T extends WeakKey = WeakKey>(values?: readonly T[] | null): WeakSet<T>;
  readonly prototype: WeakSet<WeakKey>;
}
declare var WeakSet: WeakSetConstructor;

interface SymbolConstructor {
  /**
   * A method that returns the default iterator for an object. Called by the semantics of the
   * for-of statement.
   */
  readonly iterator: unique symbol;
}

interface IteratorYieldResult<TYield> {
  done?: false;
  value: TYield;
}

interface IteratorReturnResult<TReturn> {
  done: true;
  value: TReturn;
}

type IteratorResult<T, TReturn = any> = IteratorYieldResult<T> | IteratorReturnResult<TReturn>;

interface Iterator<T, TReturn = any, TNext = undefined> {
  // NOTE: 'next' is defined using a tuple to ensure we report the correct assignability errors in all places.
  next(...args: [] | [TNext]): IteratorResult<T, TReturn>;
  return?(value?: TReturn): IteratorResult<T, TReturn>;
  throw?(e?: any): IteratorResult<T, TReturn>;
}

interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}

interface IterableIterator<T> extends Iterator<T> {
  [Symbol.iterator](): IterableIterator<T>;
}

interface Array<T> {
  /** Iterator */
  [Symbol.iterator](): IterableIterator<T>;

  /**
   * Returns an iterable of key, value pairs for every entry in the array
   */
  entries(): IterableIterator<[number, T]>;

  /**
   * Returns an iterable of keys in the array
   */
  keys(): IterableIterator<number>;

  /**
   * Returns an iterable of values in the array
   */
  values(): IterableIterator<T>;
}

interface ArrayConstructor {
  /**
   * Creates an array from an iterable object.
   * @param iterable An iterable object to convert to an array.
   */
  from<T>(iterable: Iterable<T> | ArrayLike<T>): T[];

  /**
   * Creates an array from an iterable object.
   * @param iterable An iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
}

interface ReadonlyArray<T> {
  /** Iterator of values in the array. */
  [Symbol.iterator](): IterableIterator<T>;

  /**
   * Returns an iterable of key, value pairs for every entry in the array
   */
  entries(): IterableIterator<[number, T]>;

  /**
   * Returns an iterable of keys in the array
   */
  keys(): IterableIterator<number>;

  /**
   * Returns an iterable of values in the array
   */
  values(): IterableIterator<T>;
}

interface IArguments {
  /** Iterator */
  [Symbol.iterator](): IterableIterator<any>;
}

interface Map<K, V> {
  /** Returns an iterable of entries in the map. */
  [Symbol.iterator](): IterableIterator<[K, V]>;

  /**
   * Returns an iterable of key, value pairs for every entry in the map.
   */
  entries(): IterableIterator<[K, V]>;

  /**
   * Returns an iterable of keys in the map
   */
  keys(): IterableIterator<K>;

  /**
   * Returns an iterable of values in the map
   */
  values(): IterableIterator<V>;
}

interface ReadonlyMap<K, V> {
  /** Returns an iterable of entries in the map. */
  [Symbol.iterator](): IterableIterator<[K, V]>;

  /**
   * Returns an iterable of key, value pairs for every entry in the map.
   */
  entries(): IterableIterator<[K, V]>;

  /**
   * Returns an iterable of keys in the map
   */
  keys(): IterableIterator<K>;

  /**
   * Returns an iterable of values in the map
   */
  values(): IterableIterator<V>;
}

interface MapConstructor {
  new (): Map<any, any>;
  new <K, V>(iterable?: Iterable<readonly [K, V]> | null): Map<K, V>;
}

interface WeakMap<K extends WeakKey, V> {}

interface WeakMapConstructor {
  new <K extends WeakKey, V>(iterable: Iterable<readonly [K, V]>): WeakMap<K, V>;
}

interface Set<T> {
  /** Iterates over values in the set. */
  [Symbol.iterator](): IterableIterator<T>;
  /**
   * Returns an iterable of [v,v] pairs for every value `v` in the set.
   */
  entries(): IterableIterator<[T, T]>;
  /**
   * Despite its name, returns an iterable of the values in the set.
   */
  keys(): IterableIterator<T>;

  /**
   * Returns an iterable of values in the set.
   */
  values(): IterableIterator<T>;
}

interface ReadonlySet<T> {
  /** Iterates over values in the set. */
  [Symbol.iterator](): IterableIterator<T>;

  /**
   * Returns an iterable of [v,v] pairs for every value `v` in the set.
   */
  entries(): IterableIterator<[T, T]>;

  /**
   * Despite its name, returns an iterable of the values in the set.
   */
  keys(): IterableIterator<T>;

  /**
   * Returns an iterable of values in the set.
   */
  values(): IterableIterator<T>;
}

interface SetConstructor {
  new <T>(iterable?: Iterable<T> | null): Set<T>;
}

interface WeakSet<T extends WeakKey> {}

interface WeakSetConstructor {
  new <T extends WeakKey = WeakKey>(iterable: Iterable<T>): WeakSet<T>;
}

interface Promise<T> {}

interface PromiseConstructor {
  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   * @param values An iterable of Promises.
   * @returns A new Promise.
   */
  all<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>[]>;

  /**
   * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
   * or rejected.
   * @param values An iterable of Promises.
   * @returns A new Promise.
   */
  race<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>>;
}

interface String {
  /** Iterator */
  [Symbol.iterator](): IterableIterator<string>;
}

interface Int8Array {
  [Symbol.iterator](): IterableIterator<number>;
  /**
   * Returns an array of key, value pairs for every entry in the array
   */
  entries(): IterableIterator<[number, number]>;
  /**
   * Returns an list of keys in the array
   */
  keys(): IterableIterator<number>;
  /**
   * Returns an list of values in the array
   */
  values(): IterableIterator<number>;
}

interface Int8ArrayConstructor {
  new (elements: Iterable<number>): Int8Array;

  /**
   * Creates an array from an array-like or iterable object.
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from(arrayLike: Iterable<number>, mapfn?: (v: number, k: number) => number, thisArg?: any): Int8Array;
}

interface Uint8Array {
  [Symbol.iterator](): IterableIterator<number>;
  /**
   * Returns an array of key, value pairs for every entry in the array
   */
  entries(): IterableIterator<[number, number]>;
  /**
   * Returns an list of keys in the array
   */
  keys(): IterableIterator<number>;
  /**
   * Returns an list of values in the array
   */
  values(): IterableIterator<number>;
}

interface Uint8ArrayConstructor {
  new (elements: Iterable<number>): Uint8Array;

  /**
   * Creates an array from an array-like or iterable object.
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from(arrayLike: Iterable<number>, mapfn?: (v: number, k: number) => number, thisArg?: any): Uint8Array;
}

interface Uint8ClampedArray {
  [Symbol.iterator](): IterableIterator<number>;
  /**
   * Returns an array of key, value pairs for every entry in the array
   */
  entries(): IterableIterator<[number, number]>;

  /**
   * Returns an list of keys in the array
   */
  keys(): IterableIterator<number>;

  /**
   * Returns an list of values in the array
   */
  values(): IterableIterator<number>;
}

interface Uint8ClampedArrayConstructor {
  new (elements: Iterable<number>): Uint8ClampedArray;

  /**
   * Creates an array from an array-like or iterable object.
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from(arrayLike: Iterable<number>, mapfn?: (v: number, k: number) => number, thisArg?: any): Uint8ClampedArray;
}

interface Int16Array {
  [Symbol.iterator](): IterableIterator<number>;
  /**
   * Returns an array of key, value pairs for every entry in the array
   */
  entries(): IterableIterator<[number, number]>;

  /**
   * Returns an list of keys in the array
   */
  keys(): IterableIterator<number>;

  /**
   * Returns an list of values in the array
   */
  values(): IterableIterator<number>;
}

interface Int16ArrayConstructor {
  new (elements: Iterable<number>): Int16Array;

  /**
   * Creates an array from an array-like or iterable object.
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from(arrayLike: Iterable<number>, mapfn?: (v: number, k: number) => number, thisArg?: any): Int16Array;
}

interface Uint16Array {
  [Symbol.iterator](): IterableIterator<number>;
  /**
   * Returns an array of key, value pairs for every entry in the array
   */
  entries(): IterableIterator<[number, number]>;
  /**
   * Returns an list of keys in the array
   */
  keys(): IterableIterator<number>;
  /**
   * Returns an list of values in the array
   */
  values(): IterableIterator<number>;
}

interface Uint16ArrayConstructor {
  new (elements: Iterable<number>): Uint16Array;

  /**
   * Creates an array from an array-like or iterable object.
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from(arrayLike: Iterable<number>, mapfn?: (v: number, k: number) => number, thisArg?: any): Uint16Array;
}

interface Int32Array {
  [Symbol.iterator](): IterableIterator<number>;
  /**
   * Returns an array of key, value pairs for every entry in the array
   */
  entries(): IterableIterator<[number, number]>;
  /**
   * Returns an list of keys in the array
   */
  keys(): IterableIterator<number>;
  /**
   * Returns an list of values in the array
   */
  values(): IterableIterator<number>;
}

interface Int32ArrayConstructor {
  new (elements: Iterable<number>): Int32Array;

  /**
   * Creates an array from an array-like or iterable object.
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from(arrayLike: Iterable<number>, mapfn?: (v: number, k: number) => number, thisArg?: any): Int32Array;
}

interface Uint32Array {
  [Symbol.iterator](): IterableIterator<number>;
  /**
   * Returns an array of key, value pairs for every entry in the array
   */
  entries(): IterableIterator<[number, number]>;
  /**
   * Returns an list of keys in the array
   */
  keys(): IterableIterator<number>;
  /**
   * Returns an list of values in the array
   */
  values(): IterableIterator<number>;
}

interface Uint32ArrayConstructor {
  new (elements: Iterable<number>): Uint32Array;

  /**
   * Creates an array from an array-like or iterable object.
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from(arrayLike: Iterable<number>, mapfn?: (v: number, k: number) => number, thisArg?: any): Uint32Array;
}

interface Float32Array {
  [Symbol.iterator](): IterableIterator<number>;
  /**
   * Returns an array of key, value pairs for every entry in the array
   */
  entries(): IterableIterator<[number, number]>;
  /**
   * Returns an list of keys in the array
   */
  keys(): IterableIterator<number>;
  /**
   * Returns an list of values in the array
   */
  values(): IterableIterator<number>;
}

interface Float32ArrayConstructor {
  new (elements: Iterable<number>): Float32Array;

  /**
   * Creates an array from an array-like or iterable object.
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from(arrayLike: Iterable<number>, mapfn?: (v: number, k: number) => number, thisArg?: any): Float32Array;
}

interface Float64Array {
  [Symbol.iterator](): IterableIterator<number>;
  /**
   * Returns an array of key, value pairs for every entry in the array
   */
  entries(): IterableIterator<[number, number]>;
  /**
   * Returns an list of keys in the array
   */
  keys(): IterableIterator<number>;
  /**
   * Returns an list of values in the array
   */
  values(): IterableIterator<number>;
}

interface Float64ArrayConstructor {
  new (elements: Iterable<number>): Float64Array;

  /**
   * Creates an array from an array-like or iterable object.
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from(arrayLike: Iterable<number>, mapfn?: (v: number, k: number) => number, thisArg?: any): Float64Array;
}
interface Generator<T = unknown, TReturn = any, TNext = unknown> extends Iterator<T, TReturn, TNext> {
  // NOTE: 'next' is defined using a tuple to ensure we report the correct assignability errors in all places.
  next(...args: [] | [TNext]): IteratorResult<T, TReturn>;
  return(value: TReturn): IteratorResult<T, TReturn>;
  throw(e: any): IteratorResult<T, TReturn>;
  [Symbol.iterator](): Generator<T, TReturn, TNext>;
}

interface GeneratorFunction {
  /**
   * Creates a new Generator object.
   * @param args A list of arguments the function accepts.
   */
  new (...args: any[]): Generator;
  /**
   * Creates a new Generator object.
   * @param args A list of arguments the function accepts.
   */
  (...args: any[]): Generator;
  /**
   * The length of the arguments.
   */
  readonly length: number;
  /**
   * Returns the name of the function.
   */
  readonly name: string;
  /**
   * A reference to the prototype.
   */
  readonly prototype: Generator;
}

interface GeneratorFunctionConstructor {
  /**
   * Creates a new Generator function.
   * @param args A list of arguments the function accepts.
   */
  new (...args: string[]): GeneratorFunction;
  /**
   * Creates a new Generator function.
   * @param args A list of arguments the function accepts.
   */
  (...args: string[]): GeneratorFunction;
  /**
   * The length of the arguments.
   */
  readonly length: number;
  /**
   * Returns the name of the function.
   */
  readonly name: string;
  /**
   * A reference to the prototype.
   */
  readonly prototype: GeneratorFunction;
}
interface PromiseConstructor {
  /**
   * A reference to the prototype.
   */
  readonly prototype: Promise<any>;

  /**
   * Creates a new Promise.
   * @param executor A callback used to initialize the promise. This callback is passed two arguments:
   * a resolve callback used to resolve the promise with a value or the result of another promise,
   * and a reject callback used to reject the promise with a provided reason or error.
   */
  new <T>(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the provided Promises
   * resolve, or rejected when any Promise is rejected.
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  all<T extends readonly unknown[] | []>(values: T): Promise<{ -readonly [P in keyof T]: Awaited<T[P]>; }>;

  // see: lib.es2015.iterable.d.ts
  // all<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>[]>;

  /**
   * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
   * or rejected.
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  race<T extends readonly unknown[] | []>(values: T): Promise<Awaited<T[number]>>;

  // see: lib.es2015.iterable.d.ts
  // race<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>>;

  /**
   * Creates a new rejected promise for the provided reason.
   * @param reason The reason the promise was rejected.
   * @returns A new rejected Promise.
   */
  reject<T = never>(reason?: any): Promise<T>;

  /**
   * Creates a new resolved promise.
   * @returns A resolved promise.
   */
  resolve(): Promise<void>;
  /**
   * Creates a new resolved promise for the provided value.
   * @param value A promise.
   * @returns A promise whose internal state matches the provided promise.
   */
  resolve<T>(value: T): Promise<Awaited<T>>;
  /**
   * Creates a new resolved promise for the provided value.
   * @param value A promise.
   * @returns A promise whose internal state matches the provided promise.
   */
  resolve<T>(value: T | PromiseLike<T>): Promise<Awaited<T>>;
}

declare var Promise: PromiseConstructor;
interface ProxyHandler<T extends object> {
  /**
   * A trap method for a function call.
   * @param target The original callable object which is being proxied.
   */
  apply?(target: T, thisArg: any, argArray: any[]): any;

  /**
   * A trap for the `new` operator.
   * @param target The original object which is being proxied.
   * @param newTarget The constructor that was originally called.
   */
  construct?(target: T, argArray: any[], newTarget: Function): object;

  /**
   * A trap for `Object.defineProperty()`.
   * @param target The original object which is being proxied.
   * @returns A `Boolean` indicating whether or not the property has been defined.
   */
  defineProperty?(target: T, property: string | symbol, attributes: PropertyDescriptor): boolean;

  /**
   * A trap for the `delete` operator.
   * @param target The original object which is being proxied.
   * @param p The name or `Symbol` of the property to delete.
   * @returns A `Boolean` indicating whether or not the property was deleted.
   */
  deleteProperty?(target: T, p: string | symbol): boolean;

  /**
   * A trap for getting a property value.
   * @param target The original object which is being proxied.
   * @param p The name or `Symbol` of the property to get.
   * @param receiver The proxy or an object that inherits from the proxy.
   */
  get?(target: T, p: string | symbol, receiver: any): any;

  /**
   * A trap for `Object.getOwnPropertyDescriptor()`.
   * @param target The original object which is being proxied.
   * @param p The name of the property whose description should be retrieved.
   */
  getOwnPropertyDescriptor?(target: T, p: string | symbol): PropertyDescriptor | undefined;

  /**
   * A trap for the `[[GetPrototypeOf]]` internal method.
   * @param target The original object which is being proxied.
   */
  getPrototypeOf?(target: T): object | null;

  /**
   * A trap for the `in` operator.
   * @param target The original object which is being proxied.
   * @param p The name or `Symbol` of the property to check for existence.
   */
  has?(target: T, p: string | symbol): boolean;

  /**
   * A trap for `Object.isExtensible()`.
   * @param target The original object which is being proxied.
   */
  isExtensible?(target: T): boolean;

  /**
   * A trap for `Reflect.ownKeys()`.
   * @param target The original object which is being proxied.
   */
  ownKeys?(target: T): ArrayLike<string | symbol>;

  /**
   * A trap for `Object.preventExtensions()`.
   * @param target The original object which is being proxied.
   */
  preventExtensions?(target: T): boolean;

  /**
   * A trap for setting a property value.
   * @param target The original object which is being proxied.
   * @param p The name or `Symbol` of the property to set.
   * @param receiver The object to which the assignment was originally directed.
   * @returns A `Boolean` indicating whether or not the property was set.
   */
  set?(target: T, p: string | symbol, newValue: any, receiver: any): boolean;

  /**
   * A trap for `Object.setPrototypeOf()`.
   * @param target The original object which is being proxied.
   * @param newPrototype The object's new prototype or `null`.
   */
  setPrototypeOf?(target: T, v: object | null): boolean;
}

interface ProxyConstructor {
  /**
   * Creates a revocable Proxy object.
   * @param target A target object to wrap with Proxy.
   * @param handler An object whose properties define the behavior of Proxy when an operation is attempted on it.
   */
  revocable<T extends object>(target: T, handler: ProxyHandler<T>): { proxy: T; revoke: () => void; };

  /**
   * Creates a Proxy object. The Proxy object allows you to create an object that can be used in place of the
   * original object, but which may redefine fundamental Object operations like getting, setting, and defining
   * properties. Proxy objects are commonly used to log property accesses, validate, format, or sanitize inputs.
   * @param target A target object to wrap with Proxy.
   * @param handler An object whose properties define the behavior of Proxy when an operation is attempted on it.
   */
  new <T extends object>(target: T, handler: ProxyHandler<T>): T;
}
declare var Proxy: ProxyConstructor;
declare namespace Reflect {
  /**
   * Calls the function with the specified object as the this value
   * and the elements of specified array as the arguments.
   * @param target The function to call.
   * @param thisArgument The object to be used as the this object.
   * @param argumentsList An array of argument values to be passed to the function.
   */
  function apply<T, A extends readonly any[], R>(
      target: (this: T, ...args: A) => R,
      thisArgument: T,
      argumentsList: Readonly<A>,
  ): R;
  function apply(target: Function, thisArgument: any, argumentsList: ArrayLike<any>): any;

  /**
   * Constructs the target with the elements of specified array as the arguments
   * and the specified constructor as the `new.target` value.
   * @param target The constructor to invoke.
   * @param argumentsList An array of argument values to be passed to the constructor.
   * @param newTarget The constructor to be used as the `new.target` object.
   */
  function construct<A extends readonly any[], R>(
      target: new (...args: A) => R,
      argumentsList: Readonly<A>,
      newTarget?: new (...args: any) => any,
  ): R;
  function construct(target: Function, argumentsList: ArrayLike<any>, newTarget?: Function): any;

  /**
   * Adds a property to an object, or modifies attributes of an existing property.
   * @param target Object on which to add or modify the property. This can be a native JavaScript object
   *        (that is, a user-defined object or a built in object) or a DOM object.
   * @param propertyKey The property name.
   * @param attributes Descriptor for the property. It can be for a data property or an accessor property.
   */
  function defineProperty(target: object, propertyKey: PropertyKey, attributes: PropertyDescriptor & ThisType<any>): boolean;

  /**
   * Removes a property from an object, equivalent to `delete target[propertyKey]`,
   * except it won't throw if `target[propertyKey]` is non-configurable.
   * @param target Object from which to remove the own property.
   * @param propertyKey The property name.
   */
  function deleteProperty(target: object, propertyKey: PropertyKey): boolean;

  /**
   * Gets the property of target, equivalent to `target[propertyKey]` when `receiver === target`.
   * @param target Object that contains the property on itself or in its prototype chain.
   * @param propertyKey The property name.
   * @param receiver The reference to use as the `this` value in the getter function,
   *        if `target[propertyKey]` is an accessor property.
   */
  function get<T extends object, P extends PropertyKey>(
      target: T,
      propertyKey: P,
      receiver?: unknown,
  ): P extends keyof T ? T[P] : any;

  /**
   * Gets the own property descriptor of the specified object.
   * An own property descriptor is one that is defined directly on the object and is not inherited from the object's prototype.
   * @param target Object that contains the property.
   * @param propertyKey The property name.
   */
  function getOwnPropertyDescriptor<T extends object, P extends PropertyKey>(
      target: T,
      propertyKey: P,
  ): TypedPropertyDescriptor<P extends keyof T ? T[P] : any> | undefined;

  /**
   * Returns the prototype of an object.
   * @param target The object that references the prototype.
   */
  function getPrototypeOf(target: object): object | null;

  /**
   * Equivalent to `propertyKey in target`.
   * @param target Object that contains the property on itself or in its prototype chain.
   * @param propertyKey Name of the property.
   */
  function has(target: object, propertyKey: PropertyKey): boolean;

  /**
   * Returns a value that indicates whether new properties can be added to an object.
   * @param target Object to test.
   */
  function isExtensible(target: object): boolean;

  /**
   * Returns the string and symbol keys of the own properties of an object. The own properties of an object
   * are those that are defined directly on that object, and are not inherited from the object's prototype.
   * @param target Object that contains the own properties.
   */
  function ownKeys(target: object): (string | symbol)[];

  /**
   * Prevents the addition of new properties to an object.
   * @param target Object to make non-extensible.
   * @return Whether the object has been made non-extensible.
   */
  function preventExtensions(target: object): boolean;

  /**
   * Sets the property of target, equivalent to `target[propertyKey] = value` when `receiver === target`.
   * @param target Object that contains the property on itself or in its prototype chain.
   * @param propertyKey Name of the property.
   * @param receiver The reference to use as the `this` value in the setter function,
   *        if `target[propertyKey]` is an accessor property.
   */
  function set<T extends object, P extends PropertyKey>(
      target: T,
      propertyKey: P,
      value: P extends keyof T ? T[P] : any,
      receiver?: any,
  ): boolean;
  function set(target: object, propertyKey: PropertyKey, value: any, receiver?: any): boolean;

  /**
   * Sets the prototype of a specified object o to object proto or null.
   * @param target The object to change its prototype.
   * @param proto The value of the new prototype or null.
   * @return Whether setting the prototype was successful.
   */
  function setPrototypeOf(target: object, proto: object | null): boolean;
}
interface SymbolConstructor {
  /**
   * A reference to the prototype.
   */
  readonly prototype: Symbol;

  /**
   * Returns a new unique Symbol value.
   * @param  description Description of the new Symbol object.
   */
  (description?: string | number): symbol;

  /**
   * Returns a Symbol object from the global symbol registry matching the given key if found.
   * Otherwise, returns a new symbol with this key.
   * @param key key to search for.
   */
  for(key: string): symbol;

  /**
   * Returns a key from the global symbol registry matching the given Symbol if found.
   * Otherwise, returns a undefined.
   * @param sym Symbol to find the key for.
   */
  keyFor(sym: symbol): string | undefined;
}

declare var Symbol: SymbolConstructor;
interface SymbolConstructor {
  /**
   * A method that determines if a constructor object recognizes an object as one of the
   * constructor’s instances. Called by the semantics of the instanceof operator.
   */
  readonly hasInstance: unique symbol;

  /**
   * A Boolean value that if true indicates that an object should flatten to its array elements
   * by Array.prototype.concat.
   */
  readonly isConcatSpreadable: unique symbol;

  /**
   * A regular expression method that matches the regular expression against a string. Called
   * by the String.prototype.match method.
   */
  readonly match: unique symbol;

  /**
   * A regular expression method that replaces matched substrings of a string. Called by the
   * String.prototype.replace method.
   */
  readonly replace: unique symbol;

  /**
   * A regular expression method that returns the index within a string that matches the
   * regular expression. Called by the String.prototype.search method.
   */
  readonly search: unique symbol;

  /**
   * A function valued property that is the constructor function that is used to create
   * derived objects.
   */
  readonly species: unique symbol;

  /**
   * A regular expression method that splits a string at the indices that match the regular
   * expression. Called by the String.prototype.split method.
   */
  readonly split: unique symbol;

  /**
   * A method that converts an object to a corresponding primitive value.
   * Called by the ToPrimitive abstract operation.
   */
  readonly toPrimitive: unique symbol;

  /**
   * A String value that is used in the creation of the default string description of an object.
   * Called by the built-in method Object.prototype.toString.
   */
  readonly toStringTag: unique symbol;

  /**
   * An Object whose truthy properties are properties that are excluded from the 'with'
   * environment bindings of the associated objects.
   */
  readonly unscopables: unique symbol;
}

interface Symbol {
  /**
   * Converts a Symbol object to a symbol.
   */
  [Symbol.toPrimitive](hint: string): symbol;

  readonly [Symbol.toStringTag]: string;
}

interface Array<T> {
  /**
   * Is an object whose properties have the value 'true'
   * when they will be absent when used in a 'with' statement.
   */
  readonly [Symbol.unscopables]: {
      [K in keyof any[]]?: boolean;
  };
}

interface ReadonlyArray<T> {
  /**
   * Is an object whose properties have the value 'true'
   * when they will be absent when used in a 'with' statement.
   */
  readonly [Symbol.unscopables]: {
      [K in keyof readonly any[]]?: boolean;
  };
}

interface Date {
  /**
   * Converts a Date object to a string.
   */
  [Symbol.toPrimitive](hint: "default"): string;
  /**
   * Converts a Date object to a string.
   */
  [Symbol.toPrimitive](hint: "string"): string;
  /**
   * Converts a Date object to a number.
   */
  [Symbol.toPrimitive](hint: "number"): number;
  /**
   * Converts a Date object to a string or number.
   *
   * @param hint The strings "number", "string", or "default" to specify what primitive to return.
   *
   * @throws {TypeError} If 'hint' was given something other than "number", "string", or "default".
   * @returns A number if 'hint' was "number", a string if 'hint' was "string" or "default".
   */
  [Symbol.toPrimitive](hint: string): string | number;
}

interface Map<K, V> {
  readonly [Symbol.toStringTag]: string;
}

interface WeakMap<K extends WeakKey, V> {
  readonly [Symbol.toStringTag]: string;
}

interface Set<T> {
  readonly [Symbol.toStringTag]: string;
}

interface WeakSet<T extends WeakKey> {
  readonly [Symbol.toStringTag]: string;
}

interface JSON {
  readonly [Symbol.toStringTag]: string;
}

interface Function {
  /**
   * Determines whether the given value inherits from this function if this function was used
   * as a constructor function.
   *
   * A constructor function can control which objects are recognized as its instances by
   * 'instanceof' by overriding this method.
   */
  [Symbol.hasInstance](value: any): boolean;
}

interface GeneratorFunction {
  readonly [Symbol.toStringTag]: string;
}

interface Math {
  readonly [Symbol.toStringTag]: string;
}

interface Promise<T> {
  readonly [Symbol.toStringTag]: string;
}

interface PromiseConstructor {
  readonly [Symbol.species]: PromiseConstructor;
}

interface RegExp {
  /**
   * Matches a string with this regular expression, and returns an array containing the results of
   * that search.
   * @param string A string to search within.
   */
  [Symbol.match](string: string): RegExpMatchArray | null;

  /**
   * Replaces text in a string, using this regular expression.
   * @param string A String object or string literal whose contents matching against
   *               this regular expression will be replaced
   * @param replaceValue A String object or string literal containing the text to replace for every
   *                     successful match of this regular expression.
   */
  [Symbol.replace](string: string, replaceValue: string): string;

  /**
   * Replaces text in a string, using this regular expression.
   * @param string A String object or string literal whose contents matching against
   *               this regular expression will be replaced
   * @param replacer A function that returns the replacement text.
   */
  [Symbol.replace](string: string, replacer: (substring: string, ...args: any[]) => string): string;

  /**
   * Finds the position beginning first substring match in a regular expression search
   * using this regular expression.
   *
   * @param string The string to search within.
   */
  [Symbol.search](string: string): number;

  /**
   * Returns an array of substrings that were delimited by strings in the original input that
   * match against this regular expression.
   *
   * If the regular expression contains capturing parentheses, then each time this
   * regular expression matches, the results (including any undefined results) of the
   * capturing parentheses are spliced.
   *
   * @param string string value to split
   * @param limit if not undefined, the output array is truncated so that it contains no more
   * than 'limit' elements.
   */
  [Symbol.split](string: string, limit?: number): string[];
}

interface RegExpConstructor {
  readonly [Symbol.species]: RegExpConstructor;
}

interface String {
  /**
   * Matches a string or an object that supports being matched against, and returns an array
   * containing the results of that search, or null if no matches are found.
   * @param matcher An object that supports being matched against.
   */
  match(matcher: { [Symbol.match](string: string): RegExpMatchArray | null; }): RegExpMatchArray | null;

  /**
   * Passes a string and {@linkcode replaceValue} to the `[Symbol.replace]` method on {@linkcode searchValue}. This method is expected to implement its own replacement algorithm.
   * @param searchValue An object that supports searching for and replacing matches within a string.
   * @param replaceValue The replacement text.
   */
  replace(searchValue: { [Symbol.replace](string: string, replaceValue: string): string; }, replaceValue: string): string;

  /**
   * Replaces text in a string, using an object that supports replacement within a string.
   * @param searchValue A object can search for and replace matches within a string.
   * @param replacer A function that returns the replacement text.
   */
  replace(searchValue: { [Symbol.replace](string: string, replacer: (substring: string, ...args: any[]) => string): string; }, replacer: (substring: string, ...args: any[]) => string): string;

  /**
   * Finds the first substring match in a regular expression search.
   * @param searcher An object which supports searching within a string.
   */
  search(searcher: { [Symbol.search](string: string): number; }): number;

  /**
   * Split a string into substrings using the specified separator and return them as an array.
   * @param splitter An object that can split a string.
   * @param limit A value used to limit the number of elements returned in the array.
   */
  split(splitter: { [Symbol.split](string: string, limit?: number): string[]; }, limit?: number): string[];
}

interface ArrayBuffer {
  readonly [Symbol.toStringTag]: string;
}

interface DataView {
  readonly [Symbol.toStringTag]: string;
}

interface Int8Array {
  readonly [Symbol.toStringTag]: "Int8Array";
}

interface Uint8Array {
  readonly [Symbol.toStringTag]: "Uint8Array";
}

interface Uint8ClampedArray {
  readonly [Symbol.toStringTag]: "Uint8ClampedArray";
}

interface Int16Array {
  readonly [Symbol.toStringTag]: "Int16Array";
}

interface Uint16Array {
  readonly [Symbol.toStringTag]: "Uint16Array";
}

interface Int32Array {
  readonly [Symbol.toStringTag]: "Int32Array";
}

interface Uint32Array {
  readonly [Symbol.toStringTag]: "Uint32Array";
}

interface Float32Array {
  readonly [Symbol.toStringTag]: "Float32Array";
}

interface Float64Array {
  readonly [Symbol.toStringTag]: "Float64Array";
}

interface ArrayConstructor {
  readonly [Symbol.species]: ArrayCOmitonstructor;
}
interface MapConstructor {
  readonly [Symbol.species]: MapConstructor;
}
interface SetConstructor {
  readonly [Symbol.species]: SetConstructor;
}
interface ArrayBufferConstructor {
  readonly [Symbol.species]: ArrayBufferConstructor;
}

declare function prompt(message:? string, _default?: string): string;
