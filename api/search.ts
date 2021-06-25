import { Handler } from "@netlify/functions";
import data from "./db.json";

type Item = {
  name: string;
  img: string;
  price: number;
};

const handler: Handler = async (event) => {
  const q = event.queryStringParameters;

  let items: Item[] = data;
  if (q.query) {
    items = data.filter((item) =>
      item.name.toLowerCase().includes(q.query.toLowerCase())
    );
  }

  return {
    statusCode: 200,
    body: JSON.stringify(items),
  };
};

export { handler };
