import { Injectable } from '@nestjs/common'
import * as amqp from 'amqplib'

@Injectable()
export class AppService {
  async sendScrapePageTask(asin: string, cron?: string): Promise<void> {
    await amqp
      .connect('amqp://queue')
      .then((conn) => {
        return conn
          .createChannel()
          .then((ch) => {
            const channelName = 'jobs'
            const ok = ch.assertQueue(channelName, { durable: true })

            return ok.then((q) => {
              const msg = JSON.stringify({ asin: asin, cron: cron })
              ch.sendToQueue(channelName, Buffer.from(msg), {
                deliveryMode: true,
              })
              console.log(" [x] Sent '%s' to %s", msg, q.queue)
              return ch.close()
            })
          })
          .finally(function () {
            conn.close()
          })
      })
      .catch(console.error)
  }
}
