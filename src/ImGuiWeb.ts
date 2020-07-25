import { ImConfig, Vec2, ImElement, ImRectElementParams, ImStack, ImStackParams, Rect } from "./ImGuiWebTypes";
import { constructSizeType } from "./ImGuiHelpers";
import { simpleLayout } from "./ImGuiWebLayoutFunctions";

export default class ImGui {
  private readonly config: ImConfig;
  private readonly rootHTMLElement: HTMLDivElement;
  private readonly rootImElement: ImElement;

  constructor(domId: string, canvasSize: Vec2<number>, debug: boolean = true) {
    this.config = {
      canvasSize,
      elements: [],
      elementStack: [],
      domId,
      debug
    };

    this.rootHTMLElement = this.constructRootDOMElement(domId);
    this.rootImElement = this.constructRootImElement();
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
      this.draw(this.rootImElement, child);
    }

    this.log('End is finished: Children of root: ', this.rootHTMLElement.childElementCount);
    this.log('# elements: ', this.config.elements.length);
    this.log('# elements in stack: ', this.config.elementStack.length);
  }

  private getCurrentContainerElement(): number {
    return this.config.elementStack[this.config.elementStack.length - 1];
  }

  private popCurrentContainerElement(): number {
    const currContainerIdx = this.config.elementStack[this.config.elementStack.length - 1];
    this.config.elementStack.pop();
    return currContainerIdx;
  }

  // Draws an element and recursively draws its children. MUST be called AFTER Layout
  private draw(parent: ImElement, element: ImElement) {
    const elementAsHTMLDiv = element.htmlDivElement
      ? element.htmlDivElement
      : this.convertImElementToHTMLDiv(element);

    this.appendHTMLDivToHTMLElement(parent.htmlDivElement, elementAsHTMLDiv);

    if (element.children) {
      for (const childIdx of element.children) {
        const child = this.config.elements[childIdx];
        this.draw(element, child);
      }
    }
  }

  private freshPaint() {
    this.log('Cleaning the root element. Children#: ', this.rootHTMLElement.childElementCount);
    while (this.rootHTMLElement.firstChild) {
      // if there is a first there is a last
      this.rootHTMLElement.removeChild(this.rootHTMLElement.lastChild as ChildNode);
    }
    this.log('While first, remove last. Children#: ', this.rootHTMLElement.childElementCount);

    // clean root im element
    this.rootImElement.children = [];
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
    this.popCurrentContainerElement();
  }

  /**
 * stackLayout will first check to see if all child elements have had thier layout calculated.
 * Then, it will grow to fit all children.
 * 
 * @param parent reference to parent container
 * @param self reference to self
 */
  private stackLayout = (parent: ImElement, self: ImStack): void => {
    let heightSum = 0;
    let widthSum = 0;
    let childSpacing = 0;

    if (self.orientation === 'vertical') {
      for (const childIdx of self.children) {
        const child = this.config.elements[childIdx];

        child.layout(self, child);

        heightSum += child.calculatedHeight;
        widthSum += child.calculatedWidth;
      }

      self.calculatedHeight = heightSum;
      self.calculatedWidth = widthSum;
    } else {
      for (const childIdx of self.children) {
        const child = this.config.elements[childIdx];

        child.layout(self, child);

        child.absRect.moveHorizontally(widthSum);

        heightSum += child.calculatedHeight;
        widthSum += child.calculatedWidth;
      }

      self.calculatedHeight = heightSum;
      self.calculatedWidth = widthSum;
    }

    self.absRect = new Rect(parent.absRect.x1, parent.absRect.x1 + self.calculatedWidth, parent.absRect.y1, parent.absRect.y1 + self.calculatedHeight);

    self.hasPerformedLayout = true;
  }

  private constructRootDOMElement(domId: string): HTMLDivElement {
    const attemptedQuery = document.getElementById(domId);
    if (!attemptedQuery) {
      console.error('Unable to find a node with the specified id.');
    }

    const rootHTMLElement = attemptedQuery as HTMLDivElement;
    rootHTMLElement.setAttribute('style', `height: ${this.config.canvasSize.y}px; width: ${this.config.canvasSize.x}px;`);
    return rootHTMLElement;
  }

  private constructRootImElement(): ImElement {
    const rootElement: ImElement = new ImElement({
      id: 'ImGuiWeb-Root',
      height: constructSizeType(this.config.canvasSize.x, 'px'),
      width: constructSizeType(this.config.canvasSize.x, 'px'),
    });

    rootElement.absRect = new Rect(0, this.config.canvasSize.x, 0, this.config.canvasSize.y);
    rootElement.hasPerformedLayout = true;
    rootElement.children = [];
    rootElement.elementIdx = 0;
    rootElement.htmlDivElement = this.rootHTMLElement;

    return rootElement;
  }

  private convertImElementToHTMLDiv(element: ImElement): HTMLDivElement {
    const htmlDivElement = document.createElement('div');
    let styleStr = `height: ${element.height.val}${element.height.unit}; width: ${element.width.val}${element.width.unit};position: relative;`;
    if (element.backgroundColor) {
      styleStr += `background: ${element.backgroundColor}`;
    }
    htmlDivElement.setAttribute('style', styleStr);
    htmlDivElement.setAttribute('id', element.id);
    element.htmlDivElement = htmlDivElement;
    return htmlDivElement;
  }

  private appendHTMLDivToHTMLElement(parent: HTMLElement, div: HTMLDivElement): void {
    parent.appendChild(div);
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