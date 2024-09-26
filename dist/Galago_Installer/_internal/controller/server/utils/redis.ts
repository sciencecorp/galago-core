import Redis from "ioredis";
import { logger } from "@/logger"; // our logger import
import { Console } from "console";

const redis_url = process.env.REDIS_URL;
console.log("Redis Url is" + redis_url)
const redis = redis_url ? new Redis(redis_url, {retryStrategy: () => {
    redis.quit();
}}) : new Redis();

//Add connection error handling and debugging 
redis.on("error", function (error) {
  logger.error("Encountered redis error", error);
  console.error("Error in Redis", error);
});

redis.on("end", ()=>{
    logger.error("Redis connection has ended");
})
export default redis;
