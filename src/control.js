import Rx from "rx";


export default function control(builder, dispatcher, Replayables, AllActions) {
  const Observables = {};
  const Actions = {};

  const functions = builder(AllActions, Replayables);

  for (let [name, fn] of Object.entries(functions)) {
    const subject = new Rx.Subject();
    let trigger;

    if (name == "initialize") {
      trigger = function(...args) {
        subject.onNext(...args);
        subject.onCompleted();
      };
    }
    else {
      trigger = subject.onNext.bind(subject);
    }

    Observables[name] = subject.asObservable();
    Actions[name] = dispatcher.getAction(fn.bind(trigger));
  }

  Object.freeze(Actions);
  Object.freeze(Observables);

  return {Actions, Observables};
}
