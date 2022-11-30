import {fire} from "~/server/helpers/fire";

export default defineEventHandler((event) => {
    fire()
    return {
        api: 'works'
    }
})
