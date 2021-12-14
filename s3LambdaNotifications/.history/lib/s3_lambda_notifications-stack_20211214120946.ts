import { Stack, StackProps, RemovalPolicy, CfnOutput, aws_s3, aws_s3_notifications, Duration, aws_lambda_nodejs, aws_lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';

export class S3LambdaNotificationsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // 👇 define lambda
    const lambdaFunction = new aws_lambda_nodejs.NodejsFunction(this, 'lambda-function', {
      memorySize: 1024,
      timeout: Duration.seconds(5),
      runtime: aws_lambda.Runtime.NODEJS_14_X,
      handler: 'main',
      entry: '/../src/my-lambda/index',
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
      },
    });

    // 👇 create bucket
    const s3Bucket = new aws_s3.Bucket(this, 's3-bucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // invoke lambda every time an object is created in the bucket
    s3Bucket.addEventNotification(
      aws_s3.EventType.OBJECT_CREATED,
      new aws_s3_notifications.LambdaDestination(lambdaFunction),
      // {prefix: 'test/', suffix: '.yaml'},
    );

    new CfnOutput(this, 'bucketName', {
      value: s3Bucket.bucketName,
    });
  }
}
