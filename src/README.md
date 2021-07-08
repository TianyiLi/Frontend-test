# Frontend Test - Part 1

## Purpose

This is a simple front-end code challenge created to serve two purposes:

- Show off your skills,
- Give us a better understanding of your skills.

## Time

You will have a maximum of **45 minutes** for this challenge for reading the document, getting familiar with codesandbox and coding.

## The Task

The programming challenge exists in 2 parts:

- Part 1: Basic Requirements
- [Part 2: Extra Challenges](https://hackmd.io/u_sfOmt1S5uXieCqf-mFow)

### API

You will have a fake API created by `miragejs` package, according to the following specifications:

- Method: `GET`
- URL: `/api/properties`
- Description:
  To get all properties in the website.
- Response
  - Data: all properteis
    - Each property will include following fields
      - id: unique id of the property
      - state: State of the property in USA
      - city: City of the property in USA
      - type: The type of the property which including `Apartment`, `Single-family`, `Townhomes`, `Condo`.
      - price: The monthly price for renting the house. the unit is USD.

Example of response:

```json
{
  "data": [
    {
      "id": 1,
      "city": "Attleboro",
      "state": "Georgia",
      "type": "Apartment",
      "price": 218
    },
    {
      "id": 2,
      "city": "Enterprise",
      "state": "Wyoming",
      "type": "Condo",
      "price": 696
    },
    {
      "id": 3,
      "city": "South Hill",
      "state": "Montana",
      "type": "Condo",
      "price": 1190
    }
    // ...
  ]
}
```

### PART 1: Basic Requirements

#### Technical Requirements

- Using `React.js`
- Libraries are not limited, but you will need to use at least one frontend library for style. For example.
  - TypeScript `(recommended)`
  - antd `(recommended)`
  - tailwindcss
  - stlyed-component
  - material
  - bootstrap

#### Feature Requirements

- Because the API may take seconds to finish, so when calling the API, please show the loading page to enhace the UX.
- You will need to make a report page
  - filter all properties in `Georgia` state
  - group by all `state` and `city`
  - each row includes
    - state
    - city
    - total count of the properties in this group
    - average price of the properties in this group

Example

|  State  |   City   | Houses | Avg. Price |
| :-----: | :------: | :----: | :--------: |
| Georgia | Atlanta  |   13   |    630     |
| Georgia | Columbus |   5    |    800     |
