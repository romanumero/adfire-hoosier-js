import {z} from 'zod'
import cheerio from 'cheerio'
import {LOTTERY_URL, Games} from "~/server/helpers/constants";

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

const config = useRuntimeConfig()

async function parseRssFeed(): Promise<string> {
    return await $fetch(LOTTERY_URL)

}

export async function retrieveToken() {
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

export async function getLineItemById(auth: string, id: string) {

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

export async function toggleLineItemState(auth: string, id: string, advertisingId: string, state: string) {

    return await $fetch(`https://api.appnexus.com/line-item?id=${id}&advertiser_id=${advertisingId}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': auth
            },
            body: {
                "line-item": {
                    "id": id,
                    "state": state
                }
            }
        })
}

export async function run() {
    const gameMap = new Map()

    const token = await retrieveToken()

    const contents = await parseRssFeed()
    const $ = cheerio.load(contents)

    const listItems = $('item')

    listItems.each( (idx, el) => {
        const game = $(el).children('title').text().split('Jackpot for ')[1]
        const purse = parseFloat($(el).children('description').text().split(': $')[1].split(" ")[0].replace(",",""))

        if (game === 'Mega Millions') {
            if ( purse >= 250 && purse < 400) {
                console.log(`Activate MEGA_MILLIONS_LOW`)
            } else if (purse < 250) {
                console.log(`Dectivate MEGA_MILLIONS_LOW`)
            }

            if (purse >= 400 && purse <= 550) {
                console.log(`Activate MEGA_MILLIONS_HIGH`)
            } else if (purse > 500) {
                console.log(`Dectivate MEGA_MILLIONS_HIGH`)
            }
        }

        if (game === 'Powerball') {
            if ( purse >= 250 && purse < 400) {
                console.log(`Activate POWERBALL_LOW`)
            } else if (purse < 250) {
                console.log(`Deactivate POWERBALL_LOW`)
            }

            if (purse >= 400 && purse <= 550) {
                console.log(`Activate POWERBALL_HIGH`)
            } else if (purse > 550) {
                console.log(`Deactivate POWERBALL_HIGH`)
            }
        }

    })

    const lineItem = await getLineItemById(token, '19636644')
    const lineItemState = await toggleLineItemState(token, '19636644', config.advertiserId, "inactive")

    return {}
}