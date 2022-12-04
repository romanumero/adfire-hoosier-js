export enum Games {
    POWERBALL_LOW,
    POWERBALL_HIGH,
    MEGA_MILLIONS_LOW,
    MEGA_MILLIONS_HIGH
}

export const LOTTERY_URL = 'https://hoosierlottery.com/rss/jackpots/'

export const lineItemMap = new Map()
lineItemMap.set(Games.POWERBALL_LOW, 19636644)
lineItemMap.set(Games.POWERBALL_HIGH, 18599660)
lineItemMap.set(Games.MEGA_MILLIONS_LOW, 19630973)
lineItemMap.set(Games.MEGA_MILLIONS_HIGH, 18599661)
