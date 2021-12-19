const express = require('express');
const axios = require('axios');
const createRedisClient = require('./cacheManager');

const BASE_API_URL = 'https://www.swapi.tech/api/people/';
const PORT = process.env.PORT || 3000;

const app = express();
const redisClient = createRedisClient();

app.get('/people', async (req, res) => {
  console.time('GET /people ⏳');
  const { personId } = req.query;
  const url = `${BASE_API_URL}${personId}`;

  try {
    const isInCache = await redisClient.hasItem(personId);
    if (isInCache) {
      const personData = await redisClient.getItem(personId);
      res.status(200).send(personData);
    } else {
      console.log(`🔍 Fetching person: ${personId} from API`);
      const person = await axios.get(url);
      redisClient.setItem(personId, person.data); // default ttl is 60 seconds
      res.status(200).send(person.data);
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
  console.timeEnd('GET /people ⏳');
});

app.listen(PORT, () => {
  console.log(`🟢 Server started on port ${PORT}`);
});
