import 'ts-mixin';


class Animal {
    species: string;
    id: number = 1;
    constructor(species: string) {
        this.species = species
    }
    eat(){
        console.log('Animal has eaten');
    }
}

abstract class Person<T> {
    name: string;
    id: number = 0;
    constructor(name: string) {
        this.name = name
    }
    speak(){}
}

interface Employee<T> extends Person<T>, Animal {    
    employeeCode: string;
}

abstract class WarehouseEmployee<T> {
    building: string;

    constructor(building: string) {
        this.building = building;
    }
}

@Mixins.tmixin(Animal)
class Employee<T> extends WarehouseEmployee<T> {  
    constructor(name: string) {
        super('E');
        this.id = 22;
        this.name = name;
    }  
}


class Chase extends Employee<string> {
    constructor() {
        super('Chase');
    }
}


const x = new Chase();
x.eat(); // Animal has eaten
console.log(x); // Chase { building: 'E', id: 22, name: 'Chase' }