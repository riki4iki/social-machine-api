const puppeteer = require("./puppeteer");

module.exports = class Browser {
  constructor(id) {
    this.id = id;
    this.browser = null;
    this.page = null;
    this.feed = null;
    this.content = [];
    this.position = 0;
  }
  async runBrowser() {
    const [browser, page] = await puppeteer.runBrowser();
    this.browser = browser;
    this.page = page;
    return page;
  }
  async redirect(path) {
    await puppeteer.redirect(this.page, path);
    return this.page;
  }
  async login(login, pass) {
    await puppeteer.login(this.page, login, pass);
    return this.page;
  }
  async init() {
    this.feed = await this.page.$("div[id^='more_pager_pagelet_']");
    await this.update();
  }
  //return current position
  async current() {
    const currunt = this.content[this.position];
    const target = await currunt.$("._1dwg, ._1w_m, ._q7o");
    const html = await target.evaluate(ele => ele.outerHTML);
    return html;
  }
  //parse feed -> save into this.contnet
  async update() {
    this.content = await this.parse();
    console.log(`updatet to ${this.content.length}`);
  }
  //:Array[] ElementHandle - parse current feed
  async parse() {
    //getting divs with content from parsed feed before
    const divs = await this.feed.$$(
      "._4ikz > div > div > div > div:not(.hidden_elem) > div"
    );

    return divs;
  }
  async next() {
    if (this.position < this.content.length - 1) {
      const next = this.content[this.position + 1];
      console.log(`next position ${this.position + 1}`);
      const nextBox = await next.boundingBox();
      console.log(nextBox);
      await puppeteer.scroll(this.page, nextBox.y);

      await this.update();
      this.position++;
    } else {
      await this.update();
    }
  }
  async previous() {
    if (this.position > 0 && this.position < this.content.length - 1) {
      const prev = this.content[this.position - 1];
      console.log(`prev position ${this.position - 1}`);
      const prevBox = await prev.boundingBox();
      console.log(prevBox);
      await puppeteer.scroll(this.page, prevBox.y);
      this.position--;
    }
  }
  async like() {}
  async dispose() {
    await this.browser.close();
  }
};
