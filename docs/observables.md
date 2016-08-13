# Observables #

Observables are the main part, that this library is all about. An observable is
basically a container that holds a value. This value is stored privatly, so the
only way to get the value is to ask the observable.

That's not all: It's named observable, because you can observe it (Cpt. Obvious
was here). Therefore you can subscribe to changes to react to them.

## Working with an observable ##

Working with an observable is pretty straight forward. First you have to create
it

    const yal = require('yal');
    const myObservable = yal.observable();

Now `myObservable` is an observable, containing the value `undefined`. If you
want to initialize the observable with something else, simply pass it on creation

    const myOtherObservable = yal.observable('So cool');

Now `myOtherObservable` is initialized with the string 'So cool'. But wait: How
do we get the values back? And how to change it?

Simple solution: An observable is basically a function, so you can use it like
this:

    console.log(myOtherObservable()); // echoes 'So cool'
    myOtherObservable('Even cooler');
    console.log(myOtherObservable()); // echoes 'Even cooler'

So every call to the observable will return the current value. Every call to the
observable with a parameter will cause the observable to take over the first
parameter as new value. This action will trigger all subscribers as well.

## Subscribe to observables ##

So, when you want to actually observe the observable, you have to tell it, by calling
the `subscribe(<handler>)` method:

    myOtherObservable.subscribe((newValue) => {
        console.log(newValue);
    });
    myOtherObservable('Echo it!'); // this will echo 'Echo it!', because of the subscriber

## Unsubscribe from observables ##

This is just as simple as you might think, just call the `unsubscribe(<handler>)`
method:

    function handler(newValue) {
        console.log(newValue);
    }
    myOtherObservable.subscribe(handler);
    myOtherObservable('Echo it!'); // echos 'Echo it!'
    myOtherObservable.unsubscribe(handler)
    myOtherObservable('No Echo'); // will do nothing but saving the value

## Propagating changes by your own ##

So, sometimes there are some edge cases, where the observable gets modified without
setting it again. An example is operating on an array reference.

    const myArray = [];
    myObservable(myArray);
    myArray.push('first');

This case will not notify to the subscribers, even though the array inside the
observable now contains a new value.

There are two ways to tell the outer world, that the observable has changed. The
first one is simply setting the same value again. This will cause all subscribers
to get notified.

The other way is to call the `valueHasMutated` method. This will call all subscribers
as well.

    myObservable.valueHasMutated();

## Extenders ##

Actually you can work with extenders on observables, by simply calling

    myObservable.extender({...});

For more details see the extender documentation.

## The dispose method ##

If you'll look at the observable instance, you'll notice a method called `dispose`.

This method has no effect on the observable. This is added because I generalized
the way subscribables are build, and this method is needed for computeds and workers.

You can call it, but it will do nothing.