const { PubSub } = require('@google-cloud/pubsub');
const pubsub = new PubSub();
const topicName = 'in-app-events';
const crypto = require('crypto');

exports.webhookToPubSub = async (req, res) => {
  try {
    const secret = '*****'; 

    console.log('Received webhook request - Headers:', req.headers);
    console.log('Received webhook request - Body:', req.body);
    
    const signatureHeader = req.get('X-Signature') || '';
    const receivedTimestamp = (signatureHeader.match(/t=(\d+)/) || [])[1];
    const receivedSignature = (signatureHeader.match(/v1=([\w]+)/) || [])[1];

    if (!receivedTimestamp || !receivedSignature) {
      console.log('Missing timestamp or signature in X-Signature header');
      return res.status(400).send('Invalid request');
    }

    // Convert request body to JSON string
    const bodyString = JSON.stringify(req.body);

    // Construct the signature base string
    const signatureBaseString = `${receivedTimestamp}.${bodyString}`;

    // Compute the HMAC SHA-256 signature
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(signatureBaseString)
      .digest('hex');

    // Compare the signatures
    if (computedSignature !== receivedSignature) {
      console.log('Verification failed!');
      return res.status(400).send('Verification failed');
    }

    const dataBuffer = Buffer.from(bodyString);
    const messageId = await pubsub.topic(topicName).publish(dataBuffer);
    res.status(200).send(`Webhook received and published to Pub/Sub successfully (Message ID: ${messageId})`);
  } catch (error) {
    console.error('Error processing the webhook:', error);
    res.status(500).send(`Error processing webhook: ${error.message}`);
  }
};


// const { PubSub } = require('@google-cloud/pubsub');
// const pubsub = new PubSub();
// const topicName = 'in-app-events';

// exports.webhookToPubSub = async (req, res) => {
//   try {
//     const apiKey = '****'; 
//     const queryApiKey = req.query.Authorization;

//     if (!queryApiKey || queryApiKey !== apiKey) {
//       return res.status(401).send('Unauthorized: Invalid API key');
//     }

//     console.log('Received webhook request - Headers:', req.headers);
//     console.log('Received webhook request - Body:', req.body);

//     const dataBuffer = Buffer.from(JSON.stringify(req.body));
//     const messageId = await pubsub.topic(topicName).publish(dataBuffer);

//     res.status(200).send(`Webhook received and published to Pub/Sub successfully (Message ID: ${messageId})`);
//   } catch (error) {
//     console.error('Error processing the webhook:', error);
//     res.status(500).send(`Error processing webhook: ${error.message}`);
//   }
// };
