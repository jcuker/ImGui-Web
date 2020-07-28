interface ImGuiGestureSystemState {
    startingEvent: MouseEvent | null;
    currentEvent: MouseEvent | null;
    eventInProgress?: 'click' | 'drag';
}

export interface ActionableEvent {
    eventType: 'click' | 'drag';
    x: number;
    y: number;
}

export class ImGuiGestureSystem {
    private state: ImGuiGestureSystemState;

    constructor() {
        // 'mousedown', 'mouseup', 'mouseenter', 'mousemove', 'mouseup', 
        ['click'].forEach((eventName: string) => {
            document.addEventListener(eventName, (event: MouseEvent) => {
                event.preventDefault();
                this.processEvent(event);
            }, false);
        });
        this.resetState();
    }

    private resetState() {
        this.state = {
            startingEvent: null,
            currentEvent: null
        }
    }

    public processEvent(e: MouseEvent) {
        if (e.type === 'click') {
            this.state.eventInProgress = 'click';
            this.state.currentEvent = e;
            return;
        }

        if (!this.state.startingEvent) {
            this.state.startingEvent = e;
            this.state.eventInProgress = e.type === 'mousedown' ? 'click' : 'drag';

            return;
        }

        if (this.state.eventInProgress) {
            this.state.eventInProgress === 'click' ? this.handleClickGestureEvent(e) : this.handleDragGestureEvent(e);
        }
    }

    private handleClickGestureEvent(e: MouseEvent): void {
        if (e.type === 'mouseup') {
            this.state.currentEvent = e;
        }
    }

    private handleDragGestureEvent(e: MouseEvent): void {

    }

    public endOfFrame(): ActionableEvent | null {
        if (!this.state.eventInProgress) return;

        let actionable: ActionableEvent;

        if (this.state.eventInProgress === 'click') {
            // if we have two events there has been a 'click'
            if (this.state.currentEvent) {
                actionable = {
                    eventType: 'click',
                    x: this.state.currentEvent.clientX,
                    y: this.state.currentEvent.clientY
                }
            }
        }

        this.resetState();
        return actionable;
    }
}