import { setupServer } from "msw/node"
import { endpointHandlers, getUrl, asyncDelay } from "../mocks/endpoints"
import BazlamaAsyncQueue from "../BazlamaAsyncQueue"
import { EventStates } from "./helper/EventStates"

const fetch = require("node-fetch")
const server = setupServer(...endpointHandlers)

describe("NGOAsyncQueue", () => {
    describe("Basic", () => {
        beforeAll(() => server.listen())
        afterEach(() => server.resetHandlers())
        afterAll(() => server.close())

        it("should be task canceled", async () => {
            const queue = new BazlamaAsyncQueue(5000, 500)
            const eventState = new EventStates(["start", "loading", "cancel", "complete"])
            queue.enqueue({ 
                task: async (controller: AbortController) => {
                    return await (await fetch(getUrl("user", 200, 300), { signal: controller.signal })).json()
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
            const eventState: EventStates = new EventStates(["start", "success", "complete"])
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
            const eventState: EventStates = new EventStates(["start", "success", "complete"])
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
            const eventState: EventStates = new EventStates(["start", "fail", "complete"])
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