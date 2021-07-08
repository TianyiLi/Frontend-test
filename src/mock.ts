import faker from "faker";
import { times } from "lodash";
import { createServer } from "miragejs";

const states = new Set(
  times(10, (n) => {
    return faker.address.state();
  })
);

states.add("Georgia");

const cities = times(10, (n) => {
  return faker.address.city();
});

const types = ["Apartment", "Single-family", "Townhomes", "Condo"];

const mockData = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  state: faker.random.arrayElement(Array.from(states)),
  city: faker.random.arrayElement(cities),
  type: faker.random.arrayElement(types),
  price: faker.datatype.number({ min: 500, max: 1500, precision: 2 })
}));

createServer({
  routes() {
    this.namespace = "api";
    this.timing = 2000;
    this.get("/properties", () => {
      return { data: mockData };
    });
  }
});
