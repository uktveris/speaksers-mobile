# Language learning app mobile frontend

> **Note:** the project is still in the development, so some bugs might be present, as well as some features might not be available to a full extent.

The framework used to create this project is [Expo](https://expo.dev). The project itself is a app for practice speaking diaglogues with peers.

## install & lauch

Install dependencies

   ```bash
  npm install
   ```

Start the app locally

   ```bash
  npx expo start
   ```

## build the app
in this project usually builds are done on [EAS servers](https://docs.expo.dev/build/introduction/). EAS client has to be present on the machine. In order for the build to work, EAS credentials have to be provided (profile info or access token) before submitting the app for the build. Also, different builds need different environmental variable values, so those should also be pulled from EAS servers before starting a new build. Build can receive arguments for a platform and build environment.

Checking EAS auth details:
  ```bash
  eas whoami
  ```

Logging in with EAS:
  ```bash
  eas login
  ```

Pulling environmental variables from EAS (environments include: development, preview and production):
  ```bash
  eas env:pull --environment development
  ```
The ```development``` option here could be exchanged with ```preview``` or ```production``` environments.

SUbmitting the build to EAS:
  ```bash
  eas build --platform android --profile development
  ```
The ```development``` option here could be exchanged with ```preview``` or ```production``` environments, while platforms available are ```android```, ```ios``` or ```all```.

> **Note:** in order to get all features (such as call mechanics), the [backend](https://github.com/uktveris/speaksers-backend) should be also installed and run. It provides features such as websocket signalling for webrtc call peer matching.
