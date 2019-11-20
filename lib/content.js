module.exports = class Content {
  constructor(page) {
    this.page = page;
    this.content = [];
    this.position = -1;
    this.currentBox = {};
    page.$("div[id^='more_pager_pagelet_']").then(feed => (this.feed = feed));
  }
  //return current position
  current() {
    return this.content[this.position];
  }
  //parse feed -> save into this.contnet
  async update() {
    console.log("UPDATE CONTENT");
    this.content = await this.parseFeed();
    console.log(`updatet to ${this.content.length}`);
    return this.content;
  }
  //:Array[] ElementHandle - parse current feed
  async parseFeed() {
    //geting ElementHandle for current page with current heght
    //convert arrays in array to simple array
    const flatten = arr =>
      arr.reduce(
        (flat, toFlatten) =>
          flat.concat(
            Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten
          ),
        []
      );
    //get array of arrays with content
    const blocks = await this.feed.$$("._4ikz");
    //get content in div :ElementHandle
    const divs = await Promise.all(
      blocks.map(async item => {
        const block = await item.$$("div[id^='hyperfeed_story_id_']");
        return block;
      })
    );
    /*flatten(divs).map(async item => {
      const box = await item.boundingBox();
      console.log(box);
    });*/
    return flatten(divs);
  }
  async next() {
    const scroll = async (page, y) => {
      await page.evaluate(_viewportHeight => {
        window.scrollBy(0, _viewportHeight);
      }, y);
    };

    const next = this.content[++this.position];
    await next.focus();

    console.log(`position ${this.position}`);
    console.log(await this.feed.boundingBox());
    //need scroll to next div

    const nextBox = await next.boundingBox();
    await scroll(this.page, nextBox.y);

    console.log(this.content.length);
    if (this.position > this.content.length * 0.8) this.update();
  }
  async previous() {}
};
