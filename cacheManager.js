const { createClient } = require('redis');
const { promisify } = require('util');

const REDIS_PORT = process.env.REDIS_PORT || 6379;
const DEFAULT_TTL = 60; // 1 minute

module.exports = function createRedisClient() {
  const client = createClient(REDIS_PORT);

  client.on('error', err => {
    console.warn('🛑 Failed to connect to Redis server', err);
  });

  client.on('connect', () => {
    console.log(`🟢 Redis client connected on port ${REDIS_PORT}`);
  });

  const setItem = async (key, value, ttl = DEFAULT_TTL) => {
    client.setex(key, ttl, JSON.stringify(value));
    console.log(`💾 Save ${key} in cache 🧰 for ${ttl} seconds`);
  };

  const hasItem = key =>
    new Promise((resolve, reject) => {
      client.exists(key, (err, reply) => {
        if (err) {
          console.log(`🛑 Fail to check if ${key} exists in cache`, err);
          return reject(err);
        }
        return resolve(reply);
      });
    });

  const getItem = key =>
    new Promise((resolve, reject) => {
      client.get(key, (err, reply) => {
        if (reply) {
          console.log(`⏬ Get ${key} from cache 🧰`);
          return resolve(JSON.parse(reply));
        }
        if (err) reject(err);
        console.log(`🛑 Fail to get ${key} from cache`, err);
        return reject(err);
      });
    });

  return {
    getItem,
    setItem,
    hasItem
  };
};
