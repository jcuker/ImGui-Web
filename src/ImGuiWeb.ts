import { ImConfig, Vec2, ImElement, ImRectElementParams, ImStack, ImStackParams, Rect, ImGuiState, ImGuiGestureSystem } from "./ImGuiWebTypes";
import { constructSizeType, constructSyleString } from "./ImGuiHelpers";
import { simpleLayout } from "./ImGuiWebLayoutFunctions";

export default class ImGui {
  private readonly config: ImConfig;
  private readonly rootHTMLElement: HTMLDivElement;
  private readonly rootImElement: ImElement;
  private readonly state: ImGuiState;
  private readonly gestureSystem: ImGuiGestureSystem;;

  constructor(domId: string, canvasSize: Vec2<number>, debug: boolean = true) {
    this.config = {
      canvasSize,
      domId,
      debug,
    };

    this.state = {
      elements: [],
      elementStack: [],
    };

    this.rootHTMLElement = this.constructRootDOMElement(domId);
    this.rootImElement = this.constructRootImElement();

    this.gestureSystem = new ImGuiGestureSystem();
  }

  // called to start compiling elements
  public begin() {
    // clear old drawn data
    this.freshPaint();

    this.state.elements = [this.rootImElement];
    this.state.elementStack = [this.rootImElement.elementIdx];
  }

  // called after begin to end compiling elements and start the draw process
  public end() {
    this.assert(this.state.elementStack.length === 1, "A container was not closed.");

    for (const childIdx of this.rootImElement.children) {
      const child = this.state.elements[childIdx];
      if (!child.hasPerformedLayout) child.layout(this.rootImElement, child);
      this.draw(this.rootImElement, child);
    }

    this.checkForGestures();

    this.log('End is finished: Children of root: ', this.rootHTMLElement.childElementCount);
    this.log('# elements: ', this.state.elements.length);
    this.log('# elements in stack: ', this.state.elementStack.length);
  }

  private checkForGestures() {
    this.log('checking for gestures');

    const actionableEvent = this.gestureSystem.endOfFrame();
    if (!actionableEvent) return;

    this.log('Found an actionable gesture');

    const containingElements = this.findAllContainingElements(actionableEvent.x, actionableEvent.y, this.rootImElement);

    if (actionableEvent.eventType === 'click') {
      for (let idx = containingElements.length - 1; idx >= 0; idx--) {
        const element = containingElements[idx];
        if (element.onClick) {
          element.onClick(element);
          return;
        }
      }
    }
  }

  private findAllContainingElements(x: number, y: number, root: ImElement, containing: ImElement[] = []): ImElement[] {
    if (!root.children) return containing;

    for (const childIdx of root.children) {
      const child = this.state.elements[childIdx];
      if (child.absRect.containsPoint(x, y)) {
        containing.push(child);
        this.findAllContainingElements(x, y, child, containing);
      }
    }

    return containing;
  }

  private getCurrentContainerElement(): number {
    return this.state.elementStack[this.state.elementStack.length - 1];
  }

  private popCurrentContainerElement(): number {
    const currContainerIdx = this.state.elementStack[this.state.elementStack.length - 1];
    this.state.elementStack.pop();
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
        const child = this.state.elements[childIdx];
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
    let elementIdx = this.state.elements.length;
    element.elementIdx = elementIdx;
    this.state.elements.push(element);

    if (!parentIdx) {
      parentIdx = this.state.elementStack[this.state.elementStack.length - 1];
    }


    // add the element to its appropriate parent
    const parentElement: ImElement = this.state.elements[parentIdx];
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
    this.state.elementStack.push(elementIdx);
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
        const child = this.state.elements[childIdx];

        child.layout(self, child);

        child.absRect.moveVertically(heightSum);

        heightSum += child.calculatedHeight;
        widthSum += child.calculatedWidth;
      }

      self.calculatedHeight = heightSum;
      self.calculatedWidth = widthSum;
    } else {
      for (const childIdx of self.children) {
        const child = this.state.elements[childIdx];

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

    const styleStr = constructSyleString(element);

    htmlDivElement.setAttribute('style', styleStr);
    htmlDivElement.setAttribute('id', element.id);

    // if (element.onClick) {
    //   htmlDivElement.addEventListener('click', function (event) {
    //     element.onClick(element);
    //   });
    // }

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