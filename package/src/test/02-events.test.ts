import { setupServer } from "msw/node"
import { endpointHandlers, getUrl, asyncDelay } from "../mocks/endpoints"
import BazlamaAsyncQueue from "../BazlamaAsyncQueue"
import { EventStates } from "./helper/EventStates"

const fetch = require("node-fetch")
const server = setupServer(...endpointHandlers)

describe("NGOAsyncQueue", () => {
    describe("Events", () => {
        beforeAll(() => server.listen())
        afterEach(() => server.resetHandlers())
        afterAll(() => server.close())

        it("should be fire start and complete events", async () => {
            const queue = new BazlamaAsyncQueue(2000, 500)
            const eventState = new EventStates(["start", "complete"])
            
            queue.enqueue(async (controller: AbortController) => {
                return await (await fetch(getUrl("user"), { signal: controller.signal })).json()
            })
    
            await asyncDelay(300)
            eventState.checkEvents()
        })
    
        it("should be fire start, loadingMask, complete events", async () => {
            const queue = new BazlamaAsyncQueue(2000, 200)
            const eventState = new EventStates(["start", "loading", "complete"])
  
            queue.enqueue(async (controller: AbortController) => {
                return await (await fetch(getUrl("user", 200, 300), { signal: controller.signal })).json()
            })
    
            await asyncDelay(400)
            eventState.checkEvents()
        })
    
        it("should be fire start, loadingMask, timeout, complete events", async () => {
            const queue = new BazlamaAsyncQueue(1000, 200)
            const eventState = new EventStates(["start", "loading", "timeout", "complete"])

            queue.enqueue(async (controller: AbortController) => {
                return await (await fetch(getUrl("user", 200, 1100), { signal: controller.signal })).json()
            })

            await asyncDelay(1400)
            eventState.checkEvents()
        })    
        
        it("should be fire start, loading, fail, complete events", async () => {
            const queue = new BazlamaAsyncQueue(1000, 200)
            const eventState = new EventStates(["start", "loading", "fail", "complete"])

            queue.enqueue(async (controller: AbortController) => {
                const result = await (await fetch(getUrl("user", 200, 1100, true), { signal: controller.signal })).json()
                throw new Error("Error")
            })

            await asyncDelay(1400)
            eventState.checkEvents()
        }) 
    })
})
