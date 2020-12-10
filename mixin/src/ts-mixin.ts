  
/*
___________________________________________________________________________________________________________________________
A Module for easily implementing typed mixin classes in TypeScript

~ Chase M. Allen
Updated: 12-2020
___________________________________________________________________________________________________________________________
*/



namespace Mixins { //Begin Namespace

    //---------------------------------------------------------------------------------------------------------------
    // ++ ANCHOR Common Types
    //---------------------------------------------------------------------------------------------------------------

    type Constructor<T extends {} = {}> = new (...args: any[]) => T;

    //---------------------------------------------------------------------------------------------------------------



    //---------------------------------------------------------------------------------------------------------------
    // ++ ANCHOR Mixin Type System
    //---------------------------------------------------------------------------------------------------------------

    const __ = <undefined>null;
    type _ = typeof __;

    type _ctor_ = (new (...args: any[]) => any);
    type ctor = Constructor<unknown>;
    type cc<T> = T & ctor;

    type t1<T extends ctor> = [T];
    type t2<T extends ctor, U extends ctor> = [T, U];
    type t3<T extends ctor, U extends ctor, V extends ctor> = [T, U, V];
    type t4<T extends ctor, U extends ctor, V extends ctor, W extends ctor> = [T, U, V, W];
    type t5<T extends ctor, U extends ctor, V extends ctor, W extends ctor, X extends ctor> = [T, U, V, W, X];
    type t6<T extends ctor, U extends ctor, V extends ctor, W extends ctor, X extends ctor, Y extends ctor> = [T, U, V, W, X, Y];
    type t7<T extends ctor, U extends ctor, V extends ctor, W extends ctor, X extends ctor, Y extends ctor, Z extends ctor> = [T, U, V, W, X, Y, Z];

    type c<T extends ctor, U extends ctor, V extends ctor, W extends ctor, X extends ctor, Y extends ctor, Z extends ctor>
        = t1<T> | t2<T, U> | t3<T, U, V> | t4<T, U, V, W> | t5<T, U, V, W, X> | t6<T, U, V, W, X, Y> | t7<T, U, V, W, X, Y, Z>;

    type d<T, U, V, W, X, Y, Z, R extends unknown[], N extends number> 
    = R['length'] extends N ? 
        U extends _ ? t1<cc<T>> : 
        V extends _ ? t2<cc<T>, cc<U>> :
        W extends _ ? t3<cc<T>, cc<U>, cc<V>> :
        X extends _ ? t4<cc<T>, cc<U>, cc<V>, cc<W>> :
        Y extends _ ? t5<cc<T>, cc<U>, cc<V>, cc<W>, cc<X>> :
        Z extends _ ? t6<cc<T>, cc<U>, cc<V>, cc<W>, cc<X>, cc<Y>>
        : t7<cc<T>, cc<U>, cc<V>, cc<W>, cc<X>, cc<Y>, cc<Z>>
    : [...R];

    type MixinArgs<T, U, V, W, X, Y, Z> = c<cc<T>, cc<U>, cc<V>, cc<W>, cc<X>, cc<Y>, cc<Z>>;
    type MixinArgsParsed<T, U, V, W, X, Y, Z, R extends MixinArgs<T, U, V, W, X, Y, Z>> 
        = d<T, U, V, W, X, Y, Z, R, R['length']>;

    type MixinParsedArgsKeys<T, U, V, W, X, Y, Z> 
        = U extends _ ? T : 
        V extends _ ? T & U :
        W extends _ ? T & U & V :
        X extends _ ? T | U | V | W :
        Y extends _ ? T | U | V | W | X :
        Z extends _ ? T | U | V | W | X | Y
        : T | U | V | W | X |Y | Z;

    //---------------------------------------------------------------------------------------------------------------



    //---------------------------------------------------------------------------------------------------------------
    // ++ ANCHOR Namespace Exports
    //---------------------------------------------------------------------------------------------------------------

    export declare const mixin:
        (inheritAll: boolean, ...baseClasses: any[]) => (constructor: Constructor<unknown>) => void;


    export declare const tmixin:
        <T extends _ctor_ = _, U extends _ctor_  = _, V extends _ctor_  = _, 
        W extends _ctor_  = _, X extends _ctor_  = _, Y extends _ctor_  = _, Z extends _ctor_  = _>
        (inheritAll: boolean, ...baseClasses: MixinArgs<T, U, V, W, X, Y, Z>) => 
            <J extends MixinParsedArgsKeys<T, U, V, W, X, Y, Z>>(constructor: J) => void;

    //---------------------------------------------------------------------------------------------------------------



    //---------------------------------------------------------------------------------------------------------------
    // ++ ANCHOR Namespace Exporter Factory
    //---------------------------------------------------------------------------------------------------------------

    (function (this: any, factory: (exporter: <K extends keyof typeof Mixins>(key: K, value: typeof Mixins[K]) => void) => void) {
        const root = typeof global === 'object' ? global :
            typeof self === 'object' ? self :
            typeof this === 'object' ? this :
            Function('return this;')();

        let exporter = makeExporter(Mixins);
        if (typeof root.Mixins === 'undefined') {
            root.Mixins = Mixins;
        } else {
            exporter = makeExporter(root.Mixins, exporter);
        }

        factory(exporter);

        function makeExporter(target: typeof Mixins, previous?: <K extends keyof typeof Mixins>(key: K, value: typeof Mixins[K]) => void) {
            return <K extends keyof typeof Mixins>(key: K, value: typeof Mixins[K]) => {
                if (typeof target[key] !== "function") {
                    Object.defineProperty(target, key, { configurable: true, writable: true, value });
                }
                if (previous) previous(key, value);
            };
        }
    })//Do NOT put a semicolon here

