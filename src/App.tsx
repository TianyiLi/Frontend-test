import "./styles.css";
import "./mock";
import "antd/dist/antd.css";

import type React from "react";
import { Form, Select, Spin, Table } from "antd";
import { useEffect, useMemo, useReducer, useState } from "react";
import { collect, Collection } from "collect.js";
import { ColumnsType } from "antd/lib/table";
type Data = {
  id: number;
  state: string;
  city: string;
  type: string;
  price: number;
};

enum Selected {
  none,
  state = "state",
  city = "city",
  type = "type",
  price = "price"
}

const initState = {
  data: [] as Data[],
  selected: [Selected.none],
  resultList: [] as Data[],
  filtered: {} as Record<Selected, string>
};

function createAction(dispatch: React.Dispatch<unknown>) {
  return {
    createList(data: Data[]) {
      return dispatch({ act: "createList", data });
    },
    selected(data: Selected[]) {
      return dispatch({ act: "selected", data });
    },
    filter(arg: typeof initState.filtered) {
      return dispatch({ act: "filter", data: arg });
    }
  };
}

type builder = {
  [x in keyof ReturnType<typeof createAction>]: {
    act: x;
    data: Parameters<ReturnType<typeof createAction>[x]>[0];
  };
};
type Result = builder[keyof builder];
type Action =
  | {
      act: "createList";
      data: Data[];
    }
  | {
      act: "selected";
      data: Selected[];
    }
  | {
      act: "filter";
      data: typeof initState.filtered;
    };

function countReducer(state = initState, action: Action) {
  switch (action.act) {
    case "createList":
      state = {
        ...state,
        data: action.data,
        resultList: action.data
      };
      break;
    case "filter":
    case "selected":
      if (action.act === "filter") {
        state = {
          ...state,
          filtered: action.data
        };
      }
      if (action.act === "selected") {
        state = {
          ...state,
          selected: action.data.slice()
        };
      }
      state = {
        ...state,
        resultList: state.data
      };
      /* eslint-disable no-labels */
      filter: {
        const keys = Object.keys(state.filtered) as Selected[];
        if (!keys.length) break filter;
        const resultList = keys.reduce((list, key) => {
          if (key === Selected.price) {
            // x00
            const price = +action.data[key];
            const filtered = collect(list).whereBetween("price", [
              price * 100,
              price * 100 + 99
            ]);
            return filtered.all();
          } else {
            const filtered = collect(list).where(key, action.data[key]);
            return filtered.all();
          }
        }, state.data);

        state = { ...state, resultList };
      }
      /* eslint-disable no-fallthrough */
      {
        if (state.selected.includes(Selected.none)) break;
        const collection = collect(state.resultList);
        const result = collection
          .groupBy<Data, string>((ele) =>
            state.selected.reduce((str, select) => {
              let grouppedStr = ele[select];
              if (select === Selected.price) {
                grouppedStr = Math.floor(ele[select] / 100);
              }
              return `${str}${grouppedStr}`;
            }, "")
          )
          .map((list, grouped: string) => {
            const _list = (list as unknown) as Collection<Data>;
            return {
              state: ~state.selected.indexOf(Selected.state)
                ? _list.items[0].state
                : collect(list).unique("state").toArray().length,
              city: ~state.selected.indexOf(Selected.city)
                ? _list.items[0].city
                : collect(list).unique("city").toArray().length,
              type: ~state.selected.indexOf(Selected.type)
                ? _list.items[0].type
                : collect(list).unique("type").toArray().length,
              price: ~state.selected.indexOf(Selected.price)
                ? (() => {
                    const min = Math.floor(
                      collect(list).average("price") / 100
                    );
                    return `${min}00 ~ ${min}99`;
                  })()
                : collect(list).avg("price")
            } as Data;
          });
        console.log(result.toArray());
        state = {
          ...state,
          resultList: result.toArray<Data>().map((ele, id) => ({ ...ele, id }))
        };
      }
      break;
  }
  return state;
}

const columns: ColumnsType<Data> = [
  {
    title: "State",
    dataIndex: "state",
    key: "state"
  },
  {
    title: "City",
    dataIndex: "city",
    key: "city"
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type"
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price"
  }
];

type FormValue = {
  state: string;
  city: string;
  type: string;
  price: string;
};

export default function App() {
  const [state, dispatch] = useReducer(countReducer, initState);

  const act = createAction(dispatch);

  const filterOptions = useMemo(() => {
    const list = state.data.reduce(
      (prev, curr) => {
        prev.city.add(curr.city);
        prev.state.add(curr.state);
        prev.type.add(curr.type);
        const price = Math.floor(curr.price / 100);
        prev.price.add(price);
        return prev;
      },
      {
        city: new Set<string>(),
        state: new Set<string>(),
        type: new Set<string>(),
        price: new Set<number>()
      }
    );

    return {
      city: [{ label: "all", value: "", key: "all" }].concat(
        [...list.city].map((ele) => ({ label: ele, value: ele, key: ele }))
      ),
      state: [{ label: "all", value: "", key: "all" }].concat(
        [...list.state].map((ele) => ({ label: ele, value: ele, key: ele }))
      ),
      type: [{ label: "all", value: "", key: "all" }].concat(
        [...list.type].map((ele) => ({ label: ele, value: ele, key: ele }))
      ),
      price: [{ label: "all", value: "", key: "all" }].concat(
        [...list.price]
          .sort((a, b) => a - b)
          .map((p) => ({
            label: `${p}00 ~ ${p}99`,
            value: "" + p,
            key: `${p}00 ~ ${p}99`
          }))
      )
    };
  }, [state.data]);

  const [fetching, setFetching] = useState(true);
  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        act.createList(data.data);
        setFetching(false);
      });
  }, []);

  console.log(state.filtered);

  return (
    <div className="App">
      <Spin spinning={fetching}>
        <Form
          initialValues={{
            state: "",
            city: "",
            type: "",
            price: "",
            groupBy: [Selected.none]
          }}
          onValuesChange={(value) => {
            if (value.groupBy) {
              act.selected(value.groupBy);
            } else {
              const p = collect({ ...state.filtered, ...value })
                .filter((value) => !!value)
                .all();
              act.filter(p);
            }
          }}
        >
          <Form.Item name="state" label="state">
            <Select options={filterOptions.state} />
          </Form.Item>
          <Form.Item name="city" label="city">
            <Select options={filterOptions.city} />
          </Form.Item>
          <Form.Item name="type" label="type">
            <Select options={filterOptions.type} />
          </Form.Item>
          <Form.Item name="price" label="price">
            <Select options={filterOptions.price} />
          </Form.Item>
          <Form.Item
            name="groupBy"
            label="GroupBy"
            getValueFromEvent={(values) => {
              if (values.slice(-1)[0] === Selected.none || values.length === 0)
                return [Selected.none];
              else return values.filter((ele) => ele !== Selected.none);
            }}
          >
            <Select mode="multiple">
              <Select.Option value={Selected.none}>None</Select.Option>
              <Select.Option value={Selected.state}>State</Select.Option>
              <Select.Option value={Selected.city}>city</Select.Option>
              <Select.Option value={Selected.type}>type</Select.Option>
              <Select.Option value={Selected.price}>price</Select.Option>
            </Select>
          </Form.Item>
        </Form>
        <Table dataSource={state.resultList} rowKey="id" columns={columns} />
      </Spin>
    </div>
  );
}
