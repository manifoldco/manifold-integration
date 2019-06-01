const { withUiHook } = require('@zeit/integration-utils');

let count = 0;

module.exports = withUiHook(() => {
  count += 1;
  return `
    <Page>
      <P>Counter: ${count}</P>
      <Button>Count Me</Button>
    </Page>
  `;
});
