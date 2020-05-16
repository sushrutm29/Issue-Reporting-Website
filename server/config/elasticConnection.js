var elasticsearch = require('elasticsearch');
var elasticClient = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace',
    apiVersion: '7.6'
  });

module.exports = elasticClient; 