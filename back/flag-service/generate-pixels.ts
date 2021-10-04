import { DatabaseEvent } from 'library/database/object/event/DatabaseEvent';
import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { v4 } from 'uuid';
import { Pixel } from './src/flag/pixel/Pixel';

config();

let client = new MongoClient(process.env.DATABASE_URI, { useUnifiedTopology: true });

const main = async () => {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('You need to put the number of pixel you want to generate as argument. Example : ts-node generate-pixels 5');
  }
  const numberOfPixelToGenerate = Number(args[0]);

  client = await client.connect();
  const db = client.db('micronation');
  const counter = (await db.collection('counter').findOne({ name: 'pixelCounter' }))?.counter || 0;
  let lastEventId = (await db.collection('counter').findOne({ name: 'pixelEventCounter' }))?.counter || 0;
  let i = counter + 1;
  while (i <= counter + numberOfPixelToGenerate) {
    const event = new DatabaseEvent()
    event.action = 'creation';
    event.author = v4();
    event.entityId = v4();
    event.eventId = ++lastEventId;
    event.data = new Pixel(event.author, `${"#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16)})}`, event.entityId, i);
    event.createdAt = new Date();
    await db.collection('pixel-events').insertOne(event);
    i++;
  }
  await db.collection('counter').findOneAndUpdate({ name: 'pixelCounter' }, { $set :  { counter : counter + numberOfPixelToGenerate } }, { upsert: true });
  await db.collection('counter').findOneAndUpdate({ name: 'pixelEventCounter' }, { $set :  { counter : lastEventId } }, { upsert: true });
  await client.close();
}


main();
