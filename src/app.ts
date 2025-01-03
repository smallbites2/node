import express from 'express';
import type { Application } from 'express';

class App {
  private static instance: Application;

  private constructor() {
    App.instance = express();
  }

  public static getInstance(): Application {
    if (!App.instance) {
      new App();
    }

    return App.instance;
  }
}

export default App.getInstance();
