import { fromEvent } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

const draggable = document.querySelector<HTMLElement>('#draggable');

const mouseDown$ = fromEvent<MouseEvent>(draggable, 'mousedown');
const mouseMove$ = fromEvent<MouseEvent>(document, 'mousemove');
const mouseUp$ = fromEvent<MouseEvent>(document, 'mouseup');

mouseDown$.subscribe(() => {
  mouseMove$.pipe(
    map<MouseEvent, { x: number; y: number }>(event => {
      event.preventDefault();

      return {
        x: event.clientX,
        y: event.clientY
      };
    }),
    takeUntil(mouseUp$)
  ).subscribe(pos => {
    draggable.style.left = pos.y + 'px';
    draggable.style.top = pos.y + 'px';
  })
})
