## React-VideoCall
Demo app: https://morning-escarpment-67980.onrender.com  

<img align="right" width="420" src="https://raw.githubusercontent.com/nguymin4/react-videocall/master/screenshots/1.png"  alt =" " style="border: solid 1px #d4d4d4" />
  
Video call to your friend without registering. 
Simply send your friend your auto-generated unique ID to make the call.  
Everytime you open a new tab, the server gives you a totally different unique ID.

### Installation

```
npm install -g yarn

yarn install
```

### Development

Run server
```
yarn watch:server
```

Run webpack-dev-server
```
yarn watch:client
```


### Deployment

**Render** (Free - Recommended)

<a href="https://render.com/deploy?repo=https://github.com/nguymin4/react-videocall/tree/production" style="display: block; margin-bottom: 20px">
  <img src="https://render.com/images/deploy-to-render-button.svg" alt="Deploy to Render" height="36px">
</a>

**Heroku**

<a href="https://render.com/deploy?repo=https://github.com/nguymin4/react-videocall/tree/production" style="display: block; margin-bottom: 20px">
  <img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy to Heroku" height="37.5px">
</a>

**Custom**
```
# Install dependencies
yarn install

# Build front-end assets
yarn build

# Run server
yarn start
```
