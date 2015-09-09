# Maxim.js

*|ˈmaksɪm| n. a short, pithy statement expressing a general truth or rule of conduct*

Maxim provides structure to your browser-based applications. It does this through a set of tools and conventions which help you fashion apps with unidirectional data flow, and without decision paralysis. It is unashamedly opinionated.

Maxim is small - five files, currently totaling 143 lines. It can be this small as it leaves the heavy lifting to [RxJS](https://github.com/Reactive-Extensions/RxJS). This is good for you because:

- You can grok Maxim's code in the time it takes to drink a coffee
- Improvements in RxJS automatically make Maxim even more useful
- Maxim won't stop being useful if I'm hit by a bus

## Getting Started

Maxim apps start as clones of the Maxim starter kit, currently called [react-black-triangle](https://github.com/jamesknelson/react-black-triangle). This prevents you from re-inventing build scripts, directory structure and routing, and allows you to start being productive immediately.

Speaking of being productive, it'll only take you two minutes to get started:

```
git clone git@github.com:jamesknelson/react-black-triangle.git
cd react-black-triangle
npm install
npm install -g gulp
npm start
open http://localhost:3000
```

This gets you a black triangle ([why a black triangle?!](http://rampantgames.com/blog/?p=7745)), from which point you can either start adding your own features or dig into the workings of Maxim. Choose your own adventure!

## How Maxim Works

Maxim converts multiple streams of input events into a number of stateful models, and then interacts with the outside world and the application's inputs based on the most current values of these models. The flow looks something like this:

![Maxim Data Flow](http://jamesknelson.com/maxim.png)

### Structure

A Maxim app is split into modules of four types: Controls, Models, Reducers and Actors.

Data flows through these types in a specific order; entering the application in the Control modules, moving through Models, Reducers, and finally being used to perform some action on the outside world (such as displaying a UI) in the Actors.

Each of your Control, Model, Reducer and Actor files export a single function, which is run by Maxim to to set up the module. This isolates the various parts of your application, preventing you from shooting yourself in the foot with shared state, and helping you to separate concerns properly.

The arguments and return values of these modules fit into the following categories:

- `Actions`: Functions you can call to perform a Control Action
- `Observables`: Streams of transient events produced by Control Actions
- `Replayables`: Streams of events which also store their last event, to be replayed to new subscribers

#### Controls

`(Actions, Replayables) -> Observables`

A Control specifies a group of Action functions. Action functions are the inputs to the app, being called in response to things like the user pressing buttons, navigating to a new page, or data arriving from the server.

Control actions can cause side effects like making requests to a HTTP server. They can also call other actions - but only on subsequent ticks. For example, a `fetch` action may make a HTTP request, and then call an associated `response` action when the response is received.

The reason subsequent action calls must be on a separate tick is that Maxim's dispatcher prevents an Action from being run if another action is in progress. This makes your code easier to reason about, and makes it harder to produce unintended infinite loops. If you really need to call one action from within another (which you probably don't), you can do so in the next tick by using `setTimeout`, or by using Rx's `observeOn` method.

Each Control can specify an `initialize` action, which is automatically called by Maxim once the app is ready to start.

Each action function should emit an event by calling the trigger function bound to it's `this` keyword (optionally with parameters). e.g. `this(data)`. These events are then handled by models.

For an example Control, see `src/controls/NavigationControl.js` in `react-black-triangle`.

#### Models

`(Observables) -> Replayables`

Each Model file specifies a way to convert the various streams produced by your Control Actions into a single stream representing the values of the model over time.

Models are not directly callable - they automatically produce new values when the Actions which they subscribe to are triggered. This is where RxJS comes in - Maxim passes your Models an [Rx.Observable](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md) for each of your Control Actions, which you can then manipulate using any of RxJS's methods to produce your return Rx.Observable.

Unlike Control actions, the results of each model are cached by Maxim using an [Rx.ReplaySubject](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/subjects/replaysubject.md) so that their values persist through time. This makes the values of each model available to Reducers triggered by changes to other models in the future.

For an example Model, see `src/controls/NavigationModel.js` in `react-black-triangle`.

#### Reducers

`(Replayables) -> Replayables`

Reducers watch changes to Models and other Reducers, combining their latest values into new data. For example, a Reducer could combine a Model of known resources and a Model indexing those resources into a list of indexed resources.

Reducers, like Models, return an [Rx.Observable](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md). Maxim provides the Replayables produced by both Models and Reducers to Actors through the same object, so they cannot share the same names.

Example reducer coming soon.

#### Actors

`(Actions, Replayables) -> null`

Actors take the Replayables produced by Models and Reducers, subscribe to them, and then take some action based on the latest value (such as displaying a user interface, or calling more actions).

For an example Actor, see `src/actors/UserInterfaceActor.js` in `react-black-triangle`.

### Initialization

To start a Maxim app, call `Maxim.initialize` with the Controls, Models, Reducers and Actors you'd like to include. For example:

```
import {initialize} from "maxim";
import NavigationControl from "./controls/NavigationControl";
import NavigationModel from "./models/NavigationModel";
import UserInterfaceActor from "./actors/UserInterfaceActor";

const app = initialize({
  controls: {
    Navigation: NavigationControl,
  },
  models: {
    Navigation: NavigationModel,
  },
  actors: [
    UserInterface: UserInterfaceActor
  ],
});
```

Object keys specify the name with each module will be accessible in the `Actions`, `Observables` and `Replayables` objects passed as arguments to each module definition function.

## License

Maxim is MIT-licensed.
