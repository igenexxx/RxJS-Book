import { fromEvent, merge, ReplaySubject, Subject, AsyncSubject } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { webSocket } from 'rxjs/webSocket';
import { map, filter, tap, switchMap, withLatestFrom, scan, pluck, mapTo } from 'rxjs/operators';
import { showLoadingSpinner, closeLoginModal, renderRoomButtons, setActiveRoom, writeMessageToPage, setUnread } from './chatlib';

// Login modal
let loginBtn = <HTMLElement>document.querySelector('#login-button');
let loginInput = <HTMLInputElement>document.querySelector('#login-input');

// Sending a message
let msgBox = <HTMLInputElement>document.querySelector('#msg-box');
let sendBtn = <HTMLElement>document.querySelector('#send-button');

let roomList = <HTMLElement>document.querySelector('#room-list');

// ===== Websocket =====

interface ChatRoom {
  name: string;
}

interface ChatMessage {
  room: ChatRoom;
}

const wsUrl = 'ws://localhost:3000/api/multiplexingObservables/chat-ws';
const chatStream$ = webSocket<ChatMessage>(wsUrl);

// ===== Login =====

interface User {
  rooms: ChatRoom[];
}

const userSubject$ = new AsyncSubject<User>();

function authenticateUser(username) {
  const user$ = ajax(`http://localhost:3000/api/multiplexingObservables/chat/user/${username}`).pipe(
    pluck('response'),
  );

  user$.subscribe(userSubject$);
}

merge(
  fromEvent(loginBtn, 'click'),
  fromEvent<KeyboardEvent>(loginInput, 'keypress').pipe(
    filter(e => e.code === 'Enter'),
  )
).pipe(
  mapTo(loginInput.value),
  filter(Boolean),
  tap(showLoadingSpinner)
).subscribe(authenticateUser);

userSubject$.subscribe(closeLoginModal);

// ===== Rooms =====

function makeRoomStream(roomName) {
  const roomStream$ = new ReplaySubject(100);

  chatStream$.pipe(filter(msg => msg.room.name === roomName)).subscribe(roomStream$);

  return roomStream$;
}

const roomStreams = {};

userSubject$.subscribe(userObj => {
  userObj.rooms.forEach(room => roomStreams[room.name] = makeRoomStream(room.name))
});

userSubject$.subscribe(userObj => renderRoomButtons(userObj.rooms));
userSubject$.subscribe(userObj => roomLoads$.next(userObj.rooms[0].name));

// ===== Unread =====

const roomClicks$ = fromEvent<MouseEvent>(roomList, 'click').pipe(
  map((event: any) => {
    if (event.target.tagName === 'SPAN') {
      return event.target.parentNode;
    }

    return event.target;
  }),
  map(element => element.innerText.replace(/\s\d+$/, ''))
);

const roomLoads$ = new Subject();
roomClicks$.subscribe(roomLoads$);

// ===== Sending Messages =====

