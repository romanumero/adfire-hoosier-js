import {H3Error} from "h3";
import {handleError} from "~/server/helpers/handleError";

export default defineEventHandler((event) => {
    const config = useRuntimeConfig()
    const apiRoutes = event.req.url?.startsWith("/api")

    if (apiRoutes) {
        const apiTokenHeader = event.req.headers.authorization
        if (apiTokenHeader != config.apiToken) {
            const error = new H3Error("Unauthenticated - Invalid API Token")
            error.statusCode = 401
            handleError(error, event)
        }
    }

})