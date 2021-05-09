import * as cdk from '@aws-cdk/core';
import { Bucket, BucketEncryption } from '@aws-cdk/aws-s3'
import { Networking } from './networking'
import { Tags } from '@aws-cdk/core';
import { DocumentManagementAPI } from './api';
import * as s3Deploy from '@aws-cdk/aws-s3-deployment'
import { pathToFileURL } from 'url';
import * as path from 'path'


export class CdkDemoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'MyEncryptedBucket', {
    encryption: BucketEncryption.S3_MANAGED
  });

  new s3Deploy.BucketDeployment(this, 'DocumentsDeployment', {
    sources:[
      s3Deploy.Source.asset(path.join(__dirname, '..', 'documents'))
    ],
      destinationBucket: bucket, 
      memoryLimit: 512
  })

  new cdk.CfnOutput(this, 'DocumentBucketsNameExport', {
    value: bucket.bucketName,
    exportName: 'DocumentBucketName'
  });

  const networkingStack = new Networking(this, 'NetworkingConstruct', {
    maxAzs: 2
  })

  Tags.of(networkingStack).add('Module', 'Networking')

  const api = new DocumentManagementAPI(this, 'DocumentManagementAPI', {
    documentBucket: bucket
  })

  Tags.of(api).add('Module', 'API')


  // aws-samples/aws -refarch-wordpress

    // The code that defines your stack goes here
  }
}
