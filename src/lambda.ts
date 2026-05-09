import awsLambdaFastify from '@fastify/aws-lambda';
import { init } from './app';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

let proxy: any;

export const handler = async (event: APIGatewayProxyEvent, context: Context) => {
  if (!proxy) {
    const app = await init();
    proxy = awsLambdaFastify(app);
  }
  return proxy(event, context);
};
