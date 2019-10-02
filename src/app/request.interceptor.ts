import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>,
            next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(req);
    const cloned = req.clone({
      headers: req.headers.set('Content-Type', 'application/vnd.api+json')
    });
    console.log(cloned);
    return next.handle(cloned);
  }
}
