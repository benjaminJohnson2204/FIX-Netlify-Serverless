import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
const POST_COUNT = 3;

export const handler = async (event, context) => {
  const auth = event.headers.Authorization;
  if (!auth || auth != process.env.API_KEY) {
    return {
      statusCode: 401,
      body: 'API Key not provided/invalid',
    };
  }
  const username = event.queryStringParameters.username;
  if (!username) {
    return {
      statusCode: 400,
      body: 'Must provide a username',
    };
  }

  const browser = await puppeteer.launch();
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

  result.push({
    imageUrl,
    postImageUrls,
    followerCount,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};