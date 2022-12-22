export enum Games {
    POWERBALL_LOW = "Powerball Low",
    POWERBALL_HIGH = "Powerball High",
    MEGA_MILLIONS_LOW = "Mega Millions Low",
    MEGA_MILLIONS_HIGH = "Mega Millions High",
    HOOSIER_LOTTO = "Hoosier Lotto",
    CASH5 = "CA$H 5"
}

export enum GameNames {
    POWERBALL = "Powerball",
    MEGA_MILLIONS = "Mega Millions",
    HOOSIER_LOTTO = "Hoosier Lotto",
    CASH5 = "CA$H 5",
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
lineItemMap.set(Games.POWERBALL_LOW, 19823553)
//lineItemMap.set(Games.POWERBALL_LOW, 19636644)
//19823553
lineItemMap.set(Games.POWERBALL_HIGH, 19823554)
//lineItemMap.set(Games.POWERBALL_HIGH, 18599660)
//19823554
lineItemMap.set(Games.MEGA_MILLIONS_LOW, 19823552)
//lineItemMap.set(Games.MEGA_MILLIONS_LOW, 19630973)
//19823552
lineItemMap.set(Games.MEGA_MILLIONS_HIGH, 19823551)
//lineItemMap.set(Games.MEGA_MILLIONS_HIGH, 18599661)
//19823551
lineItemMap.set(Games.HOOSIER_LOTTO, 18599659)

lineItemMap.set(Games.CASH5, 18599662)
