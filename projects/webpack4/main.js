// @flow

type Foo = {
  bar: boolean,
  baz?: string
};

const f = (x: Foo) => {
  console.log(x.bar, x.baz);
}

f({
  bar: 'true',
  baz: 'false',
});
