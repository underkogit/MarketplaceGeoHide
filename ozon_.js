// ==UserScript==
// @name         Remove Ozon Geo Item
// @namespace    http://tampermonkey.net/
// @version      2026-04-21
// @description  Remove Ozon Geo Item
// @match        https://www.ozon.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ozon.ru
// @grant        none
// ==/UserScript==

(function () {
   "use strict";

   const nestedSelector = "div.uw_i0a.uw_ha7 > div.uw_ai0.uw_a1i";

   function removeEl(el) {
      try {
         el.remove();
         console.log("removed:", el);
         return true;
      } catch (e) {
         console.warn("remove failed", e);
         return false;
      }
   }

   function queryAllDeep(selector, root = document) {
      const results = Array.from(root.querySelectorAll(selector));
      const walker = document.createTreeWalker(
         root,
         NodeFilter.SHOW_ELEMENT,
         null,
         false,
      );
      let node;
      while ((node = walker.nextNode())) {
         const sr = node.shadowRoot;
         if (sr) results.push(...queryAllDeep(selector, sr));
      }
      return results;
   }

   const initial = queryAllDeep(nestedSelector);
   if (initial.length) initial.forEach(removeEl);

   const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
         for (const n of m.addedNodes) {
            if (!(n instanceof Element)) continue;
            if (n.matches && n.matches(nestedSelector)) removeEl(n);
            queryAllDeep(nestedSelector, n).forEach(removeEl);
            if (n.shadowRoot)
               queryAllDeep(nestedSelector, n.shadowRoot).forEach(removeEl);
         }
      }
      queryAllDeep(nestedSelector).forEach(removeEl);
   });

   mo.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
   });

   let tries = 0;
   const interval = setInterval(() => {
      queryAllDeep(nestedSelector).forEach(removeEl);
      if (++tries > 20) {
         clearInterval(interval);
         mo.disconnect();
      }
   }, 500);
})();
