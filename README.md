# Tweeter Totter

```
🦜           🦜
--____--______--
      /\
```

Keep your Twitter tweet-to-follower ratio in check.

## Getting setup

You will need to create credentials for your app at [developer.twitter.com](https://developer.twitter.com) and create a hidden JSON file in your home directory at for your operating system:

- Windows: `/home/<USERNAME>/.tweeter-totter.json`
- Mac: `/Users/<USERNAME>/.tweeter-totter.json`
- Linux: `/home/<USERNAME>/.tweeter-totter.json`

Look at the `credentials-example.json` file in this repository to see how it should be structured.

## How to use

Once you've setup your credentials you can run Tweeter Totter:

`node bin/tweeter-totter.js`

If you'd like to install it globally so that you can simply invoke `tweeter-totter` from anywhere you can do so like this:

`npm install -g`