import { ImConfig, Vec2, ImElement, ImRectElementParams, ImStack, ImStackParams, Rect, ImGuiState, ImGuiGestureSystem } from "./ImGuiWebTypes";
import { constructSizeType, constructSyleString, childrenTheSame } from "./ImGuiHelpers";
import { simpleLayout } from "./ImGuiWebLayoutFunctions";

export default class ImGui {
  private readonly config: ImConfig;
  private readonly rootHTMLElement: HTMLDivElement;
  private readonly rootImElement: ImElement;
  private readonly state: ImGuiState;
  private readonly gestureSystem: ImGuiGestureSystem;

  // Cache things from previous frame in this object - ideally would want to NOT have this
  private prevFrameState: Partial<ImGuiState>;

  constructor(domId: string, canvasSize: Vec2<number>, debug: boolean = true) {
    this.config = {
      canvasSize,
      domId,
      debug,
    };

    this.state = {
      elements: [],
      elementStack: [],
      idSet: [],
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
    this.state.idSet = [];
  }

  // called after begin to end compiling elements and start the draw process
  public end() {
    this.assert(this.state.elementStack.length === 1, "A container was not closed.");

    let needsRedraw: boolean = this.prevFrameState ? false : true;

    for (const childIdx of this.rootImElement.children) {
      const child = this.state.elements[childIdx];

      if (this.test(child)) {
        needsRedraw = true;
        break;
      }
    }

    if (needsRedraw) {
      this.rootHTMLElement.innerHTML = '';

      for (const childIdx of this.rootImElement.children) {
        const child = this.state.elements[childIdx];
        this.draw(this.rootImElement, child);
      }
    }

    this.checkForGestures();

    // cache this frame state
    this.prevFrameState = { ...this.state };
  }

  private checkForGestures() {
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

  private getCurrentContainerElementIndex(): number {
    return this.state.elementStack[this.state.elementStack.length - 1];
  }

  private getCurrentContainerElement(): ImElement {
    return this.state.elements[this.getCurrentContainerElementIndex()];
  }

  private popCurrentContainerElement(): number {
    const currContainerIdx = this.state.elementStack[this.state.elementStack.length - 1];
    this.state.elementStack.pop();
    return currContainerIdx;
  }

  private invalidateElementAndChildren(element: ImElement): void {

  }

  // Draws an element and recursively draws its children. MUST be called AFTER Layout
  private draw(parent: ImElement, element: ImElement): void {
    const elementAsHTMLDiv = element.htmlDivElement
      ? element.htmlDivElement
      : this.convertImElementToHTMLDiv(element);

    this.appendHTMLDivToParent(parent.htmlDivElement, elementAsHTMLDiv);

    // const elementInLastFrame = this.prevFrameState && this.prevFrameState.idSet.includes(element.id);
    // const elementInThisFrame = this.state.idSet.includes(element.id);

    // // if (elementNeedsRedraw) debugger;

    // if (elementInLastFrame && !elementInThisFrame) {
    //   // remove element from dom
    //   this.removeHTMLDivFromParent(parent.htmlDivElement, elementAsHTMLDiv);
    // } else if (!elementInLastFrame && elementInThisFrame) {
    //   // add element to dom
    //   this.appendHTMLDivToParent(parent.htmlDivElement, elementAsHTMLDiv);
    // }

    if (element.children) {
      for (const childIdx of element.children) {
        const child = this.state.elements[childIdx];
        this.draw(element, child);
      }
    }
  }

  private test(element: ImElement): boolean {
    if (!element.children || element.children.length === 0) return false;

    // check to see if the children are the same
    const getChildrenFromChildrenIdx = (idxs: number[], elements: ImElement[]) => {
      const children: ImElement[] = [];

      for (const idx of idxs) {
        children.push(elements[idx]);
      }

      return children;
    }

    const previousElement = this.prevFrameState && this.prevFrameState.elements.find((e: ImElement) => e.id === element.id);
    const previousChildren = previousElement && previousElement.children ? getChildrenFromChildrenIdx(previousElement.children, this.prevFrameState.elements) : [];
    const currChildren = element.children ? getChildrenFromChildrenIdx(element.children, this.state.elements) : [];

    // console.log('Prev Children: ', previousChildren);
    // console.log('Curr children: ', currChildren);

    if (!childrenTheSame(previousChildren, currChildren)) return true;

    for (const child of currChildren) {
      if (this.test(child)) return true;
    }

    return false;
  }

  private freshPaint() {
    // while (this.rootHTMLElement.firstChild) {
    //   // if there is a first there is a last
    //   this.rootHTMLElement.removeChild(this.rootHTMLElement.lastChild as ChildNode);
    // }
    // clean root im element
    this.rootImElement.children = [];
  }

  // all elements MUST have a parent. The only exception is the RootElement
  // empty args will default to use the top-most element in the elementStack
  private addElementAndReturnIndex(element: ImElement, parentIdx?: number): number {
    this.assert(!this.state.idSet.includes(element.id), "Must use unique ids!");

    let elementIdx = this.state.elements.length;
    element.elementIdx = elementIdx;

    this.state.elements.push(element);
    this.state.idSet.push(element.id);

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
    const stackIdx = this.popCurrentContainerElement();

    // Todo - make a function to return and cast
    const stackElement: ImStack = this.state.elements[stackIdx] as ImStack;
    const parentElement: ImElement = this.getCurrentContainerElement();

    stackElement.layout(parentElement, stackElement);
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
        widthSum = Math.max(widthSum, child.calculatedWidth);
      }

      self.calculatedHeight = heightSum;
      self.calculatedWidth = widthSum;
    } else {
      for (const childIdx of self.children) {
        const child = this.state.elements[childIdx];

        child.layout(self, child);

        child.absRect.moveHorizontally(widthSum);

        heightSum = Math.max(heightSum, child.calculatedHeight);
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
    const style = rootHTMLElement.getAttribute('style');
    rootHTMLElement.setAttribute('style', style + `height: ${this.config.canvasSize.y}px; width: ${this.config.canvasSize.x}px;`);

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
    htmlDivElement.addEventListener('click', () => console.log('clicked: ', element.id));

    element.htmlDivElement = htmlDivElement;

    return htmlDivElement;
  }

  private appendHTMLDivToParent(parent: HTMLDivElement, div: HTMLDivElement): void {
    if (!parent.contains(div)) {
      parent.appendChild(div);
    }
  }

  private removeHTMLDivFromParent(parent: HTMLDivElement, div: HTMLDivElement): void {
    if (parent.contains(div)) {
      parent.removeChild(div);
    } else {
      // check to see if ID matches
      for (let idx = 0; idx < parent.children.length; idx++) {
        const child = parent.children[idx];
        if (child.id === div.id)
          child.remove();
      }
    }
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