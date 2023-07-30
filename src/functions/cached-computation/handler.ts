import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";
import { getCachedCalculation, updateCalculation } from "./redis-client";
import { calculate } from "./calculation";

const cachedComputation: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const key = event.body.key

  const cachedResult = await getCachedCalculation(key);

  if (cachedResult) {
    return formatJSONResponse({
      message: cachedResult,
      event,
    });
  }

  await updateCalculation(key, {
    status: "calculating",
  });

  try {
    const result = await calculate(key);
    await updateCalculation(key, {
      status: "finished-success",
      value: result,
    });
    return formatJSONResponse({
      message: result,
      event,
    });
  } catch (error) {
    await updateCalculation(key, {
      status: "finished-failure",
    });

    return formatJSONResponse({
      message: "Error calculating",
      event,
    });
  }
};

export const main = middyfy(cachedComputation);
