if (!process.execArgv.includes('--check')) {
 const {chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
 const launch=chromium.launch.bind(chromium);
 chromium.launch=(opts={})=>launch({...opts,executablePath:'/usr/bin/chromium'});
}
