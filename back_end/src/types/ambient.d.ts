declare module 'express-session' {
  import session from 'express-session';
  export = session;
}

declare module 'supertest';

declare namespace NodeJS {
  interface Global {
    describe: any;
    it: any;
    expect: any;
    beforeAll: any;
    afterAll: any;
  }
}

declare var describe: any;
declare var it: any;
declare var expect: any;
declare var beforeAll: any;
declare var afterAll: any;
