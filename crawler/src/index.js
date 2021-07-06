const puppeteer     = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const amqp          = require('amqplib/callback_api')
puppeteer.use(StealthPlugin())

async function getBrowser() {
  const width   = 4019
  const height  = 1900
  const browser = await puppeteer.launch({
    args: [
      `--window-size=${width},${height}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--disable-dev-shm-usage',
      '--disable-features=VizDisplayCompositor',
      '--window-position=0,0',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
      '--user-agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) snap Chromium/81.0.4044.113 Chrome/81.0.4044.113 Safari/537.36"'
    ]
  })
  return browser
}

const parseTitleJob = async ({job, asin}) => {
  console.log("Parsing title with asin: " + asin)
  const browser = await getBrowser()

  const page = await browser.newPage()
  await page.goto(`https://amazon.de/dp/${asin}`)
  const title = await page.title()

  console.log(`Page title: ${title}`)

  return !!title
}

amqp.connect('amqp://queue', function (error, connection) {
  if (error) {
    throw error;
  }
  connection.createChannel(async function (err, ch) {
    if (err) {
      throw err;
    }

    ch.on("error", function (err) {
      console.error("[AMQP] channel error", err.message);
    });
    ch.on("close", function () {
      console.log("[AMQP] channel closed");
    });

    const processMsg = async (msg) => {
      const job       = JSON.parse(msg.content.toString().trim());
      const isSuccess = await parseTitleJob(job);

      try {
        isSuccess ? ch.ack(msg) : ch.reject(msg, true)
      } catch (e) {
        console.error(e);
      }
    }

    ch.prefetch(10);
    ch.assertQueue("jobs", {durable: true}, function (err, _ok) {
      if (err) {
        throw err;
      }
      ch.consume("jobs", processMsg, {noAck: false});
      console.log("Worker is started");
    });
  });
});


