@Injectable({ providedIn: 'root' })
export class SessionService {

  SetSession(SessionId: string, Token: string) {
    sessionStorage.setItem('SessionId', SessionId);
    sessionStorage.setItem('Token', Token);
  }

  ClearSession() {
    sessionStorage.clear();
  }
}

function Injectable(arg0: { providedIn: string; }): (target: typeof SessionService) => void | typeof SessionService {
  return function (target: typeof SessionService): typeof SessionService {
    return target;
  };
}
