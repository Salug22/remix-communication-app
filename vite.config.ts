import {vitePlugin as remix} from "@remix-run/dev";
import {defineConfig, loadEnv} from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import {remixPWA} from '@remix-pwa/dev'

const env = loadEnv(mode, process.cwd(), '');


declare module "@remix-run/node" {
    interface Future {
        v3_singleFetch: true;
    }
}

export default defineConfig({
    define: {
        'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY)
    },
    plugins: [
        remixPWA(),
        remix({
            future: {
                v3_fetcherPersist: true,
                v3_relativeSplatPath: true,
                v3_throwAbortReason: true,
                v3_singleFetch: true,
                v3_lazyRouteDiscovery: true,
            },
        }),
        tsconfigPaths(),
    ],
});
