const { createClient } = require('redis');

const REDIS_PORT = process.env.REDIS_PORT || 6379;

module.exports = function createRedisClient() {
  const client = createClient(REDIS_PORT);

  client.on('error', err => {
    console.warn(err);
  });

  client.on('connect', () => {
    console.log('Redis client connected');
  });

  const setItem = async (key, value, ttl) => {
    client.setex(key, ttl, JSON.stringify(value));
  };

  const getItem = key => {
    return new Promise((resolve, reject) => {
      client.get(key, (err, reply) => {
        if (reply) return resolve(reply);
        if (err) reject(err);
        return reject();
      });
    });
  };

  const hasItem = key => {
    return new Promise((resolve, reject) => {
      client.exists(key, (err, reply) => {
        if (err) return reject(err);
        return resolve(reply);
      });
    });
  };

  return {
    getItem,
    setItem,
    hasItem
  };
};
