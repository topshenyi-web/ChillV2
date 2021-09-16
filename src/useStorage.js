/* global chrome */
import React, { useEffect, useState, useCallback } from "react";

let data = {
  blocked_sites: {
    "discord.com": {
      currently_blocked: true,
      date_blocked: 1622587544591,
    },
    "test.com": {
      currently_blocked: true,
      date_blocked: 1622566475429,
      request: {
        end_time: 1631393287202,
        message: "sgfdfgsdfgsdgdsfgdfsgdfgsdfgsdfgsdgsdfg",
        reward_time: 2606640000,
        time_created: 1622566548493,
      },
    },
    "x.com": {
      currently_blocked: false,
      date_blocked: 1622494132514,
      reblock: 1631393912406,
    },
    "y.co": {
      currently_blocked: true,
      date_blocked: 1622732278244,
    },
  },
};
const getURL = function () {
  return new Promise((re) => {
    if (chrome.windows) {
      chrome.windows.getCurrent((w) => {
        chrome.tabs.query({ active: true, windowId: w.id }, (tabs) => {
          let url = new URL(tabs[0].url).hostname.replace("www.", "");
          re(url);
        });
      });
    } else {
      re("discord.com");
    }
  });
};
const useStorage = ({ showMessage }) => {
  let [blockedSites, setBlockedSites] = useState(undefined);
  let [currentSiteUrl, setCurrentSiteUrl] = useState(undefined);
  const listenForUpdates = () => {
    chrome.storage?.onChanged.addListener(function (changes) {
      for (let [key, { newValue }] of Object.entries(changes)) {
        if (key === "blocked_sites") {
          setBlockedSites(newValue);
        }
      }
    });
  };

  const sendMessage = function (type, data) {
    data.type = type;
    console.log("sending", type, data);
    if (!chrome.runtime) {
      return;
    }
    chrome.runtime.sendMessage(data, function (response) {
      showMessage(response);
    });
  };

  const getDataFromKey = function (key) {
    return new Promise((re) => {
      if (chrome.storage) {
        chrome.storage.sync.get([key], function (result) {
          re(result[key] || {});
        });
      } else {
        re(data[key]);
      }
    });
  };
  const init = async () => {
    console.log("ca");
    setBlockedSites(await getDataFromKey("blocked_sites"));
    setCurrentSiteUrl(await getURL());
    listenForUpdates();
  };

  const blockSite = function (URL) {
    sendMessage("block_site", {
      URL: URL,
    });
  };
  init();
  return {
    currentSiteUrl,
    blockedSites,
    blockSite,
  };
};
export default useStorage;