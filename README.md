# AWS-Lambda Compatible Cache for Long-Running Operations

This is a sample that demonstrates a possible approach to use [Redis Pub/Sub](https://redis.io/docs/interact/pubsub/) to implement a shared cache for AWS Lambda functions.

The scenario this solution addresses is where we don't want to kick off multiple expensive computations at once, but instead always reuse the result of the first computation, even if it hasn't finished yet.

## Running It

`npm run start`

Then, hit the server using the below cURL. Parallel requests should result in a single return value.

```shell
curl --location 'http://localhost:3000/dev/cached-computation' \
--header 'Content-Type: application/json' \
--data '{
    "key": "MyKey"
}'
```

Note that 1/3 of the mock computations will intentionally fail to help show how the solution behaves in these circumstances.