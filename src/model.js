import Rx from "rx";


export default function model(builder, Observables) {
  const replaySubject = new Rx.ReplaySubject(1);
  const modelObservable = builder(Observables);

  modelObservable.subscribe(replaySubject);

  return replaySubject.asObservable();
}
