
/**
 * TODOS:
 * Relative positioning in x/y
 * Child element spacing in containers
 * Other units than just px
 * many others ...
 */

import { ImGuiGestureSystem } from "./ImGestureSystem";
import { convertImElementToHTMLDiv, appendHTMLDivToParent, childrenTheSame, constructSizeType, updateHTMLDiv } from "./Utils/ImGuiHelpers";
import { ImRectElementParams } from "./Elements/ImRectElement";
import { simpleLayout } from "./Utils/ImGuiWebLayoutFunctions";
import { ImConfig, ImGuiState, Vec2, Rect } from "./ImGuiWebTypes";
import { ImContainer, ImElement, ImStackParams, ImStackElement } from "./Elements";
import toPx from "./Utils/ToPixel";

/**
 * A minimal Immediate Mode Graphical User Interface implementation.
 * 
 * Follows an adapted Measure -> Layout -> Draw cycle. 
 * Measure & Layout have been combined into one step.
 * Draw is not really 'drawing' like it would in graphical programming, but will emulate the same behaviour.
 */
export default class ImGuiWeb {
  private readonly config: ImConfig;
  private readonly rootHTMLElement: HTMLDivElement;
  private readonly rootImElement: ImContainer;
  private readonly state: ImGuiState;
  private readonly gestureSystem: ImGuiGestureSystem;

  // Cache things from previous frame in this object - ideally would want to NOT have this
  private prevFrameState: Partial<ImGuiState>;

