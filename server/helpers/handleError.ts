import {sendError, createError, H3Event, H3Error} from 'h3';

export function handleError (err: H3Error, event: H3Event) {
    const error = createError({
        statusCode: err.statusCode,
        statusMessage: err.statusMessage,
        data: err.data
    });
    sendError(event, error, false)
}