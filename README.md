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

    console.log(Child); // ORIGINAL

    // SERIALIZE AND THEN PARSE
    var jsonChild = DJS.stringify(Child);
    console.log(DJS.parse(jsonChild));

    /************************************/
    var obj = {
        id:201,
        box: {
            owner: null,
            key: 'storm'
        },
        lines:[
            'item1',
            23
        ]
    };

    console.log(obj); // ORIGINAL

    // SERIALIZE AND THEN PARSE
    var jsonObj = DJS.stringify(obj);
    console.log(DJS.parse(jsonObj));
```
