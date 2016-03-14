# DecycledJSON
A JSON serializer for objects in JS with circular structures

##Example Usage

```Javascript
function Person() {
    this.name = null;
    this.child = null;
    this.dad = null;
    this.mom = null;
}
var Dad = new Person();
Dad.name = 'John';
var Mom = new Person();
Mom.name = 'Sarah';
var Child = new Person();
Child.name = 'Kiddo';

Dad.child = Mom.child = Child;
Child.dad = Dad;
Child.mom = Mom;

console.log('Dad', Dad);
console.log('Mom', Mom);
console.log('Child', Child);

jsonChild = DJS.stringify(Child);
jsonChild = JSON.stringify(Child);
console.log(jsonChild);
console.log(DJS.parse(jsonChild));
```
