# ![Favicon](target/apple-icon-57x57.png) Software Craft Website [![Build Status](https://travis-ci.org/softwarecrafters/website.svg?branch=master)](https://travis-ci.org/softwarecrafters/website)

The website powering [softwarecraft.org](https://softwarecraft.org), a website for people to find their local [Software Craft](http://manifesto.softwarecraftsmanship.org/) communities.

Feel free to fork this repository and add your local community to it.

## ⚙️ Setup

The website uses [rollup](rollupjs.org) to bundle the client-side JS and some hand-written preprocessing in order to merge and lint the [communities/*.json files](communities/). The app is integrated via [Travis](https://travis-ci.org/softwarecrafters/website) and deployed to [netlify.com](https://www.netlify.com/).

It is helpful to use [nvm](https://github.com/creationix/nvm) in order to make sure you're using the particular [node version](.nvmrc) we are using.

```
nvm install           # installs the node version we are using
npm install -g yarn   # Install yarn
yarn                  # Install dependencies

yarn build            # Build initial version
yarn watch            # Run the watch task
yarn test             # Validate the present schemata
```

## 🌐 Adding your community

If you want to add your local community to the map, please have a look at how the [other communities](communities/) added their community. There is [a JSON schema](communities_schema.json) your `community.json` is validated against through Travis.

1. Fork this repository
2. Create a new file in `communities/${YOURCITYNAME}.json`
3. Enter valid JSON as of [the schema](communities_schema.json)
4. Commit & push your change
5. Create a Pull Request against this repository

### Finding the coordinates of your city...

...can be very tricky, which is why we're logging the current position of your mouse every time you click somewhere on the map.

![GIF showing how a mouse click logs the coordinates under the map to the console](docs/finding_coordinates.gif)

## 👍 Contributing to the website

TBD

## 💻 3rd-party libraries used

To be documented. For the moment, have a look at our [target/vendor/](target/vendor) directory and our [package.json](package.json).

- materialize-css
- rollup
- babel
- font-awesome
- mapbox
- jquery
