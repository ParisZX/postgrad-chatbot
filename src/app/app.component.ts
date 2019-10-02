import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/internal/operators/tap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  speechOn = false;
  counter = 0;

  chatForm: FormGroup;

  @ViewChild('message', {static: false}) messageField: ElementRef;

  start = '';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) { }


  ngOnInit(): void {
    this.chatForm = this.formBuilder.group({
      message: ['', []]
    });

    this.http.get('http://910697cc.ngrok.io/start').pipe(
      tap((res: any) => {
        console.log(res);
        this.start = res.welcome;
      })
    ).subscribe();
  }

  scrollModuleToBottom() {
    const chatModule = document.querySelector('.chat-module');
    chatModule.scrollTop = chatModule.scrollHeight;
  }

  sendInput() {
    const inputElt = this.chatForm.controls.message;
    const messageToBeSent = inputElt.value;
    if (inputElt.value === '') {
      return;
    }
    this.toggleInput(false);
    const thread = document.querySelector('.thread');
    const newThreadItem = this.createThreadItem(false);
    const responseItem = newThreadItem.querySelector('.response');
    responseItem.innerHTML = inputElt.value;
    thread.appendChild(newThreadItem);
    inputElt.setValue('');
    this.scrollModuleToBottom();
    this.http.post('http://910697cc.ngrok.io', {
      text: messageToBeSent
    }).pipe(
      tap((res: any) => {
        console.log(res);
        this.showResponse(res.bot_reply);
      })
    ).subscribe();
  }


  createThreadItem(isBot) {
    const thread = document.querySelector('.thread');
    const threadItem = document.createElement('div');
    const avatarItem = document.createElement('div');
    const responseContainerItem = document.createElement('div');
    const responseItem = document.createElement('div');
    threadItem.classList.add('thread-item');
    avatarItem.classList.add('avatar-container');
    responseContainerItem.classList.add('response-container');
    responseItem.classList.add('response');
    responseContainerItem.appendChild(responseItem);
    threadItem.appendChild(avatarItem);
    threadItem.appendChild(responseContainerItem);
    thread.appendChild(threadItem);
    if (isBot) {
      avatarItem.appendChild(this.createBotAvatar());
    } else {
      threadItem.classList.add('user-item');
    }
    return threadItem;
  }

  createBotAvatar() {
    // make previous avatar inactive
    const previousAvatar = document.querySelector('.calliope.idle:not(.big), .calliope.appearing:not(.big)');
    if (previousAvatar) {
      previousAvatar.classList.remove('idle');
      previousAvatar.classList.remove('appearing');
      previousAvatar.classList.add('inactive');
    }
    const calliopeItem = document.createElement('div');
    const headItem = document.createElement('div');
    const eyeLeftItem = document.createElement('div');
    const eyeRightItem = document.createElement('div');
    const torsoItem = document.createElement('div');
    const armLeftItem = document.createElement('div');
    const armRightItem = document.createElement('div');
    const feetItem = document.createElement('div');
    calliopeItem.classList.add('calliope');
    calliopeItem.classList.add('appearing');
    headItem.classList.add('head');
    eyeLeftItem.classList.add('eye-left');
    eyeRightItem.classList.add('eye-right');
    torsoItem.classList.add('torso');
    armLeftItem.classList.add('arm-left');
    armRightItem.classList.add('arm-right');
    feetItem.classList.add('feet');
    headItem.appendChild(eyeLeftItem);
    headItem.appendChild(eyeRightItem);
    torsoItem.appendChild(armLeftItem);
    torsoItem.appendChild(armRightItem);
    calliopeItem.appendChild(headItem);
    calliopeItem.appendChild(torsoItem);
    calliopeItem.appendChild(feetItem);
    return calliopeItem;
  }

  showResponse(response) {
    const newThreadItem = this.createThreadItem(true);
    const responseItem = newThreadItem.querySelector('.response');
    let charsCompleted = 0;
    this.scrollModuleToBottom();

    setTimeout(() => {
      // should I speak ?
      if (this.speechOn && 'speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(response);
        window.speechSynthesis.speak(speech);
      }
      const intervalID = setInterval(() => {
        if (charsCompleted === response.length) {
          this.toggleInput(true);
          this.manageChatOverlay();
          clearInterval(intervalID);

          setTimeout(() => {
            responseItem.innerHTML = response;
            const calliope = newThreadItem.querySelector('.calliope.appearing');
            calliope.classList.remove('appearing');
            calliope.classList.add('idle');
          }, 1000);
        } else {
          const char = document.createElement('span');
          // char.classList.add('char');
          char.innerHTML = response.charAt(charsCompleted++);
          if (char.innerHTML === ' ') {
            char.innerHTML = '&nbsp;';
          }
          responseItem.appendChild(char);
        }
      }, 5);
    }, 300);
  }

  manageChatOverlay() {
    const overlay = document.querySelector('.scroll-overlay');
    const chatModule = document.querySelector('.chat-module');
    if (chatModule.scrollTop > 0) {
      overlay.classList.remove('overlay-hidden');
    } else {
      overlay.classList.add('overlay-hidden');
    }
  }

  toggleInput(enabled) {
    const inputElement = this.chatForm.controls.message;
    enabled ? inputElement.enable() : inputElement.disable();
    if (enabled) {
      this.messageField.nativeElement.focus();
    }
  }
}
