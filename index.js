const express = require('express');
const axios = require('axios');
const createRedisClient = require('./cacheManager');

const BASE_API_URL = 'https://www.swapi.tech/api/people/';
const PORT = process.env.PORT || 3000;

const app = express();
const redisClient = createRedisClient();

app.get('/people', async (req, res) => {
  const { personId } = req.query;
  const url = `${BASE_API_URL}${personId}`;

  try {
    const isInCache = await redisClient.hasItem(personId); // return 0 or 1
    if (isInCache) {
      const reply = await redisClient.getItem(personId);
      const parsedReply = JSON.parse(reply);
      res.status(200).send({ person: parsedReply, message: 'retrieved from cache' });
    } else {
      const person = await axios.get(url);
      await redisClient.setItem(personId, person.data, 3600);
      res.status(200).send({ person: person.data, message: 'cache missed' });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
