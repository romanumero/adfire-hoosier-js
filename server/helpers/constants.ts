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

export const emailTemplate = `<div class="email-wrapper" style="box-sizing: border-box; margin: 0px; padding: 20px 5px; font-family: &quot;Trebuchet MS&quot;, &quot;Lucida Grande&quot;, &quot;Lucida Sans Unicode&quot;, &quot;Lucida Sans&quot;, Tahoma, sans-serif; color: rgb(59, 63, 73); font-size: 16px; line-height: 1.4;">
  <div class="email-content-wrapper" style="box-sizing: border-box; max-width: 700px; margin-right: auto; margin-left: auto; border-radius: 20px;">
    <div class="row center" style="box-sizing: border-box; margin-bottom: 40px; text-align: center;">
      <div style="box-sizing: border-box;"><a class="brand-logo w-inline-block" href="https://sendbox-template.webflow.io/" style="box-sizing: border-box; background-color: transparent; color: rgb(109, 148, 255); text-decoration-line: none; max-width: 100%; display: inline-block;"><img alt="" height="36" src="https://labs-ktx-prod.s3.amazonaws.com/images/ktx-md-blue.png" style="box-sizing: border-box; border-width: 0px; border-style: initial; max-width: 100%; vertical-align: middle; display: inline-block;" /></a></div>
    </div>
    <div class="row-light" style="box-sizing: border-box; margin-bottom: 40px; padding: 20px; border-radius: 15px; background-color: rgb(245, 245, 245);">
      <div class="hero-image center" style="box-sizing: border-box; text-align: center; overflow: hidden; margin-bottom: 20px; border-radius: 15px;"><img alt="" src="https://labs-ktx-prod.s3.amazonaws.com/images/adfire-circle.png" style="box-sizing: border-box; border: 0px; max-width: 100%; vertical-align: middle; display: inline-block;" width="100" /></div>
      <div class="row-content center row" style="box-sizing: border-box; margin-bottom: 40px; text-align: center; max-width: 500px; margin-right: auto; margin-left: auto;">
        <div class="label" style="box-sizing: border-box; margin-bottom: 5px; color: rgb(109, 148, 255); font-size: 12px; font-weight: 700; text-transform: uppercase;">CAMPAIGN NOTIFICATIONS</div>
        <h2 style="box-sizing: border-box; font-weight: bold; margin-bottom: 10px; font-size: 28px; line-height: 36px; margin-top: 0px;"> {{campaignName}} </h2>
        <p style="box-sizing: border-box; margin-top: 0px; margin-bottom: 20px; color: rgb(101, 106, 119);">This message is to notify you of updates and activity regarding your AdFire trigger campaign.</p>
        <a class="button-large w-button" href="https://sendbox-template.webflow.io/" style=" {{ backgroundColor }} box-sizing: border-box; color: rgb(255, 255, 255); text-decoration-line: none; display: inline-block; padding: 15px 30px; border: 0px; line-height: inherit; cursor: pointer; border-radius: 10px; width: 320px; max-width: 320px; font-weight: 700;"> {{campaignStatusMessage}} </a></div>
      <div class="center" style="box-sizing: border-box; text-align: center;">
        <div class="date-time-window" style="box-sizing: border-box; display: inline-block; width: 250px; margin-right: 10px; margin-bottom: 20px; margin-left: 10px; padding: 20px; border-radius: 15px; background-color: rgb(255, 255, 255);">
          <div class="label-light" style="box-sizing: border-box; margin-bottom: 5px; color: rgb(150, 156, 170); font-size: 12px; font-weight: 700; text-transform: uppercase;">TRIGGER</div>
          <h4 style="box-sizing: border-box; font-weight: bold; margin-bottom: 5px; font-size: 18px; line-height: 24px; margin-top: 0px;"> {{game}} </h4>
        </div>
        <div class="date-time-window" style="box-sizing: border-box; display: inline-block; width: 250px; margin-right: 10px; margin-bottom: 20px; margin-left: 10px; padding: 20px; border-radius: 15px; background-color: rgb(255, 255, 255);">
          <div class="label-light" style="box-sizing: border-box; margin-bottom: 5px; color: rgb(150, 156, 170); font-size: 12px; font-weight: 700; text-transform: uppercase;">PURSE</div>
          <h4 style="box-sizing: border-box; font-weight: bold; margin-bottom: 5px; font-size: 18px; line-height: 24px; margin-top: 0px;">{{purse}}</h4>
        </div>
        <div class="text-small row-content" style="box-sizing: border-box; color: rgb(101, 106, 119); font-size: 14px; max-width: 500px; margin-right: auto; margin-left: auto;">You can&nbsp;<a href="mailto:adfire@kortx.io?subject=Trigger Update Needed" style="box-sizing: border-box; background-color: transparent; color: rgb(109, 148, 255); text-decoration-line: none;">update</a>&nbsp;your triggers at any time.</div>
      </div>
    </div>
    <div class="row" style="box-sizing: border-box; margin-bottom: 40px;">
      <div class="social-links center text-small" style="box-sizing: border-box; text-align: center; color: rgb(101, 106, 119); font-size: 0px; margin-bottom: 20px;"><a class="social-icon w-inline-block" href="https://www.facebook.com/kortxio" style="box-sizing: border-box; background-color: rgb(245, 245, 245); color: rgb(109, 148, 255); text-decoration-line: none; max-width: 100%; display: inline-block; margin-right: 10px; margin-left: 10px; padding: 10px; border-radius: 20px;" target="_blank"><img alt="" src="https://uploads-ssl.webflow.com/5defcc029f7f67880aee42f2/5e3053097479fd66eefea82c_icons8-facebook-f-64.png" style="box-sizing: border-box; border-width: 0px; border-style: initial; max-width: 100%; vertical-align: middle; display: inline-block;" width="20" /></a><a class="social-icon w-inline-block" href="https://www.instagram.com/kortxio" style="box-sizing: border-box; background-color: rgb(245, 245, 245); color: rgb(109, 148, 255); text-decoration-line: none; max-width: 100%; display: inline-block; margin-right: 10px; margin-left: 10px; padding: 10px; border-radius: 20px;"><img alt="" src="https://uploads-ssl.webflow.com/5defcc029f7f67880aee42f2/5e305326129a157e50946770_icons8-instagram-64.png" style="box-sizing: border-box; border-width: 0px; border-style: initial; max-width: 100%; vertical-align: middle; display: inline-block;" width="20" /></a><a class="social-icon w-inline-block" href="https://twitter.com/kortxio" style="box-sizing: border-box; background-color: rgb(245, 245, 245); color: rgb(109, 148, 255); text-decoration-line: none; max-width: 100%; display: inline-block; margin-right: 10px; margin-left: 10px; padding: 10px; border-radius: 20px;"><img alt="" src="https://uploads-ssl.webflow.com/5defcc029f7f67880aee42f2/5e305333129a1582bc94685d_icons8-twitter-64.png" style="box-sizing: border-box; border-width: 0px; border-style: initial; max-width: 100%; vertical-align: middle; display: inline-block;" width="20" /></a></div>
      <div class="center" style="box-sizing: border-box; text-align: center;">
        <div class="text-light text-small" style="box-sizing: border-box; color: rgb(150, 156, 170); font-size: 14px;">Crafted with &hearts; by&nbsp;<strong style="box-sizing: border-box;">KORTX</strong></div>
        <div class="text-small text-light" style="box-sizing: border-box; color: rgb(150, 156, 170); font-size: 14px;">KORTX, 2583 Sunnyknoll Avenue, Berkley, MI 48072</div>
        <div class="footer-link-buttons" style="box-sizing: border-box; margin-top: 20px;"><a class="button-small-light" href="https://kortx.io/" style="box-sizing: border-box; background-color: rgb(245, 245, 245); color: rgb(150, 156, 170); text-decoration-line: none; display: inline-block; margin-right: 5px; margin-left: 5px; padding: 5px 10px; border-radius: 5px; font-size: 12px;" target="_blank">www.kortx.io</a></div>
      </div>
    </div>
  </div>
</div>`
