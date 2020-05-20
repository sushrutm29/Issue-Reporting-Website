# Issue Reporting Website

## **Table of Contents**

- [Team](#team)
- [Project-Info](#project-info)
- [Quick-Start](#quick-start)
- [Technology](#technology)
  * [Redis-Cache](#redis-cache)
  * [React](#react)
  * [Google-Firebase](#google-firebase)
  * [Elasticsearch](#elasticsearch)
  * [Imagemagick](#imagemagick)

## **Team**

**Team Name**: Virus Free <br />
**Team Members**: Lun-Wei Chang, Saumya Shastri, Shiwani Deo

## **Project-Info**

### GitHub Repository
**Link**: https://github.com/sdeo73/cs554project

Please check out the master branch of our repository.

### Project Description

  The general idea of our issue reporting website is to allow users to report problems that they see around the Stevens community, and then the administrator can address the issues accordingly. The users must login with a registered account first before he/she can view, create, modify or delete an issue post. We will have separate issue boards in order to classify the same, such as: Housing, Maintenance, Tuition etc. <br />
  
  Registered users will not only be able to preview the posts’ details (description and comments) but also comment on the posts. Additionally, all the posts can be sorted by things such as date or type and users will be able to search for certain posts by providing the keyword. We would also utilize the foul language detection technology to try to screen out any harmful content that might have been posted (in the issue post’s details and comments). <br />
  
  Lastly, we would have an administrator panel that would have the clearance to delete or change the state of any issue post. The administrator can also create a new issue board or delete an existing one. 

## **Quick-Start**
### Start the services
> Elasticsearch

Go into your "~/Downloads/elasticsearch-version/bin" directory and type the following command
```
./elasticsearch
```
> Redis

Open a new terminal and start the server by running:
```
redis-server
```
> MongoDB

- Installation: download and install from [MongoDB Community Edition](https://docs.mongodb.com/manual/administration/install-community/)
- Start mongod processes by running this command:
``` 
mongod
```

### Install npm modules
> Client & Server sides:

Open a terminal and run the following command in both "~/cs554project/client" and "~/cs554project/server" directories
```
npm install
```

### Start the servers
Open a terminal and go to 
> Client side: "~/cs554project/client" directory

> Server side: "~/cs554project/server" directory

## **Technology**

### Redis-Cache

We will use Redis mainly for caching search history with the goal of making result retrieval faster.
> Installation:

Download directly from [redis.io](https://redis.io/download)
> Start Redis server:

Open a new terminal and type the following command
```
redis-server
```
> Enter Redis console:

Open a new terminal and type the following command
```
redis-cli
```
> Check Redis Keys:

Use the following command to display all the keys stored in Redis cache
```
KEYS *
```
> Check Redis hash values:
Use following command to display all the values stored in Redis hash
```
HVALS hash_name
```

### React

We will use React to create components in order to update the status of issues in real time on the dashboard.
> [Official Guide](https://reactjs.org/)

### Google-Firebase

We will use Firebase to allow users to login with their choice of social media accounts like Facebook or Gmail.
> [Official Guide](https://firebase.google.com/docs/guides)

### Elasticsearch

Elasticsearch will be used for enabling users to search issues by keywords. This search engine will fetch issues with titles matching user entered keywords. It may be further extended to search for keyword matches in the issue body itself.
> Installation

Download the latest [elasticsearch](https://www.elastic.co/downloads/elasticsearch)
> Start elasticsearch service

- Unzip the downloaded file
- Go into your "~/Downloads/elasticsearch-version/bin" directory and type the following command
```
./elasticsearch
```
> Verify connection

Open an browser and go to http://localhost:9200/ and you should be able to see your elasticsearch service information
### Imagemagick
Since our website is an interactive application, we would offer users the option to upload a profile picture of his/her choice. ImageMagick would be used as it has an extensive range of options for image processing. In the near future, we could also use the same once we add the functionality of attachments on issue posts.

> Installation
- iOS: run the following command
```
brew install imagemagick
```
- Windows: just need to run the npm command to install Imagemagick module
```
npm install imagemagick
```
> [Official Guide](https://www.npmjs.com/package/imagemagick)

