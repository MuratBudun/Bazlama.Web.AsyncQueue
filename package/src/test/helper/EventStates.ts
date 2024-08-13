import { TAsyncQueueTaskEventHandlers, TAsyncQueueTaskEventNames } from "../../type/TAsyncQueueTaskEventHandlers"

export interface IEventListenerListItem {
    eventName: TAsyncQueueTaskEventNames,
    isFired: boolean
}

export class EventStates {
    private events: IEventListenerListItem[] = []

    constructor(eventNames: TAsyncQueueTaskEventNames[]) {
        eventNames.forEach((event: TAsyncQueueTaskEventNames) => {
            this.events.push({ eventName: event, isFired: false })
        })

        this.reset()
    }

    public reset() {
        this.events.forEach((event: IEventListenerListItem) => {
            event.isFired = false
        })
    }

    public queueEvents: TAsyncQueueTaskEventHandlers = {
        all: async (eventName: TAsyncQueueTaskEventNames) => {
            this.events.forEach((event: IEventListenerListItem) => {
                if (event.eventName === eventName) {
                    event.isFired = true
                }
            })
        }
    }

    public checkEvents() {
        this.events.forEach((event: IEventListenerListItem) => {
            try {
                expect(event.isFired).toBeTruthy()
            } catch (e) {
                throw new Error(`${event.eventName} state is ${event.isFired}`)
            }
        })
    }
}