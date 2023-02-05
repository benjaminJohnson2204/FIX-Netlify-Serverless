// import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
const POST_COUNT = 3;

export const handler = async (event, context) => {
  const username = event.queryStringParameters.username;
  if (!username) {
    return {
      statusCode: 400,
      body: 'Must provide a username',
    };
  }

  const browser = await puppeteer.launch({
    // executablePath:
    //   process.env.CHROME_EXECUTABLE_PATH ||
    //   (await chromium.executablePath(
    //     'https://github.com/Sparticuz/chromium/releases/download/v110.0.0/chromium-v110.0.0-pack.tar'
    //   )),
    // args: [
    //   ...chromium.args,
    //   '--disable-features=AudioServiceOutOfProcess',
    //   '--disable-gpu',
    //   '--disable-software-rasterize',
    // ],
    // defaultViewport: chromium.defaultViewport,
    // headless: chromium.headless,
  });
  const page = await browser.newPage();

  await page.goto(`https://www.instagram.com`);
  await page.setCookie({
    name: 'sessionid',
    value: process.env.SESSION_ID,
  });
  const result = [];
  await page.goto(`https://www.instagram.com/${username}?hl=en`);

  // Profile picture
  // [alt="${username}\'s profile picture"]
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const selectorString = `header img`;
  const imageUrl = await page.evaluate(
    (selectorString) =>
      document.querySelector(selectorString)?.getAttribute('src'),
    selectorString
  );

  // Post images
  const postImageUrls = await page.evaluate((postCount) => {
    const result = [];
    const postImageElements = document.querySelectorAll('article img');
    for (let i = 0; i < postCount && i < postImageElements.length; i++) {
      result.push(postImageElements[i].getAttribute('src'));
    }
    return result;
  }, POST_COUNT);

  // Follower count
  const followerCount = await page.evaluate(() => {
    const buttonElements = document.querySelectorAll('li > a > div');
    for (let i = 0; i < buttonElements.length; i++) {
      const buttonElement = buttonElements[i];
      if (buttonElement.innerHTML.includes('followers')) {
        return buttonElement.querySelector('span > span')?.innerHTML;
      }
    }
    return 'Not found';
  });

  await browser.close();

  result.push({
    imageUrl,
    postImageUrls,
    followerCount,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: {
      'access-control-allow-origin': '*',
    },
  };
};
