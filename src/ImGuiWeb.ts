import { ImConfig, Vec2, ImElement, ImRectElementParams, ImStack, ImStackParams } from "./ImGuiWebTypes";
import { constructSizeType } from "./ImGuiHelpers";
import { simpleLayout } from "./ImGuiWebLayoutFunctions";

export default class ImGui {
  private readonly config: ImConfig;
  private readonly rootDOMElement: HTMLElement;
  private readonly rootImElement: ImElement;

  constructor(domId: string, canvasSize: Vec2<number>, debug: boolean = true) {
    this.config = {
      canvasSize,
      elements: [],
      elementStack: [],
      domId,
      debug
    };

    const attemptedQuery = document.getElementById(domId);
    if (!attemptedQuery) {
      console.error('Unable to find a node with the specified id.');
    }

    this.rootDOMElement = attemptedQuery as HTMLElement;
    this.rootDOMElement.setAttribute('style', `height: ${canvasSize.y}px; width: ${canvasSize.x}px;`);
    this.rootImElement = this.constructRootElement();
  }

  // called to start compiling elements
  public begin() {
    // clear old drawn data
    this.freshPaint();

    this.config.elements = [this.rootImElement];
    this.config.elementStack = [this.rootImElement.elementIdx];
  }

  // called after begin to end compiling elements and start the draw process
  public end() {
    this.assert(this.config.elementStack.length === 1, "A container was not closed.");

    for (const childIdx of this.rootImElement.children) {
      const child = this.config.elements[childIdx];
      if (!child.hasPerformedLayout) child.layout(this.rootImElement, child);
      this.draw(child);
    }
  }

  private getCurrentContainerElement() {
    return this.config.elementStack[this.config.elementStack.length - 1];
  }

  private popCurrentContainerElement() {
    const currContainer = this.config.elementStack[this.config.elementStack.length - 1];
    this.config.elementStack.pop();
    return currContainer;
  }

  // Draws an element and recursively draws its children. MUST be called AFTER Layout
  private draw(element: ImElement) {
    const elementAsDOMNode = this.convertImElementToDOMNode(element);
    this.appendDOMNodeToDocument(elementAsDOMNode);

    if (element.children) {
      for (const childIdx of element.children) {
        const child = this.config.elements[childIdx];
        this.draw(child);
      }
    }
  }

  private freshPaint() {
    while (this.rootDOMElement.firstChild) {
      // if there is a first there is a last
      this.rootDOMElement.removeChild(this.rootDOMElement.lastChild as ChildNode);
    }
  }

  // all elements MUST have a parent. The only exception is the RootElement
  // empty args will default to use the top-most element in the elementStack
  private addElementAndReturnIndex(element: ImElement, parentIdx?: number): number {
    let elementIdx = this.config.elements.length;
    element.elementIdx = elementIdx;
    this.config.elements.push(element);

    if (!parentIdx) {
      parentIdx = this.config.elementStack[this.config.elementStack.length - 1];
    }


    // add the element to its appropriate parent
    const parentElement: ImElement = this.config.elements[parentIdx];
    parentElement.children.push(elementIdx);

    return elementIdx;
  }

  // simple rectangle
  public rect(params: ImRectElementParams) {
    const rect = new ImElement(params);
    rect.layout = simpleLayout;
    this.addElementAndReturnIndex(rect);
  }


  public beginStack(params: ImStackParams) {
    const stack = new ImStack(params);
    const elementIdx = this.addElementAndReturnIndex(stack);
    this.config.elementStack.push(elementIdx);
    stack.layout = this.stackLayout;
  }

  public endStack() {
    this.config.elementStack.pop();
  }

  /**
 * stackLayout will first check to see if all child elements have had thier layout calculated.
 * Then, it will grow to fit all children.
 * 
 * @param parent reference to parent container
 * @param self reference to self
 */
  private stackLayout(parent: ImElement, self: ImElement): void {
    let heightSum = 0;
    let widthSum = 0;

    for (const childIdx of self.children) {
      const child = this.config.elements[childIdx];
      child.layout(self, child);

      heightSum += child.calculatedHeight;
      widthSum += child.calculatedWidth;
    }

    self.calculatedHeight = heightSum;
    self.calculatedWidth = widthSum;

    self.absRect = {
      x1: parent.absRect.x1,
      x2: parent.absRect.x1 + self.calculatedWidth,
      y1: parent.absRect.y1,
      y2: parent.absRect.y1 + self.calculatedHeight,
    };

    self.hasPerformedLayout = true;
  }

  private constructRootElement() {
    const rootElement: ImElement = new ImElement({
      id: 'ImGuiWeb-Root',
      height: constructSizeType(this.config.canvasSize.x, 'px'),
      width: constructSizeType(this.config.canvasSize.x, 'px'),
    });

    rootElement.absRect = {
      x1: 0,
      x2: this.config.canvasSize.x,
      y1: 0,
      y2: this.config.canvasSize.y
    };
    rootElement.hasPerformedLayout = true;
    rootElement.children = [];
    rootElement.elementIdx = 0;

    return rootElement;
  }

  private convertImElementToDOMNode(element: ImElement): Node {
    const domElement = document.createElement('div');
    let styleStr = `height: ${element.height.val}${element.height.unit}; width: ${element.width.val}${element.width.unit};`;
    if (element.backgroundColor) {
      styleStr += `background: ${element.backgroundColor}`;
    }
    domElement.setAttribute('style', styleStr);
    domElement.setAttribute('id', element.id);
    return domElement;
  }

  private appendDOMNodeToDocument(node: Node): void {
    this.rootDOMElement.appendChild(node);
  }

  private log(message?: any, ...optionalParams: any[]): void {
    if (this.config.debug) {
      console.log(message, ...optionalParams);
    }
  }

  private getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  private assert(expression: boolean, msg: string) {
    if (!expression) {
      alert(msg);
    }
  }
}