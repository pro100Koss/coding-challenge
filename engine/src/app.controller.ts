import { Controller, Get, Param } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  getIndex(): string {
    return 'emax.digital coding challenge'
  }

  @Get('/get-title/:asin')
  async getTitle(@Param('asin') asin): Promise<string> {
    await this.appService.sendScrapePageTask(asin)
    return 'Done'
  }

  @Get('/get-title-scheduled/:asin/:cron')
  async getTitleScheduled(
    @Param('asin') asin,
    @Param('cron') cron,
  ): Promise<string> {
    await this.appService.sendScrapePageTask(asin, cron)
    return 'Done'
  }
}
