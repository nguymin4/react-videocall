import React from "react";
import { H1 } from "./components/Typography";

const Countdown = ({ count = 5 }) => {
    console.log("countdown");
    const [countdown, setCountdown] = React.useState(count);
    React.useEffect(() => {
        if (countdown !== 0)
            setTimeout(() => {
                setCountdown(countdown - 1);
                console.log(countdown);
            }, 1000);
    }, [countdown]);
    if (countdown === 0) return null;
    return <H1>{ countdown }</H1>;
};
export default Countdown;
