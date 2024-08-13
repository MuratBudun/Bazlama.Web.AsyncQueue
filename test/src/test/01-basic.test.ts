import { setupServer } from "msw/node"
import { endpointHandlers, getUrl, asyncDelay } from "../mocks/endpoints"
import { BazlamaAsyncQueue, TAsyncQueueTaskEventHandlers, TAsyncQueueTaskEventNames } from 'bazlama-web-asyncqueue'

const fetch = require("node-fetch")
const server = setupServer(...endpointHandlers)

interface IEventListenerListItem {
    eventName: TAsyncQueueTaskEventNames,
    isFired: boolean
}

class EventStates {
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

describe("NGOAsyncQueue", () => {
    describe("Basic", () => {
        beforeAll(() => server.listen())
        afterEach(() => server.resetHandlers())
        afterAll(() => server.close())


        it("should be task canceled", async () => {
            let queue = new BazlamaAsyncQueue(5000, 500)
            let eventState: EventStates = new EventStates(["start", "loading", "cancel", "complete"])
            queue.enqueue({ 
                task: async (controller: AbortController) => {
                    return await (await fetch("http://www.bazlama.com/user?delay=3000", { signal: controller.signal })).json()
                },
                events: eventState.queueEvents
            })
        
            await asyncDelay(600)
            queue.cancelAllRunningTasks()
            await asyncDelay(300)
            eventState.checkEvents()
        })

        it("should be enqueue the task function", async () => {
            const queue = new BazlamaAsyncQueue(2000, 500)
            let eventState: EventStates = new EventStates(["start", "success", "complete"])
            queue.enqueue({ 
                task: async (controller: AbortController) => {
                    return await (await fetch(getUrl("user"), { signal: controller.signal })).json()
                },
                events: eventState.queueEvents,
            })

            await asyncDelay(300)
            eventState.checkEvents()
        })

        it("should be enqueue the task object", async () => {
            const queue = new BazlamaAsyncQueue(2000, 500)
            let eventState: EventStates = new EventStates(["start", "success", "complete"])
            queue.taskEventsManager.addEventListener("all", eventState.queueEvents.all!)

            queue.enqueue({
                name: "Task 1",
                task: async (controller: AbortController) => {
                    return await (await fetch(getUrl("user"), { signal: controller.signal })).json()
                }
            })

            await asyncDelay(300)
            eventState.checkEvents()
        })

        it("should be enqueue fire network error", async () => {
            const queue = new BazlamaAsyncQueue(2000, 500)
            let eventState: EventStates = new EventStates(["start", "fail", "complete"])
            queue.enqueue({
                name: "Task 1",
                task: async (controller: AbortController) => {
                    return await (await fetch(getUrl("user", 201, 30, true), { signal: controller.signal })).json()
                },
                events: eventState.queueEvents
            })

            await asyncDelay(300)
            eventState.checkEvents()
        })   
    })
})