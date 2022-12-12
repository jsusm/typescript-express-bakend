import express, {Request, Response} from 'express'
import bodyParser from 'body-parser'
import { Routes } from './routes.js';
import { AppDataSource } from "./db/data-source.js";
import { controllerErrorHandler, joiErrorHandler, errorHandler } from './middlewares/error.handler.js'

AppDataSource.initialize().then(async () => {
  const app = express()
  app.use(bodyParser.json())

  loadRoutes(app)

  // Error handling
  app.use(controllerErrorHandler)
  app.use(joiErrorHandler)
  app.use(errorHandler)

  app.listen(3000, () => console.log('Listen on port 3000'))
})

// register express routes from defined application routes
function loadRoutes(app: ReturnType<typeof express>) {
  Routes.forEach(route => {
    const loadedController = (req: Request, res: Response, next: Function) => {
      const result = (new route.controller as any)[route.action](req, res, next)
      if(result instanceof Promise) {
        result
          .then(result => res.send(result))
          .catch(err => next(err))
      }else if(result !== null && result !== undefined) {
        res.json(result)
      }
    }
    (app as any)[route.method](route.route, route.middlewares, loadedController)
  })
}
