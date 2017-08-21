'use strict';

// Collection Record Definition
module.exports.collection = {
  //$schema: 'http://json-schema.org/draft-04/schema#',
  title: 'Collection Object',
  description: 'Cumulus-api Collection Table schema',
  type: 'object',
  properties: {
    name: {
      title: 'Name',
      description: 'Collection short_name registered with the CMR',
      type: 'string'
    },
    version: {
      title: 'Version',
      description: 'The version registered with the CMR.',
      type: 'string'
    },
    dataType: {
      title: 'DataType',
      description: 'This is used to identify a granule in a PDR',
      type: 'string'
    },
    process: {
      title: 'Process',
      description: 'Name of the docker process to be used, e.g. modis, aster',
      type: 'string'
    },
    provider_path: {
      title: 'Provider Path',
      description: 'The path to look for the collection Granules or ' +
                   'PDRs. Use regex for recursive search',
      type: 'string',
      default: '/'
    },
    url_path: {
      title: 'Url Path',
      description: 'The folder (url) used to save granules on S3 buckets',
      type: 'string'
    },
    granuleId: {
      title: 'GranuleId Validation Regex',
      description: 'The regex used to validate the granule id generated by the system',
      type: 'string'
    },
    granuleIdExtraction: {
      title: 'GranuleId Extraction Regex',
      description: 'The regex used to extract the granule id from granule id filenames',
      type: 'string'
    },
    sampleFileName: {
      title: 'Sampe Filename',
      description: 'Is used to validate to test granule id ' +
                   'validation and extraction regexes against',
      type: 'string'
    },
    files: {
      title: 'Files',
      description: 'List of file definitions',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          regex: {
            title: 'Regex',
            description: 'Regex used to identify the file',
            type: 'string'
          },
          sampleFileName: {
            title: 'Sample Filename',
            description: 'Filename used to validate the provided regex',
            type: 'string'
          },
          bucket: {
            title: 'Bucket',
            description: 'Bucket name used to store the file',
            type: 'string'
          },
          url_path: {
            title: 'Url Path',
            description: 'Folder used to save the granule in the bucket. ' +
                         'Defaults to the collection url path',
            type: 'string'
          }
        },
        required: [
          'regex',
          'sampleFileName',
          'bucket'
        ]
      }
    },
    createdAt: {
      type: 'number',
      readonly: true
    },
    updatedAt: {
      type: 'number',
      readonly: true
    }
  },
  required: [
    'name',
    'version',
    'granuleId',
    'granuleIdExtraction',
    'sampleFileName',
    'files',
    'createdAt',
    'updatedAt'
  ]
};

// Granule Record Schema
module.exports.granule = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'Granule Object',
  type: 'object',
  properties: {
    granuleId: {
      title: 'Granule ID',
      type: 'string',
      readonly: true
    },
    pdrName: {
      title: 'PDR associated with the granule',
      type: 'string',
      readonly: true
    },
    collection: {
      title: 'Collection associated with the granule',
      type: 'string',
      readonly: true
    },
    status: {
      title: 'Ingest status of the granule',
      enum: ['running', 'completed', 'failed'],
      type: 'string',
      readonly: true
    },
    execution: {
      title: 'Step Function Execution link',
      type: 'string',
      readonly: true
    },
    cmrLink: {
      type: 'string',
      readonly: true
    },
    published: {
      type: 'boolean',
      default: false,
      description: 'shows whether the granule is published to CMR',
      readonly: true
    },
    duration: {
      title: 'Ingest duration',
      type: 'number',
      readonly: true
    },
    files: {
      title: 'Files',
      description: 'List of file definitions',
      type: 'array',
      items: {
        type: 'object'
      }
    },
    error: {
      type: 'string',
      readonly: true
    },
    createdAt: {
      type: 'number',
      readonly: true
    }
  },
  required: [
    'granuleId',
    'collection',
    'status',
    'execution',
    'createdAt'
  ]
};

//// Invoke Record Schema
//module.exports.invoke = {
  //$schema: 'http://json-schema.org/draft-04/schema#',
  //title: 'Invoke Record Object',
  //type: 'object',
  //properties: {
    //collectionName: {
      //type: 'string'
    //},
    //invokeSchedule: {
      //type: 'string'
    //},
    //invokedAt: {
      //type: 'number'
    //},
    //createdAt: {
      //type: 'number'
    //},
    //updatedAt: {
      //type: 'number'
    //}
  //}
//};

// PDR Record Schema
module.exports.pdr = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'PDR Record Object',
  type: 'object',
  properties: {
    pdrName: {
      title: 'PDR Name',
      type: 'string',
      readonly: true
    },
    collection: {
      title: 'Collection Name',
      type: 'string',
      readonly: true
    },
    provider: {
      title: 'Provider Name',
      type: 'string',
      readonly: true
    },
    status: {
      type: 'string',
      enum: ['running', 'failed', 'completed'],
      readonly: true
    },
    progress: {
      type: 'number',
      readonly: true
    },
    execution: {
      type: 'string',
      readonly: true
    },
    PANsent: {
      type: 'boolean',
      readonly: true
    },
    PANmessage: {
      type: 'string',
      readonly: true
    },
    stats: {
      type: 'object',
      properties: {
        total: {
          type: 'number'
        },
        completed: {
          type: 'number'
        },
        failed: {
          type: 'number'
        },
        processing: {
          type: 'number'
        }
      }
    },
    address: {
      type: 'string',
      readonly: true
    },
    originalUrl: {
      type: 'string',
      readonly: true
    },
    createdAt: {
      type: 'number',
      readonly: true
    }
  },
  required: [
    'pdrName',
    'provider',
    'collection',
    'status',
    'createdAt'
  ]
};

// Provider Schema => the model keeps information about each ingest location
module.exports.provider = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'Provider Object',
  description: 'Keep the information about each ingest endpoint',
  type: 'object',
  properties: {
    id: {
      title: 'Provider Name',
      type: 'string'
    },
    globalConnectionLimit: {
      title: 'Concurrent Connnection Limit',
      type: 'number',
      default: 10
    },
    protocol: {
      title: 'Protocol',
      type: 'string',
      enum: ['http', 'ftp', 'sftp'],
      default: 'http'
    },
    host: {
      title: 'Host',
      type: 'string'
    },
    port: {
      title: 'Port',
      type: 'string'
    },
    username: {
      type: 'string'
    },
    password: {
      type: 'string'
    },
    createdAt: {
      type: 'number',
      readonly: true
    },
    updatedAt: {
      type: 'number',
      readonly: true
    }
  },
  required: [
    'id',
    'globalConnectionLimit',
    'protocol',
    'host',
    'createdAt'
  ]
};