  constructor(domId: string, canvasSize: Vec2<number>) {
    this.config = {
      canvasSize,
      domId,
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

  /**
   * Called once at the beginning of each frame. This clears last frame's information
   */
  public begin() {
    this.rootImElement.children = [];
    this.state.elements = [this.rootImElement];
    this.state.elementStack = [this.rootImElement.elementIdx];
    this.state.idSet = [];
  }

  /**
   * Called once at the end of each frame. This starts the 'draw' process.
   */
  public end() {
    if (this.state.elementStack.length !== 1) console.error("A container was not closed.");

    let needsRedraw: boolean = this.prevFrameState ? false : true;

    for (const childIdx of this.rootImElement.children) {
      const child = this.state.elements[childIdx];

      if (child instanceof ImContainer && this.checkSubTreeForRedraw(child)) {
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
    } else {
      for (const childIdx of this.rootImElement.children) {
        const child = this.state.elements[childIdx];
        this.update(child);
      }
    }

    this.checkForGestures();

    // cache this frame state
    this.prevFrameState = { ...this.state };
  }

  private checkForGestures() {
    const actionableEvent = this.gestureSystem.endOfFrame();
    if (!actionableEvent) return;

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

  // Draws an element and recursively draws its children. MUST be called AFTER Layout
  private draw(parent: ImElement, element: ImElement): void {
    const elementAsHTMLDiv = element.htmlDivElement
      ? element.htmlDivElement
      : convertImElementToHTMLDiv(element);

    appendHTMLDivToParent(parent.htmlDivElement, elementAsHTMLDiv);

    if (element instanceof ImContainer) {
      for (const childIdx of element.children) {
        const child = this.state.elements[childIdx];
        this.draw(element, child);
      }
    }
  }

  // updates the element's HTMLElement to reflect this render's changes
  private update(element: ImElement): void {

    const htmlDivElement: HTMLDivElement = element.htmlDivElement
      ? element.htmlDivElement
      : document.getElementById(element.id) as HTMLDivElement;

    if (!htmlDivElement) {
      console.log(element);
      return;
    }

    element.htmlDivElement = htmlDivElement;

    updateHTMLDiv(element);

    if (element instanceof ImContainer) {
      for (const childIdx of element.children) {
        const child = this.state.elements[childIdx];
        this.update(child);
      }
    }
  }

  /**
   * Checks an ImContainer element for validity by looking at its children across the previous frame and the current frame.
   * If there is ANY change the entire subtree needs to be redrawn.
   * 
   * TODO - this function can, and needs, to be optimized.
   * 
   * @param element element to check for validity. All of this element's children will be checked as well
   */
  private checkSubTreeForRedraw(element: ImContainer): boolean {
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
    const previousChildren = previousElement && previousElement instanceof ImContainer ? getChildrenFromChildrenIdx(previousElement.children, this.prevFrameState.elements) : [];
    const currChildren = element.children ? getChildrenFromChildrenIdx(element.children, this.state.elements) : [];

    if (!childrenTheSame(previousChildren, currChildren)) return true;

    for (const child of currChildren) {
      if (child instanceof ImContainer && this.checkSubTreeForRedraw(child)) return true;
    }

    return false;
  }

  // all elements MUST have a parent. The only exception is the RootElement
  // empty args will default to use the top-most element in the elementStack
  private addElementAndReturnIndex(element: ImElement, parentIdx?: number): number {
    if (this.state.idSet.includes(element.id)) console.error("Must use unique ids!");

    let elementIdx = this.state.elements.length;
    element.elementIdx = elementIdx;

    this.state.elements.push(element);
    this.state.idSet.push(element.id);

    if (!parentIdx) {
      parentIdx = this.state.elementStack[this.state.elementStack.length - 1];
    }

    // add the element to its appropriate parent
    const parentElement: ImElement = this.state.elements[parentIdx];

    if (!(parentElement instanceof ImContainer)) {
      console.error('parent element was not an instance of ImContainer.');
      return -1;
    }

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
    const stack = new ImStackElement(params);
    const elementIdx = this.addElementAndReturnIndex(stack);
    this.state.elementStack.push(elementIdx);
    stack.layout = this.stackLayout;
  }

  public endStack() {
    const stackIdx = this.popCurrentContainerElement();

    // Todo - make a function to return and cast
    const stackElement: ImStackElement = this.state.elements[stackIdx] as ImStackElement;
    const parentElement: ImElement = this.getCurrentContainerElement();

    stackElement.layout(parentElement, stackElement);
  }

  /**
 * stackLayout will first check to see if all child elements have had thier layout calculated.
 * Then, it will grow to fit all children. If the specified height is greater than the sum of the children,
 * that will be preferred.
 * 
 * @param parent reference to parent container
 * @param self reference to self
 */
  private stackLayout = (parent: ImElement, self: ImStackElement): void => {
    // TODO - spacing children
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

    self.calculatedHeight = Math.max(toPx(self.height), heightSum);
    self.calculatedWidth = Math.max(toPx(self.width), widthSum);

    const x1 = parent.absRect.x1 + toPx(self.margin.left);
    const x2 = parent.absRect.x1 + self.calculatedWidth - toPx(self.margin.right);
    const y1 = parent.absRect.y1 + toPx(self.margin.top);
    const y2 = parent.absRect.y1 + self.calculatedHeight - toPx(self.margin.bottom);

    self.absRect = new Rect(x1, x2, y1, y2);
    self.visibleRect = new Rect(x1, x2, y1, y2);

    self.hasPerformedLayout = true;
  }

  private constructRootDOMElement(domId: string): HTMLDivElement {
    const attemptedQuery = document.getElementById(domId);
    if (!attemptedQuery) {
      console.error('Unable to find a node with the specified id.');
    }

    const rootHTMLElement = attemptedQuery as HTMLDivElement;
    const style = rootHTMLElement.getAttribute('style') || '';
    rootHTMLElement.setAttribute('style', style + `height: ${this.config.canvasSize.y}px; width: ${this.config.canvasSize.x}px;`);

    return rootHTMLElement;
  }

  private constructRootImElement(): ImContainer {
    const rootElement: ImContainer = new ImContainer({
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

  private findAllContainingElements(x: number, y: number, root: ImElement, containing: ImElement[] = []): ImElement[] {
    if (!(root instanceof ImContainer)) return containing;

    for (const childIdx of root.children) {
      const child = this.state.elements[childIdx];
      if (child.absRect.containsPoint(x, y)) {
        containing.push(child);
        this.findAllContainingElements(x, y, child, containing);
      }
    }

    return containing;
  }
}