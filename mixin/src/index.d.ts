/*
___________________________________________________________________________________________________________________________
================
    ts-mixin
================

A Module for easily implementing typed mixin classes in TypeScript

~ Chase M. Allen
Updated: 12-2020
___________________________________________________________________________________________________________________________
*/



export { };

declare global {

    namespace __Mixins_private__ {

        type Constructor<T extends {} = {}> = new (...args: any[]) => T;

        type _ = undefined;
    
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
    
        type MixinSingleArg<T> = cc<T>;
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

    }

    /**
     * A Module for easily implementing typed mixin classes in TypeScript
     *
     * ~ Chase M. Allen — Updated: 12-2020
    */
    namespace Mixins {

        /**
         * Applies the variadic set of base classes to the decorated class
         * 
         * (Does not enforce any contracts for implementing the provided base classes. See 'tmixin' for type support)
         * @param baseClasses A variadic array of classes to mixin
        */
        function mixin
            (...baseClasses: any[]): (constructor: __Mixins_private__.Constructor<unknown>) => void;
        /**
         * Applies the variadic set of base classes to the decorated class
         * 
         * (Does not enforce any contracts for implementing the provided base classes. See 'tmixin' for type support)
         * @param inheritAll Whether to mixin the base classes' entire prototype chains or just the base class(es)
         * @param baseClasses A variadic array of classes to mixin
        */
        function mixin
            (inheritAll: boolean, ...baseClasses: any[]): (constructor: __Mixins_private__.Constructor<unknown>) => void;

        
        /** Applies the variadic set of base classes to the decorated class, 
         * and enforces the class' contract in the type system. 
         * 
         * Supports up to 7 typed base classes.
         * 
         * For abstract class support, pass the abstract class as a constructor (See below example)
         * @param baseClass A base class to mixin
         * @param baseClasses A variadic array of classes to mixin
         * @example
         * ``` typescript
         * abstract class A<T> {}
         * 
         * ＠tmixin(A as new () => A<never>)
         * class AA {}
         * ```
        */
        function tmixin
            <T extends __Mixins_private__._ctor_ = __Mixins_private__._, U extends __Mixins_private__._ctor_  = __Mixins_private__._, 
            V extends __Mixins_private__._ctor_  = __Mixins_private__._, W extends __Mixins_private__._ctor_  = __Mixins_private__._, 
            X extends __Mixins_private__._ctor_  = __Mixins_private__._, Y extends __Mixins_private__._ctor_  = __Mixins_private__._, 
            Z extends __Mixins_private__._ctor_  = __Mixins_private__._>
            (baseClass: __Mixins_private__.MixinSingleArg<T>, ...baseClasses: __Mixins_private__.MixinArgs<U, V, W, X, Y, Z, undefined> | []):
                <J extends __Mixins_private__.MixinParsedArgsKeys<T, U, V, W, X, Y, Z>>(constructor: J) => void;
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
         * ＠tmixin(false, A as new () => A<never>)
         * class AA {}
         * ```
        */
        function tmixin
            <T extends __Mixins_private__._ctor_ = __Mixins_private__._, U extends __Mixins_private__._ctor_  = __Mixins_private__._, 
            V extends __Mixins_private__._ctor_  = __Mixins_private__._, W extends __Mixins_private__._ctor_  = __Mixins_private__._, 
            X extends __Mixins_private__._ctor_  = __Mixins_private__._, Y extends __Mixins_private__._ctor_  = __Mixins_private__._, 
            Z extends __Mixins_private__._ctor_  = __Mixins_private__._>
            (inheritAll: boolean, ...baseClasses: __Mixins_private__.MixinArgs<T, U, V, W, X, Y, Z>):
                <J extends __Mixins_private__.MixinParsedArgsKeys<T, U, V, W, X, Y, Z>>(constructor: J) => void;

    }
}