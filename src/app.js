/* eslint-disable linebreak-style */
import 'dotenv/config';

import express from 'express';
import path from 'path';
import * as Sentry from '@sentry/node';
import Youch from 'youch';
import sentryConfig from './config/sentry';

import 'express-async-errors';
import routes from './routes';

import './database';

/* dentro de app por padrão trabalhamos com classes, pois podemos chamar estas classes de toda
a aplicação */

class App {
  /* Dentro da classe há um método chamado contructor que é executado automaticamente quando a
  classe é instanciada. */

  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  // eslint-disable-next-line linebreak-style
  middlewares() {
    // Configura o servidor para ler requisões que retornam arquivos json.
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    // usa o arquivo routes.js que também são middlewares para ler todas as rotas.
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();

        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: 'Internal server error' });
    });
  }
}

export default new App().server; // Exporta o servidor criado com o express
