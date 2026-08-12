/* Smoke test only: validates adapter source shape without touching app state. */
(()=>{const required=["load","cleanStats","insights","rows"];window.__rfAdapterSmokeTest=()=>required.every(k=>window.RFantasyPage&&typeof window.RFantasyPage[k]==="function")})();
