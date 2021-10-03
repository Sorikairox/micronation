import { DatabaseEvent } from 'library/database/object/event/DatabaseEvent';
import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { v4 } from 'uuid';
import { Pixel } from './dist/flag/pixel/Pixel';

config();

let client = new MongoClient(process.env.DATABASE_URI, { useUnifiedTopology: true });

const main = async () => {
  client = await client.connect();
  const db = client.db('micronation');
  let i = 2;
  while (i < 100000) {
    const event = new DatabaseEvent()
    event.action = 'creation';
    event.author = v4();
    event.entityId = v4();
    event.data = new Pixel(event.author, `${"#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16)})}`, event.entityId, i);
    event.createdAt = new Date();
    await db.collection('pixel-events').insertOne(event);
    i++;
  }
  await client.close();
}


main();
