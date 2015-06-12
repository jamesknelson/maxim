import Rx from "rx";


export default function reducer(builder, Replayables) {
  const replayable = new Rx.Subject();

  // We don't want to run our builder until the next tick, as we want all
  // other replayables to be available on the object we pass to it
  function setup() {
    builder(Replayables).subscribe(replayable);
  }

  return {replayable, setup};
}
