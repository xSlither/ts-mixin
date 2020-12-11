# ts-mixin

*A Module for simplifying strictly-typed multiple inheritance within TypeScript*

## Installing

Installing `ts-mixin` is really simple. First install the npm package and `reflect-metadata` into your project:

```batchfile
npm i typescript-mixin reflect-metadata 
```

Next, you just need to configure your `tsconfig.json` to enable experimental decorators and decorator metadata:

```json
"compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
}
```

## What does this module do?

`ts-mixin` aims to provide a simple way to define multiple-inheritance for classes, while also (optionally) enforcing typed contracts, within TypeScript. `ts-mixin` exposes two overloaded decorators that allow for strictly-typed or non-typed multiple inheritance: `tmixin()` and `mixin()`.

If you are not familiar with multiple-inheritance, I recommend taking a look at the following resources; they demonstrate both the usefulness and limitations mixin classes have in Python, which also translates to how they can be used in TypeScript. Specifically, take note of the limitations mixins have with constructors as well as the diamond problem, as it's critical to how you design your inheritance:

* [this Stack Overflow thread](https://stackoverflow.com/questions/533631/what-is-a-mixin-and-why-are-they-useful)
* [this Python article](https://www.thedigitalcatonline.com/blog/2020/03/27/mixin-classes-in-python/)

## Some Simple Examples

Let's take a look at a basic example where we want to mixin a couple classes into an existing child class that we will inherit from. This example also points out some of the limitations that exist regarding access to constructors, and how properties are set:

```typescript
import 'typescript-mixin';

class Animal {
    species: string;
    id: number = 1;
    constructor(species: string) { this.species = species }
    eat() { console.log('Animal has eaten'); }
}

class Person<T> {
    name: string;
    id: number = 0;
    constructor(name: string) { this.name = name; }
    speak() { console.log(`${this.name} has spoken`); }
}

abstract class WarehouseEmployee<T> {
    building: string;

    constructor(building: string) {
        this.building = building;
    }
}

@Mixins.tmixin(Animal, Person)
class Employee<T> extends WarehouseEmployee<T> {  
    constructor(name: string) {
        super('E');
        this.id = 22;
        this.name = name;
    }  
}
interface Employee<T> extends Person<T>, Animal //Required if using 'tmixin', but not if using 'mixin'


class Chase extends Employee<string> {
    constructor() {
        super('Chase');
    }
}

const x = new Chase();
x.eat(); // Animal has eaten
x.speak(); // Chase has spoken
console.log(x); // Chase { building: 'E', id: 22, name: 'Chase' }
```
#### Method Inheritance vs. Property Inheritance
In the above example, the 'Employee' class is able to successfully inherit from Animal and Person, as well as directly extend from the abstract class 'WarehouseEmployee<T>'. This means that we are able to call those classes methods, but properties are a bit different. Properties are set via a constructor, and mixin constructors are not called, as you can see in the above example; the WarehouseEmployee's constructor is called when Employee invokes super(). 
  
This means it's up to the implementing class to set the properties defined in the mixins or leave them undefined, which TypeScript makes easy as the properties are recogonized as part of the type.

#### Constructor Definitions on Mixin Classes
Another limitation with mix-in classes is with constructor definitions. It's suggested not use constructors in mix-in classes at all. However, sometimes in a complicated system a class might need to be used as both a standalone instance as well as a mix-in. If your constructors are not compatible, TypeScript will not let you use them both in the same decorator statement. 

A workaround is to either use multiple decorators or take a complex approach; if you are interested in the latter, please see further below for a stronger example.

#### The Mixed-In Interface
Also, note the interface defined for 'Employee'. This declaration allows TypeScript to recognize that the mixin classes are part of the type. Without this declaration, you cannot use an object of the 'Employee' type to make calls to the mixin class methods/properties, and it would need to be casted, first. The `tmixin` decorator requires that this contract exists and is correct using duck typing. The `mixin` decorator will not require that the interface be declared.
 
### Decorator Overloads
 
The decorators also have an additional overload that allows for a boolean argument to be passed in front of the variadic array of classes, which is assumed as False by default. If the flag is provided, then the entire inheritance tree is also mixed-in with the implementing class. Here is an example:
```typescript
import 'typescript-mixin';

class Animal {
  species: string;
  constructor(species: string) {
    this.species = species;
  }
  eat() { console.log(`${this.species} has eaten`); }
}

class Person extends Animal {
  name: string;
  constructor(name: string) {
    super('human');
    this.name = name;
  }
  speak() { console.log(`${this.name} has spoken`); }
}

class Organism {
  id: string;
}

@Mixins.tmixin(true, Person, Organism)
class Chase {
  constructor() {
    this.id = '72';
    this.name = 'Chase';
  }
}
interface Chase extends Person, Organism {}

const x = new Chase();
x.eat(); // undefined has eaten
x.speak(); // Chase has spoken
console.log(x); // Organism { id: '72', name: 'Chase' }
```
#### Mixin class inheritance
As you can see, because that `true` flag is passed in front of the classes, both Person and Animal are mixed in, rather than just Person. This behavior starts to deviate from the concept of using mixins as small, well-defined components that serve a singular purpose. With that said, I've found use cases where one can safely use this behavior to shorthand the mixin decorator statements.

Also, note that the above example again demonstrates the issue with the constructors of a mixin; the property 'species' is never defined, and, 'name' is only set because class 'Chase' explicitly did so. This will affect how you design your inheritance. A better solution in this sample would have been not to use mixins at all. However, in a pattern where mixins do serve a purpose, a way to workaround this problem is by exposing methods in the mixin classes that act as a constructor, and calling those from the implementing class.

### Abstract Class Mixins

Another limitation you might find with TypeScript mixins is with abstract classes. Attempting to use `tmixin` to mix-in an abstract class will result in a compilation error, as the constructor definition does not match. To workaround this issue and still use an abstract class, simply cast the constructor like so:
```typescript
abstract class A<T> {}

@tmixin(A as new () => A<never>)
class AA {}
```

## A Real-World Example

For last I've saved a much more complicated example of a scenario where mixin classes are used to simplify expected expansions to a library. This example also demonstrates some interesting patterns that can be used along with multiple inheritance, as well as optional features that my other module, [ts-westworld](https://github.com/xSlither/ts-WestWorld), offers, to enforce contracts in this example.

To view the full sample, see [this link](https://github.com/xSlither/ts-mixin/blob/master/tests/src/test2.ts). You can use the below, in-depth, explanations to help understand how the code works, and what it's purpose is.

#### Context

An internal library exists for interacting with a large third-party system via automation. The library features a series of classes and base classes that allow for defining interaction on certain pages or windows of the system. It also features a separate series of classes that retrieve XML data via web API requests.

These classes are used independently in several existing processes. However, the data is very useful when used together- you would like to be able to define classes that can relate data from specific XML responses and interaction of the corrleated page in the system where the data is actually displayed in a UI.

> For a more general way of putting it, READ vs. WRITE actions with the system are independent and use separate endpoints.

Most importantly, you want the DRY-est approach possible. The system is very large, and the library young, and you don't want you or your team to keep writing boilerplate code as the library continues to expand. You also want your classes to be strongly typed, so that intellisense will do the rest for those that implement them. Finally, you want the type system to enforce your solution- errors that leak into runtime will be difficult to debug.

#### Base Interactor Class Definitions

Let's get started.

The following are some declartions for the classes that are "interactors" for the system:
```typescript
class ReferenceItem { public id: string; }

abstract class StandardInteractor { 
    private _MyPage: ReferenceItem;
    public get MyPage(): ReferenceItem { return this._MyPage; }
    constructor(item: ReferenceItem) { this._MyPage = item; }
    SomeBaseMethod() { return 'test0'; }
}

class AbstractInteractor extends StandardInteractor {
    SomeGenericMethod() { return 'test1'; }
}
class TabbedInteractor extends AbstractInteractor {
    SomeSpecificMethod() { return 'test2'; }
}
class SpecialTabbedInteractor extends TabbedInteractor {
    SomeVerySpecificMethod() { return 'test3'; }
}
```

#### Base XML Page Definitions

The following are some declarations for the classes that act as specific XML parsers/web api interactors :
```typescript
interface IScriptPage {
    ManuScriptTopic: string;
    ManuScriptPageName: string;

    CreateAsync(page: ReferenceItem): Promise<ScriptPageBase>;
}

//@WestWorld.usesAbstractImplementsOf(InterfacesContainer, 'IScriptPage')
class ScriptPageBase {
    public ManuScript: string;
    public MyItem: ReferenceItem;

    constructor(item: ReferenceItem, script: string) {
        this.MyItem = item;
        this.ManuScript = script;
    }

    protected static async CreateAsyncBase(item: ReferenceItem, ManuScriptPage: IScriptPage): Promise<ScriptPageBase> {
        let xml = 'some xml' //some call that gets XML data using the IScriptPage properties
        return new ScriptPageBase(item, xml);
    }
}
```
Note that the commented-out decorator for 'usesAbstractImplementsOf' would require at run-time that any implementing class uses the IScriptPage interface. Using the decorator does not affect functionality; it only enforces the abstract inheritance pattern used.

#### XML Parsing Logic

This is just some static class that does XML parsing for us:
```typescript
class xmlTranslator {
    public static async GetSingleSerializedNode<T>(item: ReferenceItem, xmlDocHTML: string, query: string, type: (new () => T)): Promise<T> {
        //Some XML parsing Logic
        return new type();
    }
}
```

#### XML Page Query Handling

A couple interfaces that we want one of our mix-in classes to implement / expose. This will make more sense further on.

```typescript
/** An interface that allows an IScriptPage implementation to perform XML related queries
 * against it's cached page
 */
interface IQueryablePage {
    GetSingleNode<T>(query: string, type: new () => T): Promise<T>;
}

/** A static class that handles the methods defined in IQueryablePage */
class PageQueries {
    public static async GetSingleNode<T, MS extends ScriptPageBase>(item: ReferenceItem, script: MS, query: string, type: new () => T): Promise<T> {
        return await xmlTranslator.GetSingleSerializedNode(item, script.ManuScript, query, type);
    }
}

interface IManuScriptPageWrapper<T extends ScriptPageBase> {
    IsManuScriptLoaded: boolean;
    /** Returns the defined ManuScript Page associated with this tab */
    GetManuScriptPage(reload?: boolean): Promise<T>
}
```

#### Custom Mixin Decorator Handling for Boilerplate Interactor Inheritance code for the Constructor

Wow that's a mouthful. 

Basically, it's already easy to mixin the 2 base classes we need. However, we want to not only use one of the mixin class' constructor / inheritance tree, but also not have to write the boilerplate constructor code for each implementing class (a problem described further above).

A solution for this is to create a custom decorator to access the constructor of the mixin class you want (this is necessary because the constructor signature needs to match), and in that decorator, implement an interface that can be shared by all the mixin classes, and then execute the boilerplate code for the constructor, setting all of the properties.

This will make sense further below when we define the new abstract classes we want to export:
```typescript
const __ = <never>null;
type _ = typeof __;

/** Extending from this class allows the 'InheritInteractor' class decorator to be
 * used, to mixin a ManuScript implementation along with an Interactor class
 */
abstract class BoilerPlateCtor { 
    /**
     * @param item Reference to the Page in use
     * @param manuScriptFactory The static IScriptPage class that can create a new instance
     * of the defined generic ScriptPageBase Type
     */
    constructor(item: ReferenceItem, manuScriptFactory: IScriptPage) {} 
}

interface IManuScriptPageBoilerPlateInterface { __ReferenceItem: ReferenceItem; _ManuScriptFactory: IScriptPage; }

type PageImplementation<T extends StandardInteractor> = PageImplementationCtor & T;
interface PageImplementationCtor { new (item: ReferenceItem, manuScriptFactory: IScriptPage); }

/** A class decorator that will perform the boilerplate constructor logic to mixin a ManuScript
 * implementation along with an Interactor class. Enforces that the decorated class' contract
 * implements the StandardInteractor inheritance.
 */
const InheritInteractor = <T extends StandardInteractor>(type: new (item: ReferenceItem) => T) => {
    return (<U extends T>(orig: new (item: ReferenceItem, manuScriptFactory: IScriptPage) => BoilerPlateCtor & U) => {
        return class extends (type as new (item: ReferenceItem) => any) implements IManuScriptPageBoilerPlateInterface {
            __ReferenceItem: ReferenceItem;
            _ManuScriptFactory: IScriptPage;

            constructor(item: ReferenceItem, manuScriptFactory: IScriptPage) {
                super(item);

                this.__ReferenceItem = item;
                this._ManuScriptFactory = manuScriptFactory;
            }
        } as PageImplementation<T>;
    });
};
```
Notice how the decorator actually has the original constructor extend from the provided mixin class. This requires the implementing class to share a constructor signature with this particular mixin class, which means we will have to have our implementing class extend from 'BoilerPlateCtor', as a way of sharing that signature.

This is the most efficient solution for keeping your boilerplate constructor code separate from implementing classes, when you have a specific group of mixin's defined. Or at least compatible groups of mixin classes.

#### Base XML Page Mapping Wrapper w/ Object Readiness Design Pattern

The following is our definitions for a complicated Mixin class we want our implementing classes to inherit. This class takes care of asyncrounously retrieving our XML data using a common library and some static definitions. Thus, it takes advantage of the [Object readiness design pattern](https://pdconsec.net/blogs/devnull/asynchronous-constructor-design-pattern). This pattern allows the XML to always be loaded asyncrounously before it's used, automatically, giving it's methods a cold or hot start. To see the source code for these decorators, take a look [here](https://github.com/xSlither/ts-mixin/blob/master/tests/src/readiness-design.ts).

Another caveat to this class is that we want to only expose specific functions and properties when used as a mixin, but also want to use interfaces with the mixin class that have keys we don't want to directly expose. The solution is to, in addition to defining the class, define an interface with the true keys you want to 'mix-in' with the implementing class.

```typescript
/** Public Interface for IManuScriptPageMapping mixin */
interface ManuScriptPageMapping<T extends ScriptPageBase> extends IManuScriptPageWrapper<T>, IQueryablePage {}

abstract class IManuScriptPageMapping<T extends ScriptPageBase>
implements IManuScriptPageWrapper<T>, IQueryablePage, IManuScriptPageBoilerPlateInterface {

    private _ManuScriptPage: T;

    public _ManuScriptFactory: IScriptPage;
    public __ReferenceItem: ReferenceItem;
    public IsManuScriptLoaded: boolean = false;


    constructor(item: ReferenceItem, manuScriptFactory: IScriptPage) {
        this.__ReferenceItem = item;
        this._ManuScriptFactory = manuScriptFactory;
    }


    public get MyPage(): ReferenceItem {
        return this.__ReferenceItem;
    }


    @ReadinessDesign.init
    protected async LoadManuScript(): Promise<void> {
        this._ManuScriptPage = (await this._ManuScriptFactory.CreateAsync(this.MyPage)) as T;
        this.IsManuScriptLoaded = true;
    }

    @ReadinessDesign.waitOnInit
    public async GetManuScriptPage(reload: boolean = false): Promise<T> {
        if (reload) { await this.LoadManuScript(); }
        return this._ManuScriptPage;
    }


    @ReadinessDesign.waitOnInit
    public async GetSingleNode<T>(query: string, type: new () => T): Promise<T> {
        return await PageQueries.GetSingleNode(this.MyPage, this._ManuScriptPage, query, type);
    }

}

/** Abstract IManuScriptPageMapping constructor -> base constructor */
const _IManuScriptPageMapping_ = <unknown>IManuScriptPageMapping as new (...args) => ManuScriptPageMapping<_>;
```
Also, note that because this class is defined as an abstract class to discourage directly instantiating it, we must also cast it as a regular constructor for use with the mixin decorators. This can also be shorthanded by using a constant.

Using the rest parameter for an any[] array when casting the constructor is a deliberate choice. This makes the constructor signature compatible with any other mixin; because, we don't really care about a mixin's constructor, but we do want it's types.

#### Implementing the Mixin Classes to create new abstracted classes

Finally, we can implement our mixin functions using the `tmixin` decorator, as well as the custom 'InheritInteractor' decorator that was defined. As you can see, this reduced the class definitions down to only 4 lines of code. 

What's happening here is that we needed mixins with the 'IManuScriptPageMapping' class at different levels in the inheritance tree for the Interactor objects. These classes are intended to be inherited by much more specific classes that needed the functionality behind our mixed-in classes. 

Now, it will be very easy for a developer not familiar with the inheritance behind these objects to come in and define a new abstraction. And, TypeScript will be able to correct them if a mistake is made.

```typescript
@Mixins.tmixin(_IManuScriptPageMapping_)
@InheritInteractor(TabbedInteractor)
export class TabbedManuScriptPageInteractor<T extends ScriptPageBase> extends BoilerPlateCtor {}
export interface TabbedManuScriptPageInteractor<T extends ScriptPageBase> extends ManuScriptPageMapping<T>, TabbedInteractor {}

@Mixins.tmixin(_IManuScriptPageMapping_)
@InheritInteractor(SpecialTabbedInteractor)
export class SpecialTabbedManuScriptPageInteractor<T extends ScriptPageBase> extends BoilerPlateCtor {}
export interface SpecialTabbedManuScriptPageInteractor<T extends ScriptPageBase> extends ManuScriptPageMapping<T>, SpecialTabbedInteractor {}

@Mixins.tmixin(_IManuScriptPageMapping_)
@InheritInteractor(AbstractInteractor)
export class AbstractManuScriptPageInteractor<T extends ScriptPageBase> extends BoilerPlateCtor {}
export interface AbstractManuScriptPageInteractor<T extends ScriptPageBase> extends ManuScriptPageMapping<T>, AbstractInteractor {}
```

#### An example of implementing the abstract mixed-in classes

Now let's take a look at what an implementation of what our new mixed-in classes looks like:

```typescript
//-----------------------------------------------------------------------------------------------
// ++ Types of ManuScript Page Implementations
//-----------------------------------------------------------------------------------------------

//@WestWorld.staticImplements<IScriptPage>(IScriptPage)
export class MsPageSomethingSpecific extends ScriptPageBase {

    public static ManuScriptTopic: string = 'someConst';
    public static ManuScriptPageName: string = 'someConst';


    constructor(item: ScriptPageBase) {
        super(item.MyItem, item.ManuScript);
    }


    public static async CreateAsync(item: ReferenceItem): Promise<MsPageSomethingSpecific> {
        return new this(await this.CreateAsyncBase(item, this))
    }

    public async GetSomeValue(someArg): Promise<string> {
        return 'someValue';
    }

}

//-----------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------
// ++ Types of Mixed Page/Interactor Implementations
//-----------------------------------------------------------------------------------------------

export class SomeSpecificPageInteractor extends SpecialTabbedManuScriptPageInteractor<MsPageSomethingSpecific> {
    constructor(item: ReferenceItem) {
        super(item, MsPageSomethingSpecific);
    }
}

//-----------------------------------------------------------------------------------------------
```
First, we needed to declare our implementation of ScriptPageBase/IScriptPage. This is because the mixin class we setup, 'IManuScriptPageWrapper', takes a generic type parameter of the abstract class ScriptPageBase. Our constructor for ScriptPageBase also requires a static implementation of IScriptPage (which can be enforced by TypeScript by using `ts-westworld`). This class is specific to some sort of XML response or series of responses.

Next, we created our class that inherits from one of our abstract 'mixed-in' classes. It uses our new 'MsPageSomethingSpecific' class to satisfy both the type parameter and the constructor.

#### A Test run

Finally, let's test our inheritance pattern. You will get the output in the comment next to the `console.log()`:

```typescript
class SomeXmlStruct { someProp: string = 'someDefaultValue'; }

const Test = async () => {
    const item = { id: 'someId' } as ReferenceItem;
    const interactor = new SomeSpecificPageInteractor(item);

    console.log(interactor.MyPage); // { id: 'someId' }
    console.log(interactor.SomeVerySpecificMethod()); // test3
    console.log(interactor.SomeGenericMethod()); // test1

    console.log(interactor.IsManuScriptLoaded); // undefined
    console.log(await interactor.GetSingleNode('some xpath query', SomeXmlStruct)); // SomeXmlStruct { someProp: 'someDefaultValue' }
    console.log(interactor.IsManuScriptLoaded); // true

    const script = await interactor.GetManuScriptPage();
    console.log(await script.GetSomeValue('someArg')); // someValue
};

Test();
```