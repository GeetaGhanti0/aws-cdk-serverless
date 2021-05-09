import { objectLike } from '@aws-cdk/assert';
import { APIGatewayProxyEventV2, Context, APIGatewayProxyStructuredResultV2, APIGatewayProxyHandlerV2  } from 'aws-lambda'
import S3 from 'aws-sdk/clients/s3'
import * as apig from '@aws-cdk/aws-apigatewayv2'


const bucketName = process.env.DOCUMENTS_BUCKET_NAME
const s3 = new S3();

export const getDocuments = async (event:APIGatewayProxyEventV2, context: Context) : Promise<APIGatewayProxyStructuredResultV2> => {
 console.log(`Bucket Name ${bucketName}`)
try {

const { Contents: results } = await s3.listObjects( { Bucket: process.env.DOCUMENTS_BUCKET_NAME! }).promise()
const documents = await Promise.all(results!.map(async r => generateSignedURL(r)))

  return {
    statusCode: 200,
    body: JSON.stringify(documents)
}
 
} catch( err) {
  return {
    statusCode: 500,
    body: err.message
}
}
}

const generateSignedURL = async (object: S3.Object) : Promise<{filename: string, url: string}>  => {
  const url = await s3.getSignedUrlPromise('getObject', {
    Bucket: bucketName,
    Key: object.Key!,
    Expires: (60 * 60)
  })
  return {
    filename: object.Key!,
    url:url
  }
}


// export const handler: APIGatewayProxyHandlerV2 = async (
//     event: APIGatewayProxyEventV2
//   ) => {
//     return {
//       statusCode: 200,
//       headers: { "Content-Type": "text/plain" },
//       body: `Hello, World! Your request was received at ${event.requestContext.time}.`,
//     };
//   };