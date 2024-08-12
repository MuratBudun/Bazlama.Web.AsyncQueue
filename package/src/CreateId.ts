export default function createId(prefix: string = "", suffix: string = ""): string {
    return `${prefix ? `${prefix}-` : ""}${Math.floor(Math.random() * Date.now())}${suffix ? `-${suffix}` : ""}`
}