const EventEmmiter = require("events");

class PageEmmiter extends EventEmmiter {}

const pageHandler = new PageEmmiter();
pageHandler.on("page.closed", () => {
  console.log("need log for page clsoed?");
});
module.exports = { pageHandler };
