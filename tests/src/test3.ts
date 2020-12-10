import 'ts-mixin';

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
x.eat();
x.speak();
console.log(x);