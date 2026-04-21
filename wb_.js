// ==UserScript==
// @name         Remove Wildberries Geo Item
// @namespace    http://tampermonkey.net/
// @version      2026-04-21
// @description  Remove Wildberries Geo Item
// @match        https://www.wildberries.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wildberries.ru
// @grant        none
// ==/UserScript==

(function () {
   "use strict";

   const selector =
      "#header > div > div.header__top > ul > li.simple-menu__item.simple-menu__item--geo.j-geocity-wrap.hide-mobile > span";

   function removeEl(el) {
      try {
         el.remove();
         console.log("Removed geo element:", el);
         return true;
      } catch (e) {
         console.warn("Failed to remove element:", e);
         return false;
      }
   }

   function queryAllDeep(sel, root = document) {
      const results = Array.from(root.querySelectorAll(sel));
      const walker = document.createTreeWalker(
         root,
         NodeFilter.SHOW_ELEMENT,
         null,
         false,
      );
      let node;
      while ((node = walker.nextNode())) {
         if (node.shadowRoot)
            results.push(...queryAllDeep(sel, node.shadowRoot));
      }
      return results;
   }

   queryAllDeep(selector).forEach(removeEl);

   const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
         for (const n of m.addedNodes) {
            if (!(n instanceof Element)) continue;
            if (n.matches && n.matches(selector)) removeEl(n);
            queryAllDeep(selector, n).forEach(removeEl);
            if (n.shadowRoot)
               queryAllDeep(selector, n.shadowRoot).forEach(removeEl);
         }
      }
      queryAllDeep(selector).forEach(removeEl);
   });

   mo.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
   });

   let tries = 0;
   const interval = setInterval(() => {
      queryAllDeep(selector).forEach(removeEl);
      if (++tries > 20) {
         clearInterval(interval);
         mo.disconnect();
      }
   }, 500);
})();
