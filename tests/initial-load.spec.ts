import { Direction } from '../src/component/interfaces/direction';
import { makeTest } from './scaffolding/runner';

const itemHeight = 20;

const generateMetaTitle = (settings): string =>
`Viewport height = ${settings.templateSettings.viewportHeight}, ` +
`start index = ${settings.datasourceSettings.startIndex}, ` +
`buffer size = ${settings.datasourceSettings.bufferSize}, ` +
`padding = ${settings.datasourceSettings.padding}`;

const configList = [{
  datasourceSettings: { startIndex: 1, bufferSize: 1, padding: 2 },
  templateSettings: { viewportHeight: 20 }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 3, padding: 0.5 },
  templateSettings: { viewportHeight: 120 }
}, {
  datasourceSettings: { startIndex: -99, bufferSize: 5, padding: 0.5 },
  templateSettings: { viewportHeight: 200 }
}];

const configListWithClip = [{
  datasourceSettings: { startIndex: 1, bufferSize: 2, padding: 1 },
  templateSettings: { viewportHeight: 20 }
}, {
  datasourceSettings: { startIndex: 1, bufferSize: 3, padding: 33 },
  templateSettings: { viewportHeight: 70 }
}, {
  datasourceSettings: { startIndex: 33, bufferSize: 4, padding: 2 },
  templateSettings: { viewportHeight: 99 }
}, {
  datasourceSettings: { startIndex: -50, bufferSize: 10, padding: 0.3 },
  templateSettings: { viewportHeight: 400 }
}];

const configListInfinite = [configListWithClip[1], configListWithClip[3]]
  .map(config => ({
    ...config,
    datasourceSettings: {
      ...config.datasourceSettings,
      infinite: true
    }
  }));

const testViewport = (settings) => (misc) => (done) => {
  const startIndex = settings.datasourceSettings.startIndex;
  const bufferSize = settings.datasourceSettings.bufferSize;
  const padding = settings.datasourceSettings.padding;
  const viewportHeight = settings.templateSettings.viewportHeight;

  const backwardLimit = viewportHeight * padding;
  const forwardLimit = viewportHeight + backwardLimit;
  const backwardFetchCount = Math.ceil((backwardLimit / itemHeight) / bufferSize);
  const forwardFetchCount = Math.ceil((forwardLimit / itemHeight) / bufferSize);
  const fetchCount = backwardFetchCount + forwardFetchCount;
  const first = startIndex - backwardFetchCount * bufferSize;
  const last = startIndex + forwardFetchCount * bufferSize - 1;

  expect(misc.workflow.fetchCount).toEqual(fetchCount);
  expect(misc.workflow.buffer.items.length).toEqual(last - first + 1);
  expect(misc.padding[Direction.backward].getSize()).toEqual(0);
  expect(misc.padding[Direction.forward].getSize()).toEqual(0);
  expect(misc.getElementText(first)).toEqual(`${first} : item #${first}`);
  expect(misc.getElementText(last)).toEqual(`${last} : item #${last}`);
  expect(misc.getElement(first - 1)).toBeFalsy();
  expect(misc.getElement(last + 1)).toBeFalsy();

  done();
};

const testViewportWithClip = (settings) => (misc) => (done) => {
  const startIndex = settings.datasourceSettings.startIndex;
  const bufferSize = settings.datasourceSettings.bufferSize;
  const padding = settings.datasourceSettings.padding;
  const viewportHeight = settings.templateSettings.viewportHeight;

  const backwardLimit = viewportHeight * padding;
  const forwardLimit = viewportHeight + backwardLimit;

  const backwardCount = Math.ceil(backwardLimit / itemHeight);
  const forwardCount = Math.ceil(forwardLimit / itemHeight);
  const realItemsCount = backwardCount + forwardCount;

  const backwardFetchCount = Math.ceil((backwardLimit / itemHeight) / bufferSize);
  const forwardFetchCount = Math.ceil((forwardLimit / itemHeight) / bufferSize);
  const fetchCount = backwardFetchCount + forwardFetchCount;
  const fetchedItemsCount = fetchCount * bufferSize;

  const first = startIndex - backwardCount;
  const last = startIndex - 1 + forwardCount;

  const backwardClipLimit = (backwardFetchCount * bufferSize - backwardCount) * itemHeight;
  const forwardClipLimit = (forwardFetchCount * bufferSize - forwardCount) * itemHeight;

  expect(realItemsCount).not.toEqual(fetchedItemsCount);
  expect(misc.workflow.fetchCount).toEqual(fetchCount);
  expect(misc.workflow.buffer.items.length).toEqual(last - first + 1);
  expect(misc.padding[Direction.backward].getSize()).toEqual(backwardClipLimit);
  expect(misc.padding[Direction.forward].getSize()).toEqual(forwardClipLimit);
  expect(misc.getElementText(first)).toEqual(`${first} : item #${first}`);
  expect(misc.getElementText(last)).toEqual(`${last} : item #${last}`);
  expect(misc.getElement(first - 1)).toBeFalsy();
  expect(misc.getElement(last + 1)).toBeFalsy();

  done();
};

describe('Initial Load Spec', () => {

  describe('No Clip', () => {
    configList.forEach(config =>
      makeTest({
        metatitle: generateMetaTitle(config),
        title: 'should fetch some items with no clip',
        config: config,
        it: testViewport(config)
      })
    );
  });

  describe('Clip', () => {
    configListWithClip.forEach(config =>
      makeTest({
        metatitle: generateMetaTitle(config),
        title: 'should fetch some items with clip',
        config,
        it: testViewportWithClip(config)
      })
    );
  });

  describe('No Clip (infinite)', () => {
    configListInfinite.forEach(config =>
      makeTest({
        metatitle: generateMetaTitle(config),
        title: 'should fetch some items with no clip',
        config: config,
        it: testViewport(config)
      })
    );
  });

});
