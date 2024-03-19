export const showRewardAd = (callback = () => {}) => {
  var googletag = window.googletag || { cmd: [] };

  let rewardedSlot = null;
  let rewardPayload = null;

  googletag.cmd.push(() => {
    rewardedSlot = googletag.defineOutOfPageSlot("/22639388115/rewarded_web_example", googletag.enums.OutOfPageFormat.REWARDED);

    // Slot returns null if the page or device does not support rewarded ads.
    if (rewardedSlot) {
      rewardedSlot.addService(googletag.pubads());

      googletag.pubads().addEventListener("rewardedSlotReady", (event) => {
        event.makeRewardedVisible();
      });

      const slotRenderEnded = (event) => {
        if (event.slot === rewardedSlot && event.isEmpty) {
          callback({ success: true, message: "No ad returned for rewarded ad slot." });
        }
      };

      const rewardGenerated = (event) => {
        rewardPayload = event.payload;
        closeRewardAd();
      };

      const closeRewardAd = () => {
        if (rewardedSlot) {
          googletag.destroySlots([rewardedSlot]);
        }
        if (rewardPayload) {
          rewardPayload = null;
          callback({ success: true, message: "Reward has been granted." });
        } else {
          callback({ success: false, message: "Rewarded ad has been closed." });
        }

        googletag.pubads().removeEventListener("slotRenderEnded", slotRenderEnded);
        googletag.pubads().removeEventListener("rewardedSlotClosed", closeRewardAd);
        googletag.pubads().removeEventListener("rewardedSlotGranted", rewardGenerated);
      };

      googletag.pubads().addEventListener("slotRenderEnded", slotRenderEnded);
      googletag.pubads().addEventListener("rewardedSlotClosed", closeRewardAd);
      googletag.pubads().addEventListener("rewardedSlotGranted", rewardGenerated);

      googletag.enableServices();
      googletag.display(rewardedSlot);
    } else {
      callback({ success: true, message: "Rewarded ads are not supported on this page." });
    }
  });
};
