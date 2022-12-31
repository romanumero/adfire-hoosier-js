import {z} from "zod";
import {
    ACTIVATED_CAMPAIGN_STYLE,
    CAMPAIGN_ACTIVATED_TEXT,
    CAMPAIGN_DEACTIVATED_TEXT,
    GameNames,
    Games,
    GameState,
    lineItemMap,
    LOTTERY_URL
} from "~/server/helpers/constants"
import cheerio from "cheerio";
import {SymbolKind} from "vscode-languageserver-types";
import Array = SymbolKind.Array;

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

interface Game {
    name: string,
    jackpot: number
}

export default defineEventHandler( async (event) => {
    const list: Array<Game> = []
    const config = useRuntimeConfig()
    async function parseRssFeed() {
        const contents: string = await $fetch(LOTTERY_URL)
        const $ = cheerio.load(contents)
        const listItems = $('item')

        for (let el of listItems) {
            const game = $(el).children('title').text().split('Jackpot for ')[1]
            const purse = parseFloat($(el).children('description').text().split(': $')[1].split(" ")[0].replace(",", ""))
            list.push({name: game, jackpot: purse})
        }

        return list
    }
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

    async function toggleLineItemState(auth: string, id: string, advertisingId: string, state: string) {

        const result = await $fetch(`https://api.appnexus.com/line-item?id=${id}&advertiser_id=${advertisingId}`,
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

        return lineItem.parse(result)
    }

    async function run() {
        let sendEmail = false
        let status = CAMPAIGN_DEACTIVATED_TEXT
        let backgroundColor = 'background-color: rgb(128, 128, 128);'

        const token = await retrieveToken()

        const gameData = await parseRssFeed()

        for (let game of gameData) {
            try {

                if (game.name === GameNames.MEGA_MILLIONS) {

                    const megaLineItemLowStateRequest = await getLineItemById(token, lineItemMap.get(Games.MEGA_MILLIONS_LOW))
                    const megaLineItemLowState = megaLineItemLowStateRequest.response["line-item"].state
                    const megaLineItemHighStateRequest = await getLineItemById(token, lineItemMap.get(Games.MEGA_MILLIONS_HIGH))
                    const megaLineItemHighState = megaLineItemHighStateRequest.response["line-item"].state


                    if (game.jackpot >= 250 && game.jackpot < 400) {
                        backgroundColor = ACTIVATED_CAMPAIGN_STYLE
                        status = CAMPAIGN_ACTIVATED_TEXT

                        const result = await toggleLineItemState(token, lineItemMap.get(Games.MEGA_MILLIONS_LOW), config.advertiserId, GameState.ACTIVE)
                        console.log(`Activating MEGA_MILLIONS_LOW ${game.jackpot}: ${JSON.stringify(result)}`)

                        if (megaLineItemLowState !== GameState.ACTIVE) {
                            sendEmail = true
                        }
                    }

                    if (game.jackpot >= 400 && game.jackpot <= 550) {
                        status = CAMPAIGN_ACTIVATED_TEXT
                        backgroundColor = ACTIVATED_CAMPAIGN_STYLE

                        const result = await toggleLineItemState(token, lineItemMap.get(Games.MEGA_MILLIONS_HIGH), config.advertiserId, GameState.ACTIVE)
                        console.log(`Activating MEGA_MILLIONS_HIGH ${game.jackpot}: ${JSON.stringify(result)}`)

                        if (megaLineItemHighState !== GameState.ACTIVE) {
                            sendEmail = true
                        }
                    }

                    if (game.jackpot > 550) {
                        status = CAMPAIGN_DEACTIVATED_TEXT

                        const result = await toggleLineItemState(token, lineItemMap.get(Games.MEGA_MILLIONS_HIGH), config.advertiserId, GameState.INACTIVE)
                        console.log(`Dectivating MEGA_MILLIONS_HIGH ${game.jackpot}: ${JSON.stringify(result)}`)

                        if (megaLineItemHighState !== GameState.INACTIVE) {
                            sendEmail = true
                        }
                    }

                    if (game.jackpot < 250) {
                        status = CAMPAIGN_DEACTIVATED_TEXT

                        const result = await toggleLineItemState(token, lineItemMap.get(Games.MEGA_MILLIONS_LOW), config.advertiserId, GameState.INACTIVE)
                        console.log(`Dectivating MEGA_MILLIONS_LOW ${game.jackpot}: ${JSON.stringify(result)}`)

                        if (megaLineItemLowState !== GameState.INACTIVE) {
                            sendEmail = true
                        }
                    }
                }

            } catch (e) {
                console.log(e)
            }
        }


        const lineItem = await getLineItemById(token, '18599662')
        console.log(lineItem)
        return lineItem
    }

    return {
        api: await run()
    }
})