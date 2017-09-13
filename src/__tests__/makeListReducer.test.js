import makeListReducer, {
  listReducer,
  addItem,
  addItems
} from "../makeListReducer";

const initAction = { type: "@@INIT" };
const initialState = [{ id: 1, name: "Hello" }, { id: 3, name: "World" }];
const reducer = makeListReducer(initialState);

describe("makeListReducer", () => {
  it("sets the initial state correctly", () => {
    expect(reducer(undefined, initAction)).toEqual(initialState);
  });

  it("adds multiple elements to the state", () => {
    const items = [{ id: 6, name: "Hola" }, { id: 8, name: "Mundo" }];
    const expectedState = [...initialState, ...items];
    expect(reducer(initialState, addItems(items))).toEqual(expectedState);
  });

  it("adds a single item to the state", () => {
    const item = { id: 9, name: "Gracias" };
    const expectedState = [...initialState, item];
    expect(reducer(initialState, addItem(item))).toEqual(expectedState);
  });
});

describe("listReducer", () => {
  it("sets the initial state to an empty list", () => {
    expect(listReducer(undefined, initAction)).toEqual([]);
  });
});
