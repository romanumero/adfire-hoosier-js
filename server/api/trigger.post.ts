import {z} from "zod";

const auth = z.object({
    "response": z.object({
        "status": z.string(),
        "token": z.string()
    })
})

const lineItem = z.object({
    "response": z.object({
        "line-item": z.object({
            "id": z.number(),
            "state": z.string()
        })
    })
})

export default defineEventHandler( async (event) => {

    const config = useRuntimeConfig()
    async function retrieveToken() {
        const authBody = {auth: {username: config.xandrUsername, password: config.xandrPassword}}

        const result = await $fetch('https://api.appnexus.com/auth',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: authBody
            })

        return auth.parse(result).response.token
    }

    async function getLineItemById(auth: string, id: string) {

        const result = await $fetch(`https://api.appnexus.com/line-item?id=${id}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth
                }
            })

        return lineItem.parse(result)
    }

    async function run() {
        const token = await retrieveToken()
        const lineItem = await getLineItemById(token, '18599662')
        return lineItem
    }

    return {
        api: await run()
    }
})