import {run} from "~/server/helpers/xandrHelper";

export default defineEventHandler( async (event) => {
    return await run()
})