export enum Games {
    POWERBALL_LOW = "Powerball Low",
    POWERBALL_HIGH = "Powerball High",
    MEGA_MILLIONS_LOW = "Mega Millions Low",
    MEGA_MILLIONS_HIGH = "Mega Millions High"
}

export enum GameState {
    INACTIVE = "inactive",
    ACTIVE = "active"
}

export const LOTTERY_URL = 'https://hoosierlottery.com/rss/jackpots/'
export const CAMPAIGN_ACTIVATED_TEXT = "Campaign Activated"
export const CAMPAIGN_DEACTIVATED_TEXT = "Campaign Deactivated"
export const ACTIVATED_CAMPAIGN_STYLE = "background-color: rgb(52, 189, 145);"
export const lineItemMap = new Map()
lineItemMap.set(Games.POWERBALL_LOW, 19636644)
lineItemMap.set(Games.POWERBALL_HIGH, 18599660)
lineItemMap.set(Games.MEGA_MILLIONS_LOW, 19630973)
lineItemMap.set(Games.MEGA_MILLIONS_HIGH, 18599661)
