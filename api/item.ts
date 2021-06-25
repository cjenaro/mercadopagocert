import { Handler } from "@netlify/functions";
import dotenv from "dotenv";
import mp from "mercadopago";
import data from "./db.json";

const mpConfig = {
  access_token: process.env.TEST_ACCESS_TOKEN,
  integrator_id: process.env.INTEGRATOR_ID,
};
dotenv.config();

const handler: Handler = async (event) => {
  mp.configure(mpConfig);
  if (event.httpMethod.toLowerCase() !== "post") {
    return {
      statusCode: 404,
    };
  }

  const referer = event.headers.referer;

  const body = JSON.parse(event.body);
  const items = data.reduce((acc, i) => {
    if (i.name.toLowerCase() === body.item.toLowerCase()) {
      const newItem = {
        unit_price: i.price,
        quantity: 1,
        description: "Dispositivo móvil de Tienda e-commerce",
        currency_id: "$",
        picture_url: i.img,
      };
      acc.push(newItem);
    }

    return acc;
  }, []);

  let preference = {
    items,
    back_urls: {
      success: `${referer}success`,
      pending: `${referer}pending`,
      failure: `${referer}failure`,
    },
    payer: {
      name: body.firstName,
      surname: body.lastName,
      email: body.email,
      phone: {
        area_code: body.areaCode,
        number: Number(body.phone),
      },
      address: {
        zip_code: body.zipCode,
        street_name: body.street,
        street_number: Number(body.streetNumber),
      },
    },
    payment_methods: {
      excluded_payment_methods: [{ id: "amex" }],
      excluded_payment_types: [{ id: "atm" }],
      installments: 6,
    },
    external_reference: "jen.calvineo@gmail.com",
    notification_url: `${referer}api/notifications`,
  };

  try {
    const response = await mp.preferences.create(preference);
    let id = response.body.id;
    return {
      statusCode: 200,
      body: JSON.stringify({ id }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};

export { handler };
