const functions = require('@google-cloud/functions-framework');
const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

const datasetId = 'OnboardingTest';
const tableId = 'UserpilotTest';

functions.cloudEvent('helloPubSub', async (cloudEvent) => {
  const message = cloudEvent.data.message;
  if (!message || !message.data) {
    console.error('No message data received.');
    return;
  }

  try {
    const payload = Buffer.from(message.data, 'base64').toString();
    const parsedData = JSON.parse(payload);

    await bigquery.dataset(datasetId).table(tableId).insert([parsedData]);

    console.log(`Inserted data into BigQuery table: ${datasetId}.${tableId}`);
  } catch (error) {
    console.error('Error inserting data into BigQuery:', error.message);
    throw new Error('Error inserting data into BigQuery');
  }
});
