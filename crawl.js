const puppeteer = require('puppeteer');
const fs = require("fs");

const crawl = async (page) => {
  let content = ""
  const currentPageClass = 'disabled myclass'
  const url = `https://www.saketime.jp/ranking/`
  const response = await page.goto(url)

  const prefectureList = await page.$$("#ranking-body > aside > ul > li")
  for (let prefectureId = 2; prefectureId <= prefectureList.length; prefectureId++) {
    const xpath = `//*[@id="ranking-body"]/aside/ul/li[${prefectureId}]/a`
    const prefectureLink = await page.$x(xpath)
    await prefectureLink[0].click();
    await page.waitForNavigation();

    while (true) {
      const rows = await page.$$("div.content > ol > li.clearfix");
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const rank = (await page.evaluate(el => el === null ? "" : el.textContent, await row.$('p[class^="rank-"]'))).trim()
        const name = (await page.evaluate(el => el.textContent, await row.$('h2 > a > span'))).trim()
        const fullname = (await page.evaluate(el => el.innerText, await row.$('h2'))).trim()
        const brandInfo = (await page.evaluate(el => el.innerText, await row.$('.brand_info')))
        const [ken, syuzo] = brandInfo.split("|")
        const point = (await page.evaluate(el => el === null ? "" : el.innerText, await row.$('.brand_point > .point'))).trim()
        const review = (await page.evaluate(el => el === null ? "" : el.innerText, await row.$('.brand_point > span:nth-child(4)'))).trim()
        // results.push([name, fullname, ken.trim(), rank, syuzo.trim(), point, review])
        content = `${content}${name},${fullname},${ken.trim()},${rank},${syuzo.trim()},${point},${review}\r\n`
      }

      const pagination = await page.$$("#searchbox > div.pagination.text-center.clearfix > ul > li");
      let nextPage = null
      let checkFlag = false
      for (let i = 0; i < pagination.length; i++) {
        const thisClass = await page.evaluate(el => el.className, pagination[i])
        if (checkFlag && thisClass !== currentPageClass) {
          nextPage = pagination[i]
          break
        }
        if (thisClass === currentPageClass) {
          checkFlag = true
        }
      }
      if (nextPage) {
        await nextPage.click();
        await page.waitForNavigation();
      } else {
        break;
      }
    }
  }
  try {
    fs.writeFileSync(`/Users/takahashiyuudai/workspace/tmp/nihonsyuranking.csv`, content);
  } catch (err) {
    console.error(err);
  }
}

(async() => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await crawl(page).catch(async error => {
    console.log('crawl failed')
    console.log(error)
  })

  if (page) await page.close()
  if (browser) await browser.close()
  console.log('crawl done')
})();
