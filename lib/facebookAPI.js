const request = require("request");

module.exports = {
  getUser: async accessToken => {
    const options = {
      method: "GET",
      uri: `https://graph.facebook.com/v4.0/me`,
      qs: {
        access_token: accessToken,
        fields: "id,name,picture.type(large),email"
      }
    };
    return new Promise((resolve, reject) => {
      request(options, (err, res, body) => {
        if (err) {
          reject(err);
        }

        const data = JSON.parse(body);
        resolve(data);
      });
    });
  },

  generateLongLiveUserAccessToken: async accessToken => {
    const options = {
      method: "GET",
      uri: `https://graph.facebook.com/v4.0/oauth/access_token`,
      qs: {
        grant_type: "fb_exchange_token",
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        fb_exchange_token: accessToken
      }
    };
    return new Promise((resolve, reject) => {
      request(options, (err, res, body) => {
        if (err) {
          reject(err);
        }

        const data = JSON.parse(body);
        resolve(data);
      });
    });
  },
  getPages: async (userId, token) => {
    const options = {
      method: "GET",
      uri: `https://graph.facebook.com/v4.0/${userId}/accounts`,
      qs: {
        access_token: token,
        fields: `
                id, name,  emails, location, phone,
                picture.type(large), place_type, price_range, website, about,
                 cover, description, food_styles, founded, hometown, hours`
      }
    };
    return new Promise((resole, reject) => {
      request(options, (err, res, body) => {
        if (err) {
          reject(err);
        }
        const data = JSON.parse(body);
        resole(data.data);
      });
    });
  },
  getPage: async (pageId, token) => {
    const options = {
      method: "GET",
      uri: `https://graph.facebook.com/v4.0/${pageId}`,
      qs: {
        access_token: token,
        fields: `
                  id, name, emails, location, phone,
                  picture.type(large), place_type, price_range, website, about,
                   cover, description, food_styles, founded, hometown, hours`
      }
    };
    return new Promise((resolve, reject) => {
      request(options, function(error, response, body) {
        if (error || body.error) {
          reject(error || body.error);
        }

        const data = JSON.parse(body);
        resolve(data);
      });
    });
  },
  getAlbums: async (pageId, token) => {
    const options = {
      method: "GET",
      uri: `https://graph.facebook.com/v4.0/${pageId}/albums`,
      qs: {
        access_token: token,
        fields: `
                  id,name,cover_photo{id}`
      }
    };
    return new Promise((resolve, reject) => {
      request(options, (err, res, body) => {
        if (err || body.error) {
          reject(err || body.err);
        }

        const data = JSON.parse(body);
        resolve(data.data);
      });
    });
  },
  getAlbum: async (albumId, token) => {
    const options = {
      method: "GET",
      uri: `https://graph.facebook.com/v4.0/${albumId}`,
      qs: {
        access_token: token,
        fields: `
                 cover_photo, id, name, photos,picture`
      }
    };
    return new Promise((resolve, reject) => {
      request(options, (err, res, body) => {
        if (err || body.error) {
          reject(err || body.err);
        }

        const data = JSON.parse(body);
        resolve(data);
      });
    });
  },
  getImages: async (photoId, token) => {
    const options = {
      method: "GET",
      uri: `https://graph.facebook.com/v4.0/${photoId}`,
      qs: {
        access_token: token,
        fields: `
                 images`
      }
    };
    return new Promise((resolve, reject) => {
      request(options, (err, res, body) => {
        if (err || JSON.parse(body).error) {
          reject(err || JSON.parse(body).error);
        }

        const data = JSON.parse(body);
        resolve(data.images);
      });
    });
  }
};
