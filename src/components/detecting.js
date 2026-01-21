import { useEffect } from "react";

const DetectingDevtools = () => {

    useEffect(() => {
        if (process.env.NODE_ENV !== "production") return;

        const devtoolsLoop = () => {
            debugger;
            setTimeout(devtoolsLoop, 50);
        };
        devtoolsLoop();
    }, []);
}

export default DetectingDevtools;