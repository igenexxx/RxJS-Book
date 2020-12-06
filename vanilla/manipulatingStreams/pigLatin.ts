import { from, fromEvent } from 'rxjs';
import { map, pluck, reduce, switchMap } from 'rxjs/operators';

let textbox = <HTMLElement>document.querySelector('#text-input');
let results = <HTMLElement>document.querySelector('#results');

function pigLatinify(word) {
  return word.length < 2 ? word : word.slice(1) + '-' + word[0].toLowerCase() + 'ay';
}

const keyUp$ = fromEvent(textbox, 'keyup').pipe(
  pluck<KeyboardEvent, string>('target', 'value'),
  switchMap(value => from(value.split(/\s+/)).pipe(
    map(pigLatinify),
    reduce((result, word) => result + ' ' + word, ''),
  )),
).subscribe(translated => {
  console.log(translated);
  results.innerHTML = translated;
});
