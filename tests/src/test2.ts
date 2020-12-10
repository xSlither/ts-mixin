//-----------------------------------------------------------------------------------------------
import 'ts-mixin';
import * as ReadinessDesign from './readiness-design';
//-----------------------------------------------------------------------------------------------



//-----------------------------------------------------------------------------------------------
// ++ Base Interactor Object Definitions
//-----------------------------------------------------------------------------------------------

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

//-----------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------
// ++ Base XML Script Page Definitions
//-----------------------------------------------------------------------------------------------

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

//-----------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------
// ++ XML Parsing Logic
//-----------------------------------------------------------------------------------------------

class xmlTranslator {
    public static async GetSingleSerializedNode<T>(item: ReferenceItem, xmlDocHTML: string, query: string, type: (new () => T)): Promise<T> {
        //Some XML parsing Logic
        return new type();
    }
}

//-----------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------
// ++ XML ManuScript Page Query Handling
//-----------------------------------------------------------------------------------------------

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

//-----------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------
// ++ Custom Mixin Decorator Handling for Interactor Inheritance
//-----------------------------------------------------------------------------------------------

const __ = <never>null;
type _ = typeof __;

/** Extending from this class allows the 'InheritInteractor' class decorator to be
 * used, to mixin a ManuScript implementation along with an Interactor class
 */
abstract class BoilerPlateCtor { 
    /**
     * @param page Reference to the Page in use
     * @param manuScriptFactory The static IScriptPage class that can create a new instance
     * of the defined generic ScriptPageBase Type
     */
    constructor(item: ReferenceItem, manuScriptFactory: IScriptPage) {} 
}

interface IManuScriptPageBoilerPlateInterface { __ReferenceItem: ReferenceItem; _ManuScriptFactory: IScriptPage; }

type PageImplementation<T extends StandardInteractor> = PageImplementationCtor & T;
interface PageImplementationCtor { new (page: ReferenceItem, manuScriptFactory: IScriptPage); }

/** A class decorator that will perform the boilerplate constructor logic to mixin a ManuScript
 * implementation along with an Interactor class. Enforces that the decorated class' contract
 * implements the StandardInteractor inheritance.
 */
const InheritInteractor = <T extends StandardInteractor>(type: new (page: ReferenceItem) => T) => {
    return (<U extends T>(orig: new (page: ReferenceItem, manuScriptFactory: IScriptPage) => BoilerPlateCtor & U) => {
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

//-----------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------
// ++ Base ManuScript Page Mapping Wrapper w/ Readiness Design Pattern
//-----------------------------------------------------------------------------------------------

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


    @ReadinessDesign.init //(Readiness Design Pattern Decorator)
    protected async LoadManuScript(): Promise<void> {
        this._ManuScriptPage = (await this._ManuScriptFactory.CreateAsync(this.MyPage)) as T;
        this.IsManuScriptLoaded = true;
    }

    @ReadinessDesign.waitOnInit //(Readiness Design Pattern Decorator)
    public async GetManuScriptPage(reload: boolean = false): Promise<T> {
        if (reload) { await this.LoadManuScript(); }
        return this._ManuScriptPage;
    }


    @ReadinessDesign.waitOnInit //(Readiness Design Pattern Decorator)
    public async GetSingleNode<T>(query: string, type: new () => T): Promise<T> {
        return await PageQueries.GetSingleNode(this.MyPage, this._ManuScriptPage, query, type);
    }

}

/** Abstract IManuScriptPageMapping constructor -> base constructor */
const _IManuScriptPageMapping_ = <unknown>IManuScriptPageMapping as new (...args) => ManuScriptPageMapping<_>;

//-----------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------
// ++ Types of ManuScript Page Wrappers for different Page Abstractions
//-----------------------------------------------------------------------------------------------

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

//-----------------------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------
// ++ Types of ManuScript Page Implementations
//-----------------------------------------------------------------------------------------------

//@WestWorld.staticImplements<IManuScriptPage>(IScriptPage)
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