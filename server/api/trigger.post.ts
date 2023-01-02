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
import fs from "fs";
import handlebars from "handlebars";
import aws from "@aws-sdk/client-ses";
import nodemailer, {SentMessageInfo} from "nodemailer";
import path, { dirname} from "path";

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

interface MailContainer {
    game: string,
    backgroundColor: string,
    status: string,
    campaignName: string,
    purse: number
}

const config = useRuntimeConfig()

export default defineEventHandler( async (event) => {
    const list: Array<Game> = []
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
        let success = false
        let sendEmail = false
        let status = CAMPAIGN_DEACTIVATED_TEXT
        let backgroundColor = 'background-color: rgb(128, 128, 128);'

        const token = await retrieveToken()

        const gameData = await parseRssFeed()

        for (let i=0; i<gameData.length; i++) {

            const game = gameData[i]
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
                        console.log(`Activating MEGA_MILLIONS_LOW ${game.jackpot}`)

                        if (megaLineItemLowState !== GameState.ACTIVE) {
                            sendEmail = true
                        }
                    }

                    if (game.jackpot >= 400 && game.jackpot <= 550) {
                        status = CAMPAIGN_ACTIVATED_TEXT
                        backgroundColor = ACTIVATED_CAMPAIGN_STYLE

                        const result = await toggleLineItemState(token, lineItemMap.get(Games.MEGA_MILLIONS_HIGH), config.advertiserId, GameState.ACTIVE)
                        console.log(`Activating MEGA_MILLIONS_HIGH ${game.jackpot}`)

                        if (megaLineItemHighState !== GameState.ACTIVE) {
                            sendEmail = true
                        }
                    }

                    if (game.jackpot > 550) {
                        status = CAMPAIGN_DEACTIVATED_TEXT

                        const result = await toggleLineItemState(token, lineItemMap.get(Games.MEGA_MILLIONS_HIGH), config.advertiserId, GameState.INACTIVE)
                        console.log(`Dectivating MEGA_MILLIONS_HIGH ${game.jackpot}`)

                        if (megaLineItemHighState !== GameState.INACTIVE) {
                            sendEmail = true
                        }
                    }

                    if (game.jackpot < 250) {
                        status = CAMPAIGN_DEACTIVATED_TEXT

                        const result = await toggleLineItemState(token, lineItemMap.get(Games.MEGA_MILLIONS_LOW), config.advertiserId, GameState.INACTIVE)
                        console.log(`Dectivating MEGA_MILLIONS_LOW ${game.jackpot}`)

                        if (megaLineItemLowState !== GameState.INACTIVE) {
                            sendEmail = true
                        }
                    }
                }

                if (game.name === GameNames.POWERBALL) {

                    const powerballItemLowStateRequest = await getLineItemById(token, lineItemMap.get(Games.POWERBALL_LOW))
                    const powerballItemLowState = powerballItemLowStateRequest.response["line-item"].state
                    const powerballItemHighStateRequest = await getLineItemById(token, lineItemMap.get(Games.POWERBALL_HIGH))
                    const powerballItemHighState = powerballItemHighStateRequest.response["line-item"].state

                    if (game.jackpot >= 250 && game.jackpot < 400) {
                        status = CAMPAIGN_ACTIVATED_TEXT
                        backgroundColor = ACTIVATED_CAMPAIGN_STYLE

                        const result = await toggleLineItemState(token, lineItemMap.get(Games.POWERBALL_LOW), config.advertiserId, GameState.ACTIVE)
                        console.log(`Activating POWERBALL_LOW ${game.jackpot}`)

                        if (powerballItemLowState !== GameState.ACTIVE) {
                            sendEmail = true
                        }
                    }

                    if (game.jackpot >= 400 && game.jackpot <= 550) {
                        status = CAMPAIGN_ACTIVATED_TEXT
                        backgroundColor = ACTIVATED_CAMPAIGN_STYLE

                        const result = await toggleLineItemState(token, lineItemMap.get(Games.POWERBALL_HIGH), config.advertiserId, GameState.ACTIVE)
                        console.log(`Activating POWERBALL_HIGH ${game.jackpot}`)

                        if (powerballItemHighState !== GameState.INACTIVE) {
                            sendEmail = true
                        }
                    }

                    if (game.jackpot > 550) {
                        status = CAMPAIGN_DEACTIVATED_TEXT

                        const result = await toggleLineItemState(token, lineItemMap.get(Games.POWERBALL_HIGH), config.advertiserId, GameState.INACTIVE)
                        console.log(`Deactivating POWERBALL_HIGH ${game.jackpot}`)

                        if (powerballItemHighState !== GameState.INACTIVE) {
                            sendEmail = true
                        }
                    }

                    if (game.jackpot < 250) {
                        status = CAMPAIGN_DEACTIVATED_TEXT

                        const result = await toggleLineItemState(token, lineItemMap.get(Games.POWERBALL_LOW), config.advertiserId, GameState.INACTIVE)
                        console.log(`Deactivating POWERBALL_LOW ${game.jackpot}`)

                        if (powerballItemLowState !== GameState.INACTIVE) {
                            sendEmail = true
                        }
                    }
                }

                if (game.name === GameNames.HOOSIER_LOTTO) {
                    const hoosierLottoItemStateRequest = await getLineItemById(token, lineItemMap.get(Games.HOOSIER_LOTTO))
                    const hoosierLottoState = hoosierLottoItemStateRequest.response["line-item"].state

                    if (game.jackpot > 10) {
                        status = CAMPAIGN_ACTIVATED_TEXT
                        backgroundColor = ACTIVATED_CAMPAIGN_STYLE

                        const result = await toggleLineItemState(token, lineItemMap.get(Games.HOOSIER_LOTTO), config.advertiserId, GameState.ACTIVE)
                        console.log(`Activating HOOSIER_LOTTO ${game.jackpot}`)

                        if (hoosierLottoState !== GameState.ACTIVE) {
                            sendEmail = true
                        }
                    } else {
                        status = CAMPAIGN_DEACTIVATED_TEXT

                        const result = await toggleLineItemState(token, lineItemMap.get(Games.HOOSIER_LOTTO), config.advertiserId, GameState.INACTIVE)
                        console.log(`Deactivating HOOSIER_LOTTO ${game.jackpot}`)

                        if (hoosierLottoState !== GameState.INACTIVE) {
                            sendEmail = true
                        }
                    }
                }

                if (game.name === GameNames.CASH5) {
                    const cash5ItemStateRequest = await getLineItemById(token, lineItemMap.get(Games.CASH5))
                    const cash5State = cash5ItemStateRequest.response["line-item"].state

                    if (game.jackpot > 1000000) {
                        status = CAMPAIGN_ACTIVATED_TEXT
                        backgroundColor = ACTIVATED_CAMPAIGN_STYLE

                        const result = await toggleLineItemState(token, lineItemMap.get(Games.CASH5), config.advertiserId, GameState.ACTIVE)
                        console.log(`Activating CASH5 ${game.jackpot}`)

                        if (cash5State !== GameState.ACTIVE) {
                            sendEmail = true
                        }
                    } else {
                        status = CAMPAIGN_DEACTIVATED_TEXT

                        const result = await toggleLineItemState(token, lineItemMap.get(Games.CASH5), config.advertiserId, GameState.INACTIVE)
                        console.log(`Deactivating CASH5 ${game.jackpot}`)

                        if (cash5State !== GameState.INACTIVE) {
                            sendEmail = true
                        }
                    }
                }

                const mailContent: MailContainer = {
                    campaignName: "Hoosier Lottery",
                    status,
                    game: game.name,
                    backgroundColor,
                    purse: game.jackpot,
                }

                if (sendEmail) {
                    await buildEmail(mailContent)
                }

            } catch (e) {
                console.log(e)
            }

            success = true
        }
        return success
    }

    return {
        success: await run()
    }
})

async function buildEmail(mailContent: MailContainer) {
    const source = fs.readFileSync(path.join(path.resolve(), 'server', 'templates', 'email.handlebars'), 'utf-8')
    const template = handlebars.compile(source)

    const htmlToSend = template({
        campaignName: mailContent.campaignName,
        campaignStatusMessage: mailContent.status,
        game: mailContent.game,
        backgroundColor: mailContent.backgroundColor,
        purse: mailContent.purse
    })

    const ses = new aws.SES({
        apiVersion: "2010-12-01",
        region: "us-east-1",
        credentials: {
            accessKeyId: config.awsAccessKeyId,
            secretAccessKey: config.awsSecretAccessKey
        }
    })

    const transporter = nodemailer.createTransport({
        SES: { ses, aws}
    })

    await transporter.sendMail({
            from: 'adfire@kortx.io',
            to: 'damon@kortx.io, maria@kortx.io, bryan@kortx.io',
            subject: 'KORTX AdFire Campaign Notification',
            html: htmlToSend
        },
        (err: Error|null, info: SentMessageInfo) => {
            console.log(info)
            console.log(`
            error from buildEmail method: ${err}`)
        })
}