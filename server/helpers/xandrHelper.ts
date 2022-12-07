import {z} from 'zod'
import cheerio from 'cheerio'
import aws from '@aws-sdk/client-ses'
import nodemailer, {SentMessageInfo} from 'nodemailer'
import fs from 'fs'
import {
    LOTTERY_URL,
    Games,
    lineItemMap,
    GameState,
    CAMPAIGN_DEACTIVATED_TEXT,
    CAMPAIGN_ACTIVATED_TEXT, ACTIVATED_CAMPAIGN_STYLE
} from "~/server/helpers/constants"
import handlebars from "handlebars";

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

interface MailContainer {
    game: string,
    backgroundColor: string,
    status: string,
    campaignName: string,
    purse: number
}

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

    const map = lineItemMap

    const token = await retrieveToken()

    const contents = await parseRssFeed()
    const $ = cheerio.load(contents)

    const listItems = $('item')

    // @ts-ignore
    listItems.each(async (idx, el) => {
        const game = $(el).children('title').text().split('Jackpot for ')[1]
        const purse = parseFloat($(el).children('description').text().split(': $')[1].split(" ")[0].replace(",", ""))
        let sendEmail = false
        let status = CAMPAIGN_DEACTIVATED_TEXT
        let backgroundColor = 'background-color: rgb(128, 128, 1await toggleLineItemState(token, lineItemMap.get(Games.MEGA_MILLIONS_LOW), config.advertiserId, GameState.ACTIVE)28);'

        if (game === 'Mega Millions') {
            const game = 'Mega Millions'

            const megaLineItemLowStateRequest = await getLineItemById(token, lineItemMap.get(Games.MEGA_MILLIONS_LOW))
            const megaLineItemLowState = megaLineItemLowStateRequest.response["line-item"].state
            const megaLineItemHighStateRequest = await getLineItemById(token, lineItemMap.get(Games.MEGA_MILLIONS_HIGH))
            const megaLineItemHighState = megaLineItemHighStateRequest.response["line-item"].state


            if (purse >= 250 && purse < 400) {
                backgroundColor = ACTIVATED_CAMPAIGN_STYLE
                status = CAMPAIGN_ACTIVATED_TEXT

                await toggleLineItemState(token, lineItemMap.get(Games.MEGA_MILLIONS_LOW), config.advertiserId, GameState.ACTIVE)

                if (megaLineItemLowState !== GameState.ACTIVE) {
                    sendEmail = true
                }

                console.log(`Activate MEGA_MILLIONS_LOW ${purse}`)

            } else if (purse < 250) {
                status = CAMPAIGN_DEACTIVATED_TEXT

                await toggleLineItemState(token, lineItemMap.get(Games.MEGA_MILLIONS_LOW), config.advertiserId, GameState.INACTIVE)

                if (megaLineItemLowState !== GameState.INACTIVE) {
                    sendEmail = true
                }

                console.log(`Dectivate MEGA_MILLIONS_LOW ${purse}`)
            }

            if (purse >= 400 && purse <= 550) {
                status = CAMPAIGN_ACTIVATED_TEXT
                backgroundColor = ACTIVATED_CAMPAIGN_STYLE

                await toggleLineItemState(token, lineItemMap.get(Games.MEGA_MILLIONS_HIGH), config.advertiserId, GameState.ACTIVE)

                if (megaLineItemHighState !== GameState.ACTIVE) {
                    sendEmail = true
                }

                console.log(`Activate MEGA_MILLIONS_HIGH ${purse}`)

            } else if (purse > 500) {
                status = CAMPAIGN_DEACTIVATED_TEXT

                await toggleLineItemState(token, lineItemMap.get(Games.MEGA_MILLIONS_HIGH), config.advertiserId, GameState.INACTIVE)

                if (megaLineItemHighState !== GameState.INACTIVE) {
                    sendEmail = true
                }

                console.log(`Dectivate MEGA_MILLIONS_HIGH ${purse}`)
            }
        }

        if (game === 'Powerball') {
            const game = 'Powerball'

            const powerballItemLowStateRequest = await getLineItemById(token, lineItemMap.get(Games.POWERBALL_LOW))
            const powerballItemLowState = powerballItemLowStateRequest.response["line-item"].state
            const powerballItemHighStateRequest = await getLineItemById(token, lineItemMap.get(Games.POWERBALL_HIGH))
            const powerballItemHighState = powerballItemHighStateRequest.response["line-item"].state

            if (purse >= 250 && purse < 400) {
                status = CAMPAIGN_ACTIVATED_TEXT
                backgroundColor = ACTIVATED_CAMPAIGN_STYLE

                await toggleLineItemState(token, lineItemMap.get(Games.POWERBALL_LOW),config.advertiserId, GameState.ACTIVE)

                if (powerballItemLowState !== GameState.ACTIVE) {
                    sendEmail = true
                }

                console.log(`Activate POWERBALL_LOW ${purse}`)

            } else if (purse < 250) {
                status = CAMPAIGN_DEACTIVATED_TEXT

                console.log(`Deactivate POWERBALL_LOW ${purse}`)

                await toggleLineItemState(token, lineItemMap.get(Games.POWERBALL_LOW),config.advertiserId, GameState.INACTIVE)

                if (powerballItemLowState !== GameState.INACTIVE) {
                    sendEmail = true
                }
            }

            if (purse >= 400 && purse <= 550) {
                status = CAMPAIGN_ACTIVATED_TEXT
                backgroundColor = ACTIVATED_CAMPAIGN_STYLE

                await toggleLineItemState(token, lineItemMap.get(Games.POWERBALL_HIGH),config.advertiserId, GameState.ACTIVE)

                if (powerballItemHighState !== GameState.INACTIVE) {
                    sendEmail = true
                }

                console.log(`Activate POWERBALL_HIGH ${purse}`)

            } else if (purse > 550) {
                status = CAMPAIGN_DEACTIVATED_TEXT

                await toggleLineItemState(token, lineItemMap.get(Games.POWERBALL_HIGH),config.advertiserId, GameState.INACTIVE)

                if (powerballItemHighState !== GameState.INACTIVE) {
                    sendEmail = true
                }

                console.log(`Deactivate POWERBALL_HIGH ${purse}`)
            }
        }

        const mailContent: MailContainer = {
            campaignName: "Hoosier Lottery",
            status,
            game,
            backgroundColor,
            purse
        }

        if (sendEmail) {
            await buildEmail(mailContent)
        }
    })

    return null
}

export async function buildEmail(mailContent: MailContainer) {
    const source = fs.readFileSync("./server/templates/email.handlebars", 'utf-8');
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
        to: 'damon@kortx.io',
        subject: 'KORTX AdFire Campaign Notification',
        html: htmlToSend
    },
        (err: Error|null, info: SentMessageInfo) => {
            console.log(err)
        })
}