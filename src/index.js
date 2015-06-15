import control from "./control";
import Dispatcher from "./Dispatcher";
import invariant from "invariant";
import model from "./model";
import reducer from "./reducer";


export function initialize({controls = {}, models = {}, reducers = {}, actors = []}) {
  const dispatcher = new Dispatcher;

  const Actions = {};
  const Observables = {};
  const Replayables = {};
  const AsyncReplayables = {};

  // Don't allow actions to be run during the setup phase
  dispatcher.dispatchable = false;

  // Setup Controls
  for (let [name, builder] of Object.entries(controls)) {
    const out = control(builder, dispatcher, Replayables, Actions);

    Actions[name] = out.Actions;
    Observables[name] = out.Observables;
  };

  Object.freeze(Actions);
  Object.freeze(Observables);

  // Setup Models
  for (let [name, builder] of Object.entries(models)) {
    Replayables[name] = model(builder, Observables);
  }

  // Setup Reducers
  const setupFns = [];
  for (let [name, builder] of Object.entries(reducers)) {
    invariant(!Replayables[name], `Models and Reducers cannot share the same name [${name}]`);
    const {replayable, setup} = reducer(builder, Replayables);
    setupFns.push(setup);
    Replayables[name] = replayable;
  }

  Object.freeze(Replayables);

  setupFns.forEach(fn => fn());

  for (let [name, replayable] of Object.entries(Replayables)) {
    AsyncReplayables[name] = replayable.observeOn(Rx.Scheduler.default);
  }

  Object.freeze(AsyncReplayables);

  for (let builder of actors) {
    builder(Actions, AsyncReplayables);
  }

  // Allow actions to be run once setup completes
  dispatcher.dispatchable = true;

  // Initialize
  for (let [name, ControlActions] of Object.entries(Actions)) {
    if (ControlActions.initialize) {
      ControlActions.initialize();
    }
  }
};
