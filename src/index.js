// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
var Promise = require("bluebird");
const express = require('express')
const app = express()
const port = 4000

console.log('Starting consumer')
// Set region
AWS.config.update({ region: 'eu-west-2' });

var sqs = new AWS.SQS({ apiVersion: '2012-11-05', endpoint: 'http://localstack:4566' });

var queueURL = "http://localstack:4566/000000000000/local_queue";

var params = {
    MaxNumberOfMessages: 10,
    MessageAttributeNames: [
        "All"
    ],
    QueueUrl: queueURL,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 5
};


(async () => {
    console.log('Polling queue')
    while (true) {
        sqs.receiveMessage(params, function (err, data) {
            if (err) {
                console.log("Receive Error", err);
            } else if (data.Messages) {
                var deleteParams = {
                    QueueUrl: queueURL,
                    ReceiptHandle: data.Messages[0].ReceiptHandle
                };
                sqs.deleteMessage(deleteParams, function (err, data) {
                    if (err) {
                        console.log("Delete Error", err);
                    } else {
                        console.log("Message Deleted", data);
                    }
                });
            }
        });

        await Promise.delay(5000);
    }
})();

app.listen(port, () => {
    console.log(`Consumer server listening at http://localhost:${port}`)
})