    //---------------------------------------------------------------------------------------------------------------



    (function (exporter) { //Begin Exporter Factory

    //---------------------------------------------------------------------------------------------------------------
    // ++ ANCHOR Reflection / Mixin Logic
    //---------------------------------------------------------------------------------------------------------------

    const __applyMixins__ = (derivedConstructor: any, baseConstructors: any[]) => {
        baseConstructors.forEach(baseConstructor => {
            if (baseConstructor === undefined) { return; }
            Object.getOwnPropertyNames(baseConstructor.prototype).forEach(name => {
                Object.defineProperty(derivedConstructor.prototype, name,
                    Object.getOwnPropertyDescriptor(baseConstructor.prototype, name));
            });
        });
    };


    const getProtoTypeChain = (obj: Object): Object[] => {
        var cs: Object[] = [], pt: Object = obj;
        do {
            if (pt = (<Object>Reflect.getPrototypeOf(pt))) { 
                if (pt.constructor.name != 'Object') {
                    cs.push(pt || null); 
                }
            }
        } while (pt != null);
        return cs;
    };

    //--------------------------------------------------------------------------------------------------------------- 



    //---------------------------------------------------------------------------------------------------------------
    // ++ ANCHOR Standard Mixin Class Decorators
    //---------------------------------------------------------------------------------------------------------------

    /**
     * Applies the variadic set of base classes to the decorated class
     * 
     * (Does not enforce any contracts for implementing the provided base classes. See 'tmixin' for type support)
     * @param inheritAll Whether to mixin the base classes' entire prototype chains or just the base class(es)
     * @param baseClasses A variadic array of classes to mixin
    */
    const mixin = (inheritAll: boolean, ...baseClasses: any[]) => {
        return !inheritAll ?
            ((constructor: Constructor<unknown>) => {
                __applyMixins__(constructor, baseClasses);
            })
        : mixin_all(...baseClasses);
    };
    exporter('mixin', mixin);


    const mixin_all = (...baseClasses: any[]) => {
        const newArr: Function[] = [];
        baseClasses.forEach( (val) => { 
            const chain = getProtoTypeChain(val);
            chain.forEach( (val: Function) => {
                const name = val.name.trim();
                if (name != '') { newArr.push(val); }
            });
        });

        newArr.push(...baseClasses);
        return ((constructor: Constructor<unknown>) => {
            __applyMixins__(constructor, newArr);
        });
    };

    //---------------------------------------------------------------------------------------------------------------



    //---------------------------------------------------------------------------------------------------------------
    // ++ ANCHOR Typed Mixin Class Decorators
    //---------------------------------------------------------------------------------------------------------------

    /** Applies the variadic set of base classes to the decorated class, 
     * and enforces the class' contract in the type system. 
     * 
     * Supports up to 7 typed base classes.
     * 
     * For abstract class support, pass the abstract class as a constructor (See below example)
     * @param inheritAll Whether to mixin the base classes' entire prototype chains or just the base class(es)
     * @param baseClasses A variadic array of classes to mixin
     * @example
     * ``` typescript
     * abstract class A<T> {}
     * 
     * tmixin(false, A as new () => A<never>)
     * class AA {}
     * ```
    */
    const tmixin = 
    <T extends _ctor_ = _, U extends _ctor_  = _, V extends _ctor_  = _, 
    W extends _ctor_  = _, X extends _ctor_  = _, Y extends _ctor_  = _, Z extends _ctor_  = _>
    (inheritAll: boolean, ...baseClasses: MixinArgs<T, U, V, W, X, Y, Z>) => {
        let args = baseClasses as MixinArgsParsed<T, U, V, W, X, Y, Z, typeof baseClasses>;
        return !inheritAll ?
            ( <J extends MixinParsedArgsKeys<T, U, V, W, X, Y, Z>>(constructor: J) => {
                __applyMixins__(constructor, args);
            })
        : tmixin_all<T, U, V, W, X, Y, Z>(...baseClasses);
    };
    exporter('tmixin', tmixin);


    const tmixin_all = 
    <T extends _ctor_ = _, U extends _ctor_  = _, V extends _ctor_  = _, 
    W extends _ctor_  = _, X extends _ctor_  = _, Y extends _ctor_  = _, Z extends _ctor_  = _>
    (...baseClasses: MixinArgs<T, U, V, W, X, Y, Z>) => {
        const args = baseClasses as MixinArgsParsed<T, U, V, W, X, Y, Z, typeof baseClasses>;
        const newArr: Function[] = [];

        args.forEach( (child: Function) => {
            if (child === undefined) { return; }
            const chain = getProtoTypeChain(child);
            chain.forEach( (base: Function) => {
                const name = base.name.trim();
                if (name != '') { newArr.push(base); }
            });
        });

        newArr.push(...args);
        return (<J extends MixinParsedArgsKeys<T, U, V, W, X, Y, Z>>(constructor: J) => {
            __applyMixins__(constructor, newArr);
        });
    };

    //---------------------------------------------------------------------------------------------------------------

    }); //End of Exporter Factory

} // End of Namespace