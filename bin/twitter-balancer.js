#! /usr/bin/env node

/**
 * Tweet Balancer
 * ==================
 * Enforces that the number of tweets you make never exceeds the number
 * of followers you have. 
 * 
 * Why? I don't know. It just feels right.
 * 
 * Why should the dumb things we say live in perpetuity? 
 * What does it matter?
 * Whom does this help, beyond Twitter's investors?
 * 
 */

const Twitter = require("twitter");
const homedir = require('os').homedir();
const chalk = require('chalk');
const credentials_file = `${homedir}/.twitter-balancer.json`;
let twitter_credentials, client;

console.log(`\nLoading credentials from ${credentials_file}\n`)

try {
  twitter_credentials = require(credentials_file);  
}catch(error) {
  console.log(chalk.red.bold(`Error loading app credentials!\n--`));
  console.log(`Couldn't find your Twitter app credentials at ${credentials_file}.`);
  console.log(`Please follow these instructions for creating a Twitter app: https://github.io/guide\n`);
  return;
}

try {
  client = new Twitter(twitter_credentials);  
}catch(error){
  console.log(chalk.red.bold(`Problem creating Twitter API client\n--`));
  console.log(`We had a problem creating the Twitter API client.`);
  console.log(`Double check that your credentials are correct at ${credentials_file}\n`);
  return;
}


const params = {
  screen_name: twitter_credentials.screen_name,
  count: 200,
  include_rts: false
};

const tweet_ids = [];
let followers_count = false;
let statuses_count = false;
let permitted_tweets = 0;

(async () => {  
  const checkTweets = async () => {    
    const tweets = await client.get("statuses/user_timeline", params);
        
    // Update follower/status count if needed (first time through) && collect tweets
    if (tweets.length > 0) {      
      if (!followers_count && !statuses_count) {
        followers_count = tweets[0].user.followers_count;
        statuses_count = tweets[0].user.statuses_count;  
        permitted_tweets = followers_count - statuses_count - 1
      }

      if (params.max_id && params.max_id !== tweets[tweets.length - 1].id) {
        tweets.forEach(tweet => tweet_ids.push(tweet.id_str));
      }
    }

    // if we've collecte dall the tweets
    if (tweets.length <= 1) {
      console.log(chalk.bold(`* Arrived at oldest tweet: ${params.max_id}`));

      // if we have more tweets than followers we delete the 
      // tweets until it's balanced, starting with the oldest tweets
      if (permitted_tweets < 0) {
        console.log(`We need to delete ${-permitted_tweets} tweets from your timeline (${followers_count} followers, ${statuses_count} tweets).`);

        // start with the oldest tweets and delete from there
        const tweets_to_delete = tweet_ids.slice(permitted_tweets).reverse();
        let tweets_deleted = 0;

        // cycle through tweets to delete and respond
        for (let i = 0; i < tweets_to_delete.length; i++) {
          const tweet_id = tweets_to_delete[i];
          try {
            const tweet_delete_response = await client.post(`statuses/destroy/${tweet_id}`,{id: tweet_id});
            console.log(chalk.bold(`Successfully deleted this tweet (${tweet_id}): ${chalk.red(tweet_delete_response.text)}`));
            tweets_deleted++;
          } catch (error) {
            console.log(chalk.red.bold(`Error trying to delete tweet ${tweet_id}`));
            console.log(error);
          }
        }

        console.log(chalk.bold(`\n${chalk.green(tweets_deleted)} tweets successfully deleted.`));
      }else{
        console.log(chalk.green.bold(`\nNo tweets to delete! You are well balanced (${followers_count} followers, ${statuses_count} tweets) 🙂\n`));
      }
    } else {
      params.max_id = tweets.length > 0 ? tweets[tweets.length - 1].id : params.max_id;
      console.log(`${chalk.blue(tweet_ids.length)} tweets collected so far. Checking tweets older than ${params.max_id}`);
      checkTweets();
    }
  };

  try {
    await checkTweets();
  }catch(error){
    console.log(chalk.red(`Error\n--`));
    console.log(`${error[0].message}`);
    
    if (error[0].message === 'Could not authenticate you.') {
      console.log(`Double check that your credentials are correct at ${credentials_file}\n`);
    }
    
    return;
  }
  
})();