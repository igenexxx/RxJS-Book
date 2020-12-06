import { fromEvent, interval, Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

const startButton = document.querySelector('#start-button');
const stopButton = document.querySelector('#stop-button');
const resultArea = document.querySelector('.output');

const tenthSecond$ = interval(100);
const startClick$ = fromEvent(startButton, 'click');
const stopClick$ = fromEvent(stopButton, 'click');

startClick$.subscribe(() => {
  tenthSecond$.pipe(
    map(item => item / 10),
    takeUntil(stopClick$)
  ).subscribe(num => resultArea.innerHTML = num + 's');
})



