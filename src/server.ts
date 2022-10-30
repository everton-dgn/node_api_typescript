import { Server } from '@overnightjs/core'
import { ForecastController } from '@src/controllers/forecast'
import bodyParser from 'body-parser'
import { Application } from 'express'

export class SetupServer extends Server {
  constructor(private port: number = 3000) {
    super()
  }

  public init(): void {
    this.setupExpress()
    this.setupControllers()
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json())
  }

  private setupControllers(): void {
    const forecastController = new ForecastController()
    this.addControllers([forecastController])
  }

  public getApp(): Application {
    return this.app
  }
}
