'use strict';

const test = require('ava');
const { randomString } = require('@cumulus/common/test-utils');
const { s3, recursivelyDeleteS3Bucket } = require('@cumulus/common/aws');
const { Search } = require('../es/search');
const indexer = require('../es/indexer');
const bootstrap = require('../lambdas/bootstrap');
const models = require('../models');
const migrations = require('../migrations');
const migration0 = require('../migrations/migration_0');
const migration1 = require('../migrations/migration_1');
const { fakeGranuleFactory, fakeExecutionFactory } = require('../lib/testUtils');

let esClient;
const esIndex = randomString();
process.env.internal = randomString();
process.env.stackName = randomString();
const granulesTable = `${process.env.stackName}-GranulesTable`;
const executionsTable = `${process.env.stackName}-ExecutionsTable`;

test.before(async () => {
  await s3().createBucket({ Bucket: process.env.internal }).promise();

  await models.Manager.createTable(granulesTable, { name: 'granuleId', type: 'S' });
  await models.Manager.createTable(executionsTable, { name: 'arn', type: 'S' });
  esClient = await Search.es();
  await bootstrap.bootstrapElasticSearch('fakehost', esIndex);
});

test.after.always(async () => {
  await recursivelyDeleteS3Bucket(process.env.internal);
  await models.Manager.deleteTable(granulesTable);
  await models.Manager.deleteTable(executionsTable);
});

test.serial('Run migrations the first time, it should run', async (t) => {
  const options = { msg: 'this is a test' };
  const output = await migrations([migration0], options);
  t.is(output.length, 1);
  t.is(output[0], options);

  const Key = `${process.env.stackName}/migrations/migration_0`;

  await s3().headObject({
    Bucket: process.env.internal,
    Key
  }).promise();
});

test.serial('Run the migration again, it should not run', async (t) => {
  const output = await migrations([migration0]);
  t.is(output.length, 0);

  const Key = `${process.env.stackName}/migrations/migration_0`;

  await s3().headObject({
    Bucket: process.env.internal,
    Key
  }).promise();
});

test.serial('migrate records from ES to DynamoDB', async (t) => {
  // add 15 granules records
  const granules = [];
  Array.from(Array(15).keys()).forEach(() => granules.push(fakeGranuleFactory()));

  // add 15 execution records
  const executions = [];
  Array.from(Array(15).keys()).forEach(() => executions.push(fakeExecutionFactory()));

  // make sure tables and es indexes are empty
  const granuleIndex = new Search({}, 'granule', esIndex);
  const executionIndex = new Search({}, 'execution', esIndex);

  let granuleCount = await granuleIndex.count();
  t.is(granuleCount.meta.found, 0);

  let executionCount = await executionIndex.count();
  t.is(executionCount.meta.found, 0);

  // adding records to elasticsearch
  await Promise.all(granules.map((g) => indexer.indexGranule(esClient, g, esIndex)));
  await Promise.all(executions.map((e) => indexer.indexExecution(esClient, e, esIndex)));

  granuleCount = await granuleIndex.count();
  t.is(granuleCount.meta.found, 15);

  executionCount = await executionIndex.count();
  t.is(executionCount.meta.found, 15);

  // run migration
  await migration1.run({
    tables: [
      granulesTable,
      executionsTable
    ],
    elasticsearch_host: `${process.env.LOCALSTACK_HOST}:4571`,
    elasticsearch_index: esIndex
  });

  // check records exists in dynamoDB
  granuleCount = await granuleIndex.count();
  t.is(granuleCount.meta.found, 15);

  executionCount = await executionIndex.count();
  t.is(executionCount.meta.found, 15);

  const granuleModel = new models.Granule();
  await Promise.all(granules.map((g) => granuleModel.get({ granuleId: g.granuleId })));

  const executionModel = new models.Execution();
  await Promise.all(executions.map((e) => executionModel.get({ arn: e.arn })));
});