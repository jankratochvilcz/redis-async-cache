import Redis from "ioredis";

type CalculationPayload =
  | {
      status: "calculating" | "finished-failure";
    }
  | {
      status: "finished-success";
      value: string;
    };

const getClient = () =>
  new Redis({
    host: "localhost",
    port: 6379,
  });

function getRedisKey(calculationHash: string) {
  return `calculations-${calculationHash}`;
}

const updateCalculation = async (
  calculationKey: string,
  payload: CalculationPayload
): Promise<void> => {
  const key = getRedisKey(calculationKey);

  const client = getClient();
  await client.set(key, JSON.stringify(payload), "EX", 10);
  await client.publish(key, JSON.stringify(payload));
};

const getCachedCalculation = async (
  key: string
): Promise<string | null> => {
  const client = getClient();
  const redisKey = getRedisKey(key);

  const result = await client.get(redisKey);

  if (result === null) {
    return null;
  }

  const resultDeserialized = JSON.parse(result) as CalculationPayload;
  if (resultDeserialized.status === "finished-success") {
    return resultDeserialized.value;
  }

  if (resultDeserialized.status === "finished-failure") {
    return null;
  }

  if (resultDeserialized.status === "calculating") {
    let resolveFunc: (value?: string | PromiseLike<string>) => void;
    let rejectFunc: (reason?: any) => void;

    const promise = new Promise<string>((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    await client.subscribe(redisKey);

    client.on("message", (channel, message) => {
      if (channel !== redisKey) {
        return;
      }

      console.log(message)

      const messageDeserialized = JSON.parse(message) as CalculationPayload;
      if (messageDeserialized.status === "finished-failure") {
        client.unsubscribe(redisKey)
        rejectFunc(null);
      }

      if (messageDeserialized.status === "finished-success") {
        client.unsubscribe(redisKey)
        resolveFunc(messageDeserialized.value);
      }
    });

    return promise;
  }
};

export { updateCalculation, getCachedCalculation };
