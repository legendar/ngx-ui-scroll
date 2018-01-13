import Elements from '../elements';
import Data from '../data';

class Render {

  static renderPending = false;

  static run(items = null, direction = null) {
    return new Promise((resolve, reject) => {
      self.renderPending = true;
      setTimeout(() => {
        self.renderPending = false;
        if (items) {
          self.setElements(items);
          resolve(items);
        }
        reject();
      });
    });
  }

  static setElements(items) {
    items.forEach(item => {
      for (let i = Elements.viewport.childNodes.length - 1; i >= 0; i--) {
        const node = Elements.viewport.childNodes[i];
        if (node.id) {
          if (node.id === Data.getItemId(item.$index)) {
            item.element = node;
          }
        }
      }
      if (!item.element) { // todo: just remove this
        throw new Error('Can not associate item with element');
      }
    });
  }

}

const self = Render;
export default Render